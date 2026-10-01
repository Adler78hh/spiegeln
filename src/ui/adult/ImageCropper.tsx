import { useEffect, useRef, useState } from 'react';
import { AREA_COLOR } from '../../render/composite';
import { CheckIcon, PlusIcon } from '../icons';

const OUT_PX = 768;

interface Props {
  image: HTMLImageElement;
  onDone: (square: HTMLCanvasElement) => void;
  onCancel: () => void;
}

/** Quadratischer Zuschnitt eines Bildes mit Verschieben und Zoomen. */
export function ImageCropper({ image, onDone, onCancel }: Props) {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  // Maßstab: Bildpixel → Ausschnitt (0…1). "contain" = ganzes Bild sichtbar.
  const contain = 1 / Math.max(iw, ih);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; size: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (c: HTMLCanvasElement, px: number) => {
    const g = c.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = AREA_COLOR;
    g.fillRect(0, 0, px, px);
    const k = contain * zoom * px;
    const w = iw * k;
    const h = ih * k;
    g.drawImage(image, (px - w) / 2 + offset.x * px, (px - h) / 2 + offset.y * px, w, h);
  };

  useEffect(() => {
    const c = canvasRef.current!;
    const px = c.width;
    draw(c, px);
  });

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, size: e.currentTarget.getBoundingClientRect().width };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setOffset({ x: d.ox + (e.clientX - d.x) / d.size, y: d.oy + (e.clientY - d.y) / d.size });
  };

  const finish = () => {
    const out = document.createElement('canvas');
    out.width = OUT_PX;
    out.height = OUT_PX;
    draw(out, OUT_PX);
    onDone(out);
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Bild zuschneiden">
      <div className="dialog cropper">
        <p>Bild verschieben und zoomen. Der Rahmen entspricht der Arbeitsfläche.</p>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="crop-canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onWheel={(e) => setZoom((z) => Math.min(6, Math.max(0.5, z * (e.deltaY < 0 ? 1.1 : 0.9))))}
        />
        <div className="crop-controls">
          <button className="tool-btn" aria-label="Verkleinern" onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}>
            <span className="minus">–</span>
          </button>
          <input
            id="crop-zoom"
            type="range"
            min={0.5}
            max={6}
            step={0.01}
            value={zoom}
            aria-label="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <button className="tool-btn" aria-label="Vergrößern" onClick={() => setZoom((z) => Math.min(6, z * 1.2))}>
            <PlusIcon size={26} />
          </button>
        </div>
        <div className="dialog-actions">
          <button className="text-btn" onClick={onCancel}>
            Abbrechen
          </button>
          <button className="text-btn primary" onClick={finish}>
            <CheckIcon size={22} /> Übernehmen
          </button>
        </div>
      </div>
    </div>
  );
}
