import { describe, expect, it } from 'vitest';
import { alphaBounds, appendPoint, fitWithin, isMeaningful, normalizeRect, trianglePoints } from './model';

describe('Zeichenmodell', () => {
  it('Rechteck unabhängig von der Zugrichtung', () => {
    expect(normalizeRect({ x: 0.8, y: 0.6 }, { x: 0.2, y: 0.1 })).toEqual({ x: 0.2, y: 0.1, w: 0.6000000000000001, h: 0.5 });
  });

  it('Dreieck mit Spitze oben', () => {
    const [a, b, c] = trianglePoints({ x: 0.2, y: 0.8 }, { x: 0.6, y: 0.2 });
    expect(a).toEqual({ x: 0.2, y: 0.8 });
    expect(b.x).toBeCloseTo(0.6);
    expect(c.x).toBeCloseTo(0.4);
    expect(c.y).toBeCloseTo(0.2);
  });

  it('Punkte zu dicht am letzten werden ausgelassen', () => {
    const pts = appendPoint([{ x: 0.5, y: 0.5 }], { x: 0.501, y: 0.5 });
    expect(pts).toHaveLength(1);
    expect(appendPoint(pts, { x: 0.52, y: 0.5 })).toHaveLength(2);
  });

  it('winzige Formen zählen nicht', () => {
    expect(isMeaningful({ kind: 'rect', color: '#000', from: { x: 0.5, y: 0.5 }, to: { x: 0.505, y: 0.6 } })).toBe(false);
    expect(isMeaningful({ kind: 'ellipse', color: '#000', from: { x: 0.2, y: 0.2 }, to: { x: 0.4, y: 0.5 } })).toBe(true);
    expect(isMeaningful({ kind: 'path', color: '#000', width: 0.01, points: [{ x: 0, y: 0 }], erase: false })).toBe(true);
  });

  it('Begrenzung der deckenden Pixel', () => {
    const w = 4;
    const h = 3;
    const data = new Uint8ClampedArray(w * h * 4);
    data[(1 * w + 2) * 4 + 3] = 255;
    data[(2 * w + 1) * 4 + 3] = 255;
    expect(alphaBounds(data, w, h)).toEqual({ x: 1, y: 1, w: 2, h: 2 });
    expect(alphaBounds(new Uint8ClampedArray(w * h * 4), w, h)).toBeNull();
  });

  it('Verkleinern auf die maximale Kantenlänge', () => {
    expect(fitWithin(4000, 3000, 1024)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(500, 800, 1024)).toEqual({ width: 500, height: 800 });
  });
});
