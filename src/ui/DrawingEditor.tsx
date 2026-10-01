import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  alphaBounds,
  appendPoint,
  drawStrokes,
  isMeaningful,
  PALETTE,
  WIDTHS,
  type Stroke,
  type Tool,
} from '../drawing/model';
import type { Vec2 } from '../geometry';
import {
  BackIcon,
  CheckIcon,
  EllipseIcon,
  EraserIcon,
  PenIcon,
  RectIcon,
  TrashIcon,
  TriangleIcon,
  UndoIcon,
} from './icons';

/** Auflösung, in der die fertige Zeichnung gespeichert wird. */
const EXPORT_PX = 800;

export interface DrawingResult {
  image: string;
  width: number;
  height: number;
}

export interface DrawingBackground {
  image: CanvasImageSource;
  width: number;
  height: number;
}

interface Props {
  onSave: (r: DrawingResult) => void;
  onCancel: () => void;
  /**
   * Hintergrundbild zum Übermalen (z. B. Zielfigur oder Motiv). Mit
   * Hintergrund wird das Ergebnis in dessen Größe gespeichert, nicht
   * zugeschnitten; der Radierer entfernt nur Gemaltes.
   */
  background?: DrawingBackground;
}

/** Lage des Hintergrunds in der quadratischen Zeichenfläche (normiert). */
function backgroundRect(bg: DrawingBackground): { x: number; y: number; w: number; h: number } {
  const a = bg.width / bg.height;
  return a >= 1 ? { x: 0, y: (1 - 1 / a) / 2, w: 1, h: 1 / a } : { x: (1 - a) / 2, y: 0, w: a, h: 1 };
}

/** Exportiert Hintergrund plus Gemaltes in Originalgröße des Hintergrunds. */
function exportWithBackground(strokes: Stroke[], bg: DrawingBackground): DrawingResult {
  const r = backgroundRect(bg);
  const layer = document.createElement('canvas');
  layer.width = bg.width;
  layer.height = bg.height;
  const lg = layer.getContext('2d')!;
  lg.setTransform(bg.width / r.w, 0, 0, bg.height / r.h, (-r.x * bg.width) / r.w, (-r.y * bg.height) / r.h);
  drawStrokes(lg, strokes);
  const out = document.createElement('canvas');
  out.width = bg.width;
  out.height = bg.height;
  const g = out.getContext('2d')!;
  g.drawImage(bg.image, 0, 0, bg.width, bg.height);
  g.drawImage(layer, 0, 0);
  return { image: out.toDataURL('image/png'), width: bg.width, height: bg.height };
}

const TOOLS: Array<{ id: Tool; label: string; icon: ReactNode }> = [
  { id: 'pen', label: 'Stift', icon: <PenIcon /> },
  { id: 'eraser', label: 'Radierer', icon: <EraserIcon /> },
  { id: 'rect', label: 'Rechteck', icon: <RectIcon /> },
  { id: 'ellipse', label: 'Kreis', icon: <EllipseIcon /> },
  { id: 'triangle', label: 'Dreieck', icon: <TriangleIcon /> },
];

/** Exportiert die Zeichnung auf den Inhalt zugeschnitten (transparenter Hintergrund). */
export function exportDrawing(strokes: Stroke[]): DrawingResult | null {
  const c = document.createElement('canvas');
  c.width = EXPORT_PX;
  c.height = EXPORT_PX;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.setTransform(EXPORT_PX, 0, 0, EXPORT_PX, 0, 0);
  drawStrokes(g, strokes);
  const b = alphaBounds(g.getImageData(0, 0, EXPORT_PX, EXPORT_PX).data, EXPORT_PX, EXPORT_PX);
  if (!b) return null;
  const m = Math.round(EXPORT_PX * 0.02);
  const out = document.createElement('canvas');
  out.width = b.w + 2 * m;
  out.height = b.h + 2 * m;
  out.getContext('2d')!.drawImage(c, b.x - m, b.y - m, out.width, out.height, 0, 0, out.width, out.height);
  return { image: out.toDataURL('image/png'), width: out.width, height: out.height };
}

