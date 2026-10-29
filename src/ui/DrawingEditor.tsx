import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { alphaBounds, appendPoint, PALETTE, WIDTHS } from '../drawing/model';
import {
  createShape,
  drawElements,
  drawSelection,
  bringForward,
  sendBackward,
  duplicate,
  eraseAt,
  handleAt,
  pathFromWorld,
  resizeByHandle,
  rotationTowards,
  topElementAt,
  type DrawElement,
  type DrawingDoc,
  type HandleId,
  type ShapeKind,
} from '../drawing/elements';
import type { Vec2 } from '../geometry';
import {
  BackIcon,
  BackwardIcon,
  BorderIcon,
  CheckIcon,
  CircleShapeIcon,
  CopyIcon,
  EquilateralTriangleIcon,
  EraserIcon,
  ForwardIcon,
  ParallelogramIcon,
  PenIcon,
  RightTriangleIcon,
  SelectIcon,
  SnapIcon,
  SquareShapeIcon,
  TrapezoidIcon,
  TrashIcon,
  UndoIcon,
} from './icons';

/** Auflösung, in der die fertige Zeichnung gespeichert wird. */
const EXPORT_PX = 800;
/** Greifbereich der Anfasser (CSS-Pixel). */
const HANDLE_TOUCH_PX = 22;
/** Radierer-Radius im Verhältnis zur Strichstärke. */
const ERASER_FACTOR = 1.2;

export interface DrawingResult {
  image: string;
  width: number;
  height: number;
  /** Die Elemente, damit sich die Zeichnung später weiterbearbeiten lässt. */
  doc: DrawingDoc;
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
   * zugeschnitten.
   */
  background?: DrawingBackground;
  /** Gespeicherte Zeichnung zum Weiterbearbeiten. */
  initial?: DrawingDoc;
}

type Tool = 'select' | 'pen' | 'eraser';

/** Lage des Hintergrunds in der quadratischen Zeichenfläche (normiert). */
function backgroundRect(bg: DrawingBackground): { x: number; y: number; w: number; h: number } {
  const a = bg.width / bg.height;
  return a >= 1 ? { x: 0, y: (1 - 1 / a) / 2, w: 1, h: 1 / a } : { x: (1 - a) / 2, y: 0, w: a, h: 1 };
}

/** Exportiert Hintergrund plus Gezeichnetes in Originalgröße des Hintergrunds. */
function exportWithBackground(elements: DrawElement[], bg: DrawingBackground): Omit<DrawingResult, 'doc'> {
  const r = backgroundRect(bg);
  const out = document.createElement('canvas');
  out.width = bg.width;
  out.height = bg.height;
  const g = out.getContext('2d')!;
  g.drawImage(bg.image, 0, 0, bg.width, bg.height);
  g.setTransform(bg.width / r.w, 0, 0, bg.height / r.h, (-r.x * bg.width) / r.w, (-r.y * bg.height) / r.h);
  drawElements(g, elements);
  return { image: out.toDataURL('image/png'), width: bg.width, height: bg.height };
}

/** Exportiert die Zeichnung auf den Inhalt zugeschnitten (transparenter Hintergrund). */
export function exportDrawing(elements: DrawElement[]): Omit<DrawingResult, 'doc'> | null {
  const c = document.createElement('canvas');
  c.width = EXPORT_PX;
  c.height = EXPORT_PX;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.setTransform(EXPORT_PX, 0, 0, EXPORT_PX, 0, 0);
  drawElements(g, elements);
  const b = alphaBounds(g.getImageData(0, 0, EXPORT_PX, EXPORT_PX).data, EXPORT_PX, EXPORT_PX);
  if (!b) return null;
  const m = Math.round(EXPORT_PX * 0.02);
  const out = document.createElement('canvas');
  out.width = b.w + 2 * m;
  out.height = b.h + 2 * m;
  out.getContext('2d')!.drawImage(c, b.x - m, b.y - m, out.width, out.height, 0, 0, out.width, out.height);
  return { image: out.toDataURL('image/png'), width: out.width, height: out.height };
}

