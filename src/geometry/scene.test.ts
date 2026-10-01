import { describe, expect, it } from 'vitest';
import { apply } from './affine';
import { sideOf } from './line';
import { createMirror, lineOf } from './mirror';
import { UNIT_RECT } from './rect';
import { initialScene, originalHalfExtent, otherSideTransform } from './scene';
import { expectVec } from './testUtils';

const R = UNIT_RECT;

describe('zweite Hälfte', () => {
  const scene = initialScene(); // senkrechte Gerade x = 0.5, links Original
  const placed = [{ x: 0.3, y: 0.4 }, { x: 0.45, y: 0.6 }, { x: 0.6, y: 0.5 }];

  it('Ausdehnung der Originalhälfte', () => {
    expect(originalHalfExtent(placed, scene.mirror)).toBeCloseTo(0.2);
  });

  it('Spiegeln', () => {
    expectVec(apply(otherSideTransform('mirror', scene, placed), { x: 0.3, y: 0.4 }), { x: 0.7, y: 0.4 });
  });

  it('Drehen um 180° um den Punkt auf der Geraden neben der Figurmitte', () => {
    const m = otherSideTransform('rotate', scene, placed);
    // Figurmitte (0.5, 0.5) liegt auf der Geraden → Drehpunkt (0.5, 0.5)
    expectVec(apply(m, { x: 0.3, y: 0.4 }), { x: 0.7, y: 0.6 });
  });

  it('Verschieben: Originalhälfte schließt direkt an die Gerade an', () => {
    const m = otherSideTransform('translate', scene, placed);
    expectVec(apply(m, { x: 0.3, y: 0.4 }), { x: 0.5, y: 0.4 });
    expectVec(apply(m, { x: 0.45, y: 0.6 }), { x: 0.65, y: 0.6 });
  });

  it('alle Varianten bringen Originalpunkte auf die andere Seite', () => {
    const s = { ...scene, mirror: createMirror(R, 30, { x: 0.45, y: 0.55 }, -1) };
    const pts = [{ x: 0.6, y: 0.3 }, { x: 0.7, y: 0.45 }].filter((p) => sideOf(p, lineOf(s.mirror)) === -1);
    expect(pts.length).toBe(2);
    for (const mode of ['mirror', 'rotate', 'translate'] as const) {
      const m = otherSideTransform(mode, s, pts);
      for (const p of pts) expect(sideOf(apply(m, p), lineOf(s.mirror), 1e-9)).not.toBe(-1);
    }
  });
});