/** Einfaches Zeichenwerkzeug: Stift, Radierer, Formen, Farben. */
export function DrawingEditor({ onSave, onCancel, background }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(PALETTE[1]);
  const [width, setWidth] = useState(WIDTHS[1]);
  const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const frame = useRef(0);
  const layerRef = useRef<HTMLCanvasElement | null>(null);
  const bgRef = useRef(background);
  bgRef.current = background;

  const redraw = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const c = canvasRef.current;
      if (!c) return;
      const g = c.getContext('2d')!;
      // Gemaltes auf eigener Ebene, damit der Radierer den Hintergrund nicht löscht.
      const layer = (layerRef.current ??= document.createElement('canvas'));
      if (layer.width !== c.width || layer.height !== c.height) {
        layer.width = c.width;
        layer.height = c.height;
      }
      const lg = layer.getContext('2d')!;
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.clearRect(0, 0, layer.width, layer.height);
      lg.setTransform(c.width, 0, 0, c.height, 0, 0);
      const all = current.current ? [...strokesRef.current, current.current.stroke] : strokesRef.current;
      drawStrokes(lg, all);

      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      const bg = bgRef.current;
      if (bg) {
        const r = backgroundRect(bg);
        g.drawImage(bg.image, r.x * c.width, r.y * c.height, r.w * c.width, r.h * c.height);
      }
      g.drawImage(layer, 0, 0);
    });
  };

  useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    const c = canvasRef.current!;
    const ro = new ResizeObserver(() => {
      const size = Math.floor(Math.min(wrap.clientWidth, wrap.clientHeight));
      const dpr = window.devicePixelRatio || 1;
      c.style.width = `${size}px`;
      c.style.height = `${size}px`;
      c.width = Math.round(size * dpr);
      c.height = Math.round(size * dpr);
      redraw();
    });
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, []);

  useLayoutEffect(redraw, [strokes]);

  const point = (e: React.PointerEvent): Vec2 => {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (current.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    const stroke: Stroke =
      tool === 'pen' || tool === 'eraser'
        ? { kind: 'path', color, width: tool === 'eraser' ? width * 2 : width, points: [p], erase: tool === 'eraser' }
        : { kind: tool, color, from: p, to: p };
    current.current = { pointerId: e.pointerId, stroke };
    redraw();
  };

  const onMove = (e: React.PointerEvent) => {
    const cur = current.current;
    if (!cur || cur.pointerId !== e.pointerId) return;
    const p = point(e);
    const s = cur.stroke;
    cur.stroke = s.kind === 'path' ? { ...s, points: appendPoint(s.points, p) } : { ...s, to: p };
    redraw();
  };

  const onUp = (e: React.PointerEvent) => {
    const cur = current.current;
    if (!cur || cur.pointerId !== e.pointerId) return;
    current.current = null;
    if (isMeaningful(cur.stroke)) setStrokes((all) => [...all, cur.stroke]);
    else redraw();
  };

  const save = () => {
    const r = background ? exportWithBackground(strokes, background) : exportDrawing(strokes);
    if (r) onSave(r);
  };

  const hasContent = !!background || strokes.some((s) => s.kind !== 'path' || !s.erase);

  return (
    <div className="screen">
      <main className="work">
        <div ref={wrapRef} className="mirror-wrap">
          <canvas
            ref={canvasRef}
            className="draw-canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </div>
      </main>
      <aside className="side draw-side">
        <div className="side-top">
          <button className="tool-btn" aria-label="Abbrechen" onClick={onCancel}>
            <BackIcon />
          </button>
          <button className="tool-btn save-btn" aria-label="Motiv speichern" disabled={!hasContent} onClick={save}>
            <CheckIcon />
          </button>
        </div>
        <div className="tool-row" role="radiogroup" aria-label="Werkzeug">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={tool === t.id}
              aria-label={t.label}
              className={`tool-btn ${tool === t.id ? 'on' : ''}`}
              onClick={() => setTool(t.id)}
            >
              {t.icon}
            </button>
          ))}
        </div>
        <div className="swatches" role="radiogroup" aria-label="Farbe">
          {PALETTE.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={`Farbe ${c}`}
              className={`swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="tool-row" role="radiogroup" aria-label="Strichstärke">
          {WIDTHS.map((w, i) => (
            <button
              key={w}
              role="radio"
              aria-checked={width === w}
              aria-label={['dünn', 'mittel', 'dick'][i]}
              className={`tool-btn ${width === w ? 'on' : ''}`}
              onClick={() => setWidth(w)}
            >
              <span className="width-dot" style={{ width: 6 + i * 7, height: 6 + i * 7 }} />
            </button>
          ))}
        </div>
        <div className="tool-row">
          <button
            className="tool-btn"
            aria-label="Rückgängig"
            disabled={!strokes.length}
            onClick={() => setStrokes((s) => s.slice(0, -1))}
          >
            <UndoIcon />
          </button>
          <button className="tool-btn" aria-label="Alles löschen" disabled={!strokes.length} onClick={() => setStrokes([])}>
            <TrashIcon />
          </button>
        </div>
      </aside>
    </div>
  );
}
