import { describe, expect, it } from 'vitest';
import { apply } from './affine';
import { angleDeg, sideOf } from './line';
import {
  chooseOriginalSide,
  createMirror,
  dragHandle,
  halves,
  hitTest,
  lineOf,
  mirrorTransform,
  releaseHandle,
  translateMirror,
  type MirrorState,
} from './mirror';
import { UNIT_RECT } from './rect';
import { expectVec, onBoundary } from './testUtils';

const R = UNIT_RECT;
const vertical = (): MirrorState => createMirror(R);

describe('createMirror', () => {
  it('Standard: senkrecht durch die Mitte, Anfasspunkte am Rand', () => {
    const m = vertical();
    expectVec(m.a, { x: 0.5, y: 0 });
    expectVec(m.b, { x: 0.5, y: 1 });
    // Originalseite 1 = links
    expect(sideOf({ x: 0.1, y: 0.5 }, lineOf(m))).toBe(m.originalSide);
  });

  it('beliebiger Winkel und Punkt', () => {
    const m = createMirror(R, 45, { x: 0.5, y: 0.5 });
    expect(onBoundary(m.a) && onBoundary(m.b)).toBe(true);
    expectVec(m.a, { x: 0, y: 0 });
    expectVec(m.b, { x: 1, y: 1 });
  });
});

describe('Anfasspunkt ziehen', () => {
  it('Punkt folgt dem Finger frei, auch ins Bild hinein', () => {
    const m = dragHandle(vertical(), 'b', { x: 0.8, y: 0.6 }, R);
    expectVec(m.b, { x: 0.8, y: 0.6 });
    expectVec(m.a, { x: 0.5, y: 0 });
  });

  it('Finger außerhalb der Fläche wird auf die Fläche begrenzt', () => {
    const m = dragHandle(vertical(), 'b', { x: 1.4, y: 0.6 }, R);
    expectVec(m.b, { x: 1, y: 0.6 });
  });

  it('zu nah am anderen Punkt → keine Änderung', () => {
    const start = vertical();
    expect(dragHandle(start, 'b', { x: 0.52, y: 0.02 }, R)).toBe(start);
  });

  it('Loslassen: Punkt springt auf den Randschnittpunkt der Geraden', () => {
    const dragged = dragHandle(vertical(), 'b', { x: 0.75, y: 0.5 }, R);
    const m = releaseHandle(dragged, 'b', R);
    // Gerade durch (0.5,0) und (0.75,0.5) trifft den unteren Rand bei (1,1)
    expectVec(m.b, { x: 1, y: 1 });
    expectVec(m.a, { x: 0.5, y: 0 });
    expect(onBoundary(m.a) && onBoundary(m.b)).toBe(true);
  });

  it('Loslassen: Schnitt mit Seitenkante', () => {
    const dragged = dragHandle(vertical(), 'b', { x: 0.9, y: 0.4 }, R);
    const m = releaseHandle(dragged, 'b', R);
    // Gerade durch (0.5,0) mit Steigung 1 → rechter Rand bei (1, 0.5)
    expectVec(m.b, { x: 1, y: 0.5 });
  });

  it('Loslassen von Punkt A', () => {
    const dragged = dragHandle(vertical(), 'a', { x: 0.25, y: 0.5 }, R);
    const m = releaseHandle(dragged, 'a', R);
    // Gerade durch (0.5,1) und (0.25,0.5): x = 0.5 + (y−1)/2 → y=0 bei x=0
    expectVec(m.a, { x: 0, y: 0 });
    expectVec(m.b, { x: 0.5, y: 1 });
  });

  it('die Gerade geht immer durch beide Anfasspunkte', () => {
    const m = dragHandle(vertical(), 'a', { x: 0.3, y: 0.42 }, R);
    expect(sideOf(m.a, lineOf(m))).toBe(0);
    expect(sideOf(m.b, lineOf(m))).toBe(0);
  });

  it('Originalseite bleibt optisch gleich, wenn der Punkt über den anderen gezogen wird', () => {
    let m = vertical(); // links = Original
    m = dragHandle(m, 'b', { x: 0.5, y: 0.3 }, R);
    m = dragHandle(m, 'b', { x: 0.5, y: 0.15 }, R);
    // Jetzt ist die Gerade weiterhin senkrecht, B liegt unter A; links bleibt Original
    expect(sideOf({ x: 0.1, y: 0.5 }, lineOf(m))).toBe(m.originalSide);
    // Ein Sprung über A hinweg (in einem Frame) kippt die Richtung
    const jumped = dragHandle({ a: { x: 0.5, y: 0.5 }, b: { x: 0.5, y: 0.7 }, originalSide: 1 }, 'b', { x: 0.5, y: 0.2 }, R);
    expect(sideOf({ x: 0.1, y: 0.5 }, lineOf(jumped))).toBe(jumped.originalSide);
  });

  describe('Einrasten auf 15°', () => {
    it('rastet den Winkel um den festen Punkt ein', () => {
      const m = dragHandle(vertical(), 'b', { x: 0.8, y: 0.62 }, R, { snap: true });
      // Winkel von (0.5,0) nach (0.8,0.62) ≈ 64° → 60°
      expect(angleDeg(lineOf(m))).toBeCloseTo(60);
    });

    it('nach dem Einrasten außerhalb → auf den Rand gesetzt', () => {
      const m = dragHandle(vertical(), 'b', { x: 1, y: 0.02 }, R, { snap: true });
      // ≈ 2° → 0°: Gerade entlang der Oberkante
      expect(angleDeg(lineOf(m))).toBeCloseTo(0);
      expect(m.b.x).toBeLessThanOrEqual(1 + 1e-9);
    });

    it('Loslassen nach Einrasten behält den Winkel', () => {
      const dragged = dragHandle(vertical(), 'b', { x: 0.7, y: 0.5 }, R, { snap: true });
      const m = releaseHandle(dragged, 'b', R);
      expect(angleDeg(lineOf(m))).toBeCloseTo(angleDeg(lineOf(dragged)));
      expect(onBoundary(m.b)).toBe(true);
    });
  });
});