const SHAPES: Array<{ id: ShapeKind; label: string; icon: ReactNode }> = [
  { id: 'square', label: 'Quadrat', icon: <SquareShapeIcon /> },
  { id: 'circle', label: 'Kreis', icon: <CircleShapeIcon /> },
  { id: 'rtriangle', label: 'Rechtwinkliges Dreieck', icon: <RightTriangleIcon /> },
  { id: 'etriangle', label: 'Gleichseitiges Dreieck', icon: <EquilateralTriangleIcon /> },
  { id: 'parallelogram', label: 'Parallelogramm', icon: <ParallelogramIcon /> },
  { id: 'trapezoid', label: 'Trapez', icon: <TrapezoidIcon /> },
];

type Drag =
  | { kind: 'move'; pointerId: number; start: DrawElement; from: Vec2 }
  | { kind: 'handle'; pointerId: number; start: DrawElement; handle: HandleId }
  | { kind: 'pen'; pointerId: number; points: Vec2[] }
  | { kind: 'erase'; pointerId: number; last: Vec2 };

/**
 * Zeichenwerkzeug: Formen einfügen und nachträglich verschieben, strecken,
 * stauchen, drehen, färben; Stift und Radierer (der nur Striche entfernt).
 */
export function DrawingEditor({ onSave, onCancel, background, initial }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawElement[]>(() => initial?.elements ?? []);
  const [history, setHistory] = useState<DrawElement[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [color, setColor] = useState(PALETTE[1]);
  const [width, setWidth] = useState(WIDTHS[1]);
  const [snap, setSnap] = useState(false);

  // Während des Ziehens wird nur gezeichnet; gespeichert wird beim Loslassen.
  const live = useRef<DrawElement[]>(elements);
  const drag = useRef<Drag | null>(null);
  const before = useRef<DrawElement[] | null>(null);
  const frame = useRef(0);
  const cssSize = useRef(1);
  const stateRef = useRef({ selectedId, tool, snap, color, width });
  stateRef.current = { selectedId, tool, snap, color, width };
  const bgRef = useRef(background);
  bgRef.current = background;

  const selected = elements.find((e) => e.id === selectedId) ?? null;

  const redraw = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const c = canvasRef.current;
      if (!c) return;
      const g = c.getContext('2d')!;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      const bg = bgRef.current;
      if (bg) {
        const r = backgroundRect(bg);
        g.drawImage(bg.image, r.x * c.width, r.y * c.height, r.w * c.width, r.h * c.height);
      }
      g.setTransform(c.width, 0, 0, c.height, 0, 0);
      const d = drag.current;
      const els = d?.kind === 'pen' ? [...live.current, pathFromWorld(d.points, stateRef.current.color, stateRef.current.width, 'draft')] : live.current;
      drawElements(g, els);
      const sel = live.current.find((e) => e.id === stateRef.current.selectedId);
      if (sel && stateRef.current.tool === 'select') drawSelection(g, sel, 1 / cssSize.current);
    });
  };

  useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    const c = canvasRef.current!;
    const ro = new ResizeObserver(() => {
      const size = Math.floor(Math.min(wrap.clientWidth, wrap.clientHeight));
      const dpr = window.devicePixelRatio || 1;
      cssSize.current = Math.max(size, 1);
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

  useLayoutEffect(() => {
    live.current = elements;
    redraw();
  }, [elements, selectedId, tool]);

  /** Neuer Stand mit Rückgängig-Schritt. */
  const commit = (next: DrawElement[], prev: DrawElement[] = elements) => {
    if (next === prev) return;
    setHistory((h) => [...h.slice(-49), prev]);
    setElements(next);
  };

  const updateSelected = (change: (e: DrawElement) => DrawElement) => {
    if (!selected) return;
    commit(elements.map((e) => (e.id === selected.id ? change(e) : e)));
  };

  const point = (e: React.PointerEvent): Vec2 => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const onDown = (e: React.PointerEvent) => {
    if (drag.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    const { tool: t, selectedId: selId, width: w } = stateRef.current;
    before.current = live.current;
    if (t === 'pen') {
      drag.current = { kind: 'pen', pointerId: e.pointerId, points: [p] };
    } else if (t === 'eraser') {
      drag.current = { kind: 'erase', pointerId: e.pointerId, last: p };
      live.current = eraseAt(live.current, p, w * ERASER_FACTOR);
    } else {
      const sel = live.current.find((x) => x.id === selId);
      const handle = sel ? handleAt(sel, p, HANDLE_TOUCH_PX / cssSize.current) : null;
      if (sel && handle !== null) {
        drag.current = { kind: 'handle', pointerId: e.pointerId, start: sel, handle };
      } else {
        const hit = topElementAt(live.current, p, 8 / cssSize.current);
        setSelectedId(hit?.id ?? null);
        stateRef.current.selectedId = hit?.id ?? null;
        if (hit) drag.current = { kind: 'move', pointerId: e.pointerId, start: hit, from: p };
      }
    }
    redraw();
  };

  const replaceLive = (el: DrawElement) => {
    live.current = live.current.map((x) => (x.id === el.id ? el : x));
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const p = point(e);
    if (d.kind === 'pen') {
      d.points = appendPoint(d.points, { x: Math.min(1, Math.max(0, p.x)), y: Math.min(1, Math.max(0, p.y)) });
    } else if (d.kind === 'erase') {
      // Zwischenpunkte, damit auch schnelle Bewegungen lückenlos radieren.
      const r = stateRef.current.width * ERASER_FACTOR;
      const steps = Math.max(1, Math.ceil(Math.hypot(p.x - d.last.x, p.y - d.last.y) / (r / 2)));
      for (let i = 1; i <= steps; i++) {
        live.current = eraseAt(live.current, { x: d.last.x + ((p.x - d.last.x) * i) / steps, y: d.last.y + ((p.y - d.last.y) * i) / steps }, r);
      }
      d.last = p;
    } else if (d.kind === 'move') {
      replaceLive({ ...d.start, cx: d.start.cx + p.x - d.from.x, cy: d.start.cy + p.y - d.from.y });
    } else if (d.handle === 'rotate') {
      replaceLive({ ...d.start, rot: rotationTowards(d.start, p, stateRef.current.snap ? 15 : undefined) });
    } else {
      replaceLive(resizeByHandle(d.start, d.handle, p));
    }
    redraw();
  };

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    const prev = before.current ?? elements;
    before.current = null;
    if (d.kind === 'pen') {
      const { color: c, width: w } = stateRef.current;
      commit([...prev, pathFromWorld(d.points, c, w)], prev);
    } else {
      commit(live.current, prev);
    }
    redraw();
  };

  const addShape = (k: ShapeKind) => {
    const s = createShape(k, color);
    commit([...elements, s]);
    setSelectedId(s.id);
    setTool('select');
  };

  const pickColor = (c: string) => {
    setColor(c);
    if (selected) updateSelected((e) => (e.type === 'shape' ? { ...e, fill: c } : { ...e, color: c }));
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setElements(prev);
    if (selectedId && !prev.some((e) => e.id === selectedId)) setSelectedId(null);
  };

  const save = () => {
    const r = background ? exportWithBackground(elements, background) : exportDrawing(elements);
    if (r) onSave({ ...r, doc: { version: 1, elements } });
  };

  const hasContent = !!background || elements.length > 0;
  const shape = selected?.type === 'shape' ? selected : null;
  const activeColor = selected ? (selected.type === 'shape' ? selected.fill : selected.color) : color;

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
          {(
            [
              ['select', 'Auswählen und bearbeiten', <SelectIcon key="s" />],
              ['pen', 'Stift', <PenIcon key="p" />],
              ['eraser', 'Radierer (nur Striche)', <EraserIcon key="e" />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              role="radio"
              aria-checked={tool === id}
              aria-label={label}
              title={label}
              className={`tool-btn ${tool === id ? 'on' : ''}`}
              onClick={() => {
                setTool(id);
                if (id !== 'select') setSelectedId(null);
              }}
            >
              {icon}
            </button>
          ))}
          <button
            className={`tool-btn ${snap ? 'on' : ''}`}
            aria-pressed={snap}
            aria-label="Drehen in 15°-Schritten"
            title="Drehen in 15°-Schritten"
            onClick={() => setSnap((s) => !s)}
          >
            <SnapIcon />
          </button>
        </div>

        <div className="tool-row shape-row" aria-label="Form einfügen">
          {SHAPES.map((s) => (
            <button key={s.id} className="tool-btn" aria-label={`${s.label} einfügen`} title={s.label} onClick={() => addShape(s.id)}>
              {s.icon}
            </button>
          ))}
        </div>

        <div className="swatches" role="radiogroup" aria-label={selected ? (shape ? 'Füllfarbe' : 'Strichfarbe') : 'Farbe'}>
          {PALETTE.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={activeColor === c}
              aria-label={`Farbe ${c}`}
              className={`swatch ${activeColor === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => pickColor(c)}
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

        {/* Bearbeiten des ausgewählten Elements; der Platz bleibt immer reserviert. */}
        <div className={`selection-tools ${selected ? '' : 'is-hidden'}`} aria-hidden={!selected}>
          <div className="tool-row">
            <button
              className={`tool-btn ${shape?.outline ? 'on' : ''}`}
              aria-pressed={!!shape?.outline}
              aria-label="Umrandung an oder aus"
              title="Umrandung"
              disabled={!shape}
              onClick={() => updateSelected((e) => (e.type === 'shape' ? { ...e, outline: !e.outline } : e))}
            >
              <BorderIcon />
            </button>
            <button
              className="tool-btn"
              aria-label="Kopieren"
              title="Kopieren"
              onClick={() => {
                if (!selected) return;
                const r = duplicate(elements, selected.id);
                commit(r.elements);
                if (r.copy) setSelectedId(r.copy.id);
              }}
            >
              <CopyIcon />
            </button>
            <button className="tool-btn" aria-label="Nach vorn" title="Nach vorn" onClick={() => selected && commit(bringForward(elements, selected.id))}>
              <ForwardIcon />
            </button>
            <button className="tool-btn" aria-label="Nach hinten" title="Nach hinten" onClick={() => selected && commit(sendBackward(elements, selected.id))}>
              <BackwardIcon />
            </button>
            <button
              className="tool-btn"
              aria-label="Löschen"
              title="Löschen"
              onClick={() => {
                if (!selected) return;
                commit(elements.filter((e) => e.id !== selected.id));
                setSelectedId(null);
              }}
            >
              <TrashIcon />
            </button>
          </div>
          <div className={`swatches line-swatches ${shape?.outline ? '' : 'is-dim'}`} role="radiogroup" aria-label="Linienfarbe">
            {PALETTE.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={shape?.line === c}
                aria-label={`Linienfarbe ${c}`}
                className={`swatch line-swatch ${shape?.line === c ? 'selected' : ''}`}
                style={{ borderColor: c }}
                disabled={!shape?.outline}
                onClick={() => updateSelected((e) => (e.type === 'shape' ? { ...e, line: c } : e))}
              />
            ))}
          </div>
        </div>

        <div className="tool-row">
          <button className="tool-btn" aria-label="Rückgängig" disabled={!history.length} onClick={undo}>
            <UndoIcon />
          </button>
          <button
            className="tool-btn"
            aria-label="Alles löschen"
            disabled={!elements.length}
            onClick={() => {
              commit([]);
              setSelectedId(null);
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </aside>
    </div>
  );
}
