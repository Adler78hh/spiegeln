/**
 * Hilfen des Zeichenwerkzeugs (Farben, Strichstärken, Bildgrenzen).
 * Die bearbeitbaren Formen und Striche stehen in ./elements.
 */
import type { Vec2 } from '../geometry';

export const PALETTE = ['#4a3b2f', '#e0675f', '#f59a4a', '#ffd166', '#8cc68a', '#6fa8dc', '#a78bd4', '#f3a6c8', '#ffffff'];
/** Strichstärken (normiert). */
export const WIDTHS = [0.012, 0.025, 0.05];

/** Ein Punkt wird nur angehängt, wenn er weit genug vom letzten entfernt ist. */
export function appendPoint(points: Vec2[], p: Vec2, minDistance = 0.003): Vec2[] {
  const last = points[points.length - 1];
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < minDistance) return points;
  return [...points, p];
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
