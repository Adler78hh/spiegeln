import { useEffect, useRef, useState } from 'react';

/** HSV (h 0…360, s/v 0…1) → #rrggbb */
export function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

/** #rrggbb → HSV */
export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return { h: 0, s: 0, v: 1 };
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { h: (h + 360) % 360, s: max ? d / max : 0, v: max };
}

const SIZE = 220;

interface Props {
  initial: string;
  onPick: (hex: string) => void;
  onCancel: () => void;
}

/** Farbrad: Farbton rundherum, Sättigung nach außen, Helligkeit mit dem Regler. */
export function ColorWheel({ initial, onPick, onCancel }: Props) {
  const start = hexToHsv(initial);
  const [hsv, setHsv] = useState(start);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const color = hsvToHex(hsv.h, hsv.s, hsv.v);

  // Rad neu zeichnen, wenn sich die Helligkeit ändert.
  useEffect(() => {
    const c = canvasRef.current!;
    const g = c.getContext('2d')!;
    const img = g.createImageData(SIZE, SIZE);
    const r = SIZE / 2;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        const dx = x - r + 0.5;
        const dy = y - r + 0.5;
        const d = Math.hypot(dx, dy);
        const i = (y * SIZE + x) * 4;
        if (d > r) continue;
        const h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
        const hex = hsvToHex(h, Math.min(1, d / r), hsv.v);
        img.data[i] = parseInt(hex.slice(1, 3), 16);
        img.data[i + 1] = parseInt(hex.slice(3, 5), 16);
        img.data[i + 2] = parseInt(hex.slice(5, 7), 16);
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
  }, [hsv.v]);

  const pickAt = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    const h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const s = Math.min(1, Math.hypot(dx, dy) / (rect.width / 2));
    setHsv((o) => ({ ...o, h, s }));
  };

  // Lage des Markers auf dem Rad
  const ang = (hsv.h * Math.PI) / 180;
  const mx = 50 + Math.sin(ang) * hsv.s * 50;
  const my = 50 - Math.cos(ang) * hsv.s * 50;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Eigene Farbe">
      <div className="dialog color-wheel-dialog">
        <h2>Eigene Farbe</h2>
        <div className="color-wheel">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              pickAt(e);
            }}
            onPointerMove={(e) => dragging.current && pickAt(e)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          />
          <span className="wheel-marker" style={{ left: `${mx}%`, top: `${my}%`, background: color }} />
        </div>
        <label className="wheel-light">
          <span>Helligkeit</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(hsv.v * 100)}
            onChange={(e) => setHsv((o) => ({ ...o, v: Number(e.target.value) / 100 }))}
            style={{ background: `linear-gradient(to right, #000, ${hsvToHex(hsv.h, hsv.s, 1)})` }}
          />
        </label>
        <div className="wheel-preview">
          <span className="swatch" style={{ background: initial }} aria-label="bisher" />
          <span aria-hidden="true">→</span>
          <span className="swatch" style={{ background: color }} aria-label="neu" />
        </div>
        <div className="dialog-actions">
          <button className="text-btn" onClick={onCancel}>
            Abbrechen
          </button>
          <button className="text-btn primary" onClick={() => onPick(color)}>
            Übernehmen
          </button>
        </div>
      </div>
    </div>
  );
}
