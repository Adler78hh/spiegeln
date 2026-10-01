import { describe, expect, it } from 'vitest';
import { apply } from './affine';
import { INITIAL_FIGURE, clampFigure, figureCenter, figureTransform, moveFigure, pinchFigure } from './figure';
import { UNIT_RECT } from './rect';
import { expectVec } from './testUtils';

const R = UNIT_RECT;

describe('Figur verschieben und drehen', () => {
  it('verschiebt um delta', () => {
    const f = moveFigure(INITIAL_FIGURE, { x: 0.2, y: -0.1 }, R);
    expectVec(figureCenter(f, R), { x: 0.7, y: 0.4 });
    expect(f.rotation).toBe(0);
  });

  it('Mittelpunkt bleibt in der Fläche', () => {
    const f = moveFigure(INITIAL_FIGURE, { x: 3, y: -3 }, R);
    expectVec(figureCenter(f, R), { x: 0.95, y: 0.05 });
    expectVec(figureCenter(clampFigure({ offset: { x: -1, y: 0 }, rotation: 0 }, R, 0), R), { x: 0, y: 0.5 });
  });

  it('Verschiebung geht immer vom Startzustand aus', () => {
    const start = moveFigure(INITIAL_FIGURE, { x: 0.1, y: 0 }, R);
    const f = moveFigure(start, { x: 0.1, y: 0.1 }, R);
    expectVec(figureCenter(f, R), { x: 0.7, y: 0.6 });
  });

  it('Zwei-Finger-Geste dreht und verschiebt', () => {
    const f = pinchFigure(
      INITIAL_FIGURE,
      { x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 },
      { x: 0.6, y: 0.5 }, { x: 0.6, y: 0.7 }, // 90° gedreht, Mitte von (0.5,0.5) nach (0.6,0.6)
      R,
    );
    expect(f.rotation).toBeCloseTo(Math.PI / 2);
    expectVec(figureCenter(f, R), { x: 0.6, y: 0.6 });
  });

  it('figureTransform dreht um den Figurmittelpunkt und verschiebt', () => {
    const f = { offset: { x: 0.1, y: 0 }, rotation: Math.PI / 2 };
    const m = figureTransform(f, R);
    // Mitte → Figurmittelpunkt
    expectVec(apply(m, { x: 0.5, y: 0.5 }), { x: 0.6, y: 0.5 });
    // Punkt rechts der Mitte → nach unten gedreht, dann verschoben
    expectVec(apply(m, { x: 0.7, y: 0.5 }), { x: 0.6, y: 0.7 });
  });
});