describe('Parallelverschiebung', () => {
  it('verschiebt quer zur Geraden, Winkel bleibt', () => {
    const m = translateMirror(vertical(), { x: 0.2, y: 0.3 }, R);
    expectVec(m.a, { x: 0.7, y: 0 });
    expectVec(m.b, { x: 0.7, y: 1 });
  });

  it('schräge Gerade: Anfasspunkte wandern am Rand mit', () => {
    const start = createMirror(R, 45, { x: 0.5, y: 0.5 });
    const m = translateMirror(start, { x: 0.2, y: -0.2 }, R);
    expect(angleDeg(lineOf(m))).toBeCloseTo(45);
    expect(onBoundary(m.a) && onBoundary(m.b)).toBe(true);
    // y = x − 0.4 → (0.4, 0) und (1, 0.6)
    expectVec(m.a, { x: 0.4, y: 0 });
    expectVec(m.b, { x: 1, y: 0.6 });
  });

  it('Gerade kann nicht aus der Fläche geschoben werden', () => {
    const m = translateMirror(vertical(), { x: 5, y: 0 }, R, 0.02);
    expectVec(m.a, { x: 0.98, y: 0 });
    expectVec(m.b, { x: 0.98, y: 1 });
  });

  it('Originalseite bleibt erhalten', () => {
    const start = { ...vertical(), originalSide: -1 as const };
    expect(translateMirror(start, { x: -0.1, y: 0 }, R).originalSide).toBe(-1);
  });
});

describe('Seite wählen', () => {
  it('Tippen auf rechts macht rechts zum Original', () => {
    const m = chooseOriginalSide(vertical(), { x: 0.9, y: 0.5 });
    expect(sideOf({ x: 0.9, y: 0.5 }, lineOf(m))).toBe(m.originalSide);
  });

  it('Tippen auf die Originalseite ändert nichts', () => {
    const start = vertical();
    expect(chooseOriginalSide(start, { x: 0.1, y: 0.5 })).toBe(start);
  });
});

describe('Treffertest', () => {
  const m = vertical();
  it('Anfasspunkte haben Vorrang vor der Linie', () => {
    expect(hitTest(m, { x: 0.52, y: 0.03 }, 0.06, 0.04)).toBe('a');
    expect(hitTest(m, { x: 0.5, y: 0.97 }, 0.06, 0.04)).toBe('b');
  });
  it('Linie in der Mitte', () => {
    expect(hitTest(m, { x: 0.53, y: 0.5 }, 0.06, 0.04)).toBe('line');
  });
  it('daneben', () => {
    expect(hitTest(m, { x: 0.3, y: 0.5 }, 0.06, 0.04)).toBeNull();
  });
});

describe('Spiegelbild und Teilflächen', () => {
  it('Spiegelseite ist das Bild der Originalseite', () => {
    const m = createMirror(R, 30, { x: 0.4, y: 0.6 });
    const t = mirrorTransform(m);
    const pt = { x: 0.2, y: 0.2 };
    const line = lineOf(m);
    expect(sideOf(apply(t, pt), line)).toBe(-sideOf(pt, line));
  });

  it('halves teilt die Fläche passend zur Originalseite', () => {
    const m = vertical();
    const h = halves(m, R);
    expect(h.original.every((p) => p.x <= 0.5 + 1e-9)).toBe(true);
    expect(h.mirror.every((p) => p.x >= 0.5 - 1e-9)).toBe(true);
    const flipped = halves(chooseOriginalSide(m, { x: 0.9, y: 0.5 }), R);
    expect(flipped.original.every((p) => p.x >= 0.5 - 1e-9)).toBe(true);
  });
});
