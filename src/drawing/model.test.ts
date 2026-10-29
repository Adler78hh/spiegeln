import { describe, expect, it } from 'vitest';
import { alphaBounds, appendPoint, fitWithin } from './model';

describe('Zeichenmodell', () => {
  it('Punkte zu dicht am letzten werden ausgelassen', () => {
    const pts = appendPoint([{ x: 0.5, y: 0.5 }], { x: 0.501, y: 0.5 });
    expect(pts).toHaveLength(1);
    expect(appendPoint(pts, { x: 0.52, y: 0.5 })).toHaveLength(2);
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
