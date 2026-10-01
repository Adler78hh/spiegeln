/**
 * Datenmodell des einfachen Zeichenwerkzeugs. Koordinaten normiert (0…1)
 * auf der quadratischen Zeichenfläche.
 */
import type { Vec2 } from '../geometry';

export type ShapeKind = 'rect' | 'ellipse' | 'triangle';
export type Tool = 'pen' | 'eraser' | ShapeKind;

export type Stroke =
  | { kind: 'path'; color: string; width: number; points: Vec2[]; erase: boolean }
  | { kind: ShapeKind; color: string; from: Vec2; to: Vec2 };

export const PALETTE = ['#4a3b2f', '#e0675f', '#f59a4a', '#ffd166', '#8cc68a', '#6fa8dc', '#a78bd4', '#f3a6c8', '#ffffff'];
/** Strichstärken (normiert). */
export const WIDTHS = [0.012, 0.025, 0.05];

/** Rechteck aus zwei Eckpunkten, unabhängig von der Zugrichtung. */
export function normalizeRect(a: Vec2, b: Vec2): { x: number; y: number; w: number; h: number } {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
}

/** Gleichschenkliges Dreieck im Rechteck, Spitze oben. */
export function trianglePoints(a: Vec2, b: Vec2): [Vec2, Vec2, Vec2] {
  const r = normalizeRect(a, b);
  return [
    { x: r.x, y: r.y + r.h },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x + r.w / 2, y: r.y },
  ];
}

/** Ein Punkt wird nur angehängt, wenn er weit genug vom letzten entfernt ist. */
export function appendPoint(points: Vec2[], p: Vec2, minDistance = 0.003): Vec2[] {
  const last = points[points.length - 1];
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < minDistance) return points;
  return [...points, p];
}

/** Zu kleine Formen (versehentliches Tippen) werden verworfen. */
export function isMeaningful(s: Stroke): boolean {
  if (s.kind === 'path') return s.points.length > 0;
  const r = normalizeRect(s.from, s.to);
  return r.w > 0.01 && r.h > 0.01;
}

/** Zeichnet alle Striche. `ctx` muss auf normierte Koordinaten eingestellt sein. */
export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]): void {
  for (const s of strokes) {
    ctx.save();
    if (s.kind === 'path') {
      ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (s.points.length === 1) {
        ctx.beginPath();
        ctx.arc(s.points[0].x, s.points[0].y, s.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      const r = normalizeRect(s.from, s.to);
      if (s.kind === 'rect') ctx.rect(r.x, r.y, r.w, r.h);
      else if (s.kind === 'ellipse') ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
      else trianglePoints(s.from, s.to).forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill();
      // Dunkle Kontur wie bei den vorinstallierten Motiven
      ctx.strokeStyle = '#4a3b2f';
      ctx.lineWidth = 0.008;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Deckende Pixel → Begrenzungsrechteck in Pixeln (oder null, wenn leer). */
export function alphaBounds(data: Uint8ClampedArray, w: number, h: number, threshold = 8) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Neue Größe, damit die längere Seite höchstens `maxSide` ist. */
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const k = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)) };
}
