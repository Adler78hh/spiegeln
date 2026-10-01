import { describe, expect, it } from 'vitest';
import {
  angleDeg,
  clipLineToRect,
  clipPolygonToHalfPlane,
  cornerDistanceRange,
  distanceToSegment,
  projectOntoLine,
  sideOf,
  signedDistance,
} from './line';
import { UNIT_RECT, rectCorners } from './rect';
import { expectVec } from './testUtils';

describe('clipLineToRect (Schnittpunkte mit dem Rand)', () => {
  it('senkrechte Gerade durch die Mitte', () => {
    const c = clipLineToRect({ p: { x: 0.5, y: 0.4 }, q: { x: 0.5, y: 0.6 } }, UNIT_RECT)!;
    expectVec(c.entry, { x: 0.5, y: 0 });
    expectVec(c.exit, { x: 0.5, y: 1 });
  });

  it('waagerechte Gerade, Richtung von rechts nach links', () => {
    const c = clipLineToRect({ p: { x: 0.9, y: 0.3 }, q: { x: 0.1, y: 0.3 } }, UNIT_RECT)!;
    expectVec(c.entry, { x: 1, y: 0.3 });
    expectVec(c.exit, { x: 0, y: 0.3 });
  });

  it('Diagonale trifft die Ecken', () => {
    const c = clipLineToRect({ p: { x: 0.2, y: 0.2 }, q: { x: 0.3, y: 0.3 } }, UNIT_RECT)!;
    expectVec(c.entry, { x: 0, y: 0 });
    expectVec(c.exit, { x: 1, y: 1 });
  });

  it('schräge Gerade schneidet zwei benachbarte Kanten', () => {
    // y = x + 0.5 → schneidet links bei (0, 0.5) und unten bei (0.5, 1)
    const c = clipLineToRect({ p: { x: 0.1, y: 0.6 }, q: { x: 0.2, y: 0.7 } }, UNIT_RECT)!;
    expectVec(c.entry, { x: 0, y: 0.5 });
    expectVec(c.exit, { x: 0.5, y: 1 });
  });

  it('Punkte außerhalb des Rechtecks definieren trotzdem die Gerade', () => {
    const c = clipLineToRect({ p: { x: -5, y: 0.25 }, q: { x: 7, y: 0.25 } }, UNIT_RECT)!;
    expectVec(c.entry, { x: 0, y: 0.25 });
    expectVec(c.exit, { x: 1, y: 0.25 });
  });

  it('verfehlt das Rechteck → null', () => {
    expect(clipLineToRect({ p: { x: 2, y: 0 }, q: { x: 2, y: 1 } }, UNIT_RECT)).toBeNull();
    // x + y = 2.5 liegt komplett rechts unterhalb
    expect(clipLineToRect({ p: { x: 2.5, y: 0 }, q: { x: 0, y: 2.5 } }, UNIT_RECT)).toBeNull();
  });

  it('entartete Gerade → null', () => {
    expect(clipLineToRect({ p: { x: 0.5, y: 0.5 }, q: { x: 0.5, y: 0.5 } }, UNIT_RECT)).toBeNull();
  });

  it('beliebiges Rechteck', () => {
    const r = { minX: 10, minY: 20, maxX: 110, maxY: 70 };
    const c = clipLineToRect({ p: { x: 60, y: 0 }, q: { x: 60, y: 1 } }, r)!;
    expectVec(c.entry, { x: 60, y: 20 });
    expectVec(c.exit, { x: 60, y: 70 });
  });
});

describe('Abstand, Seite, Projektion', () => {
  const l = { p: { x: 0.5, y: 0 }, q: { x: 0.5, y: 1 } }; // Richtung nach unten

  it('vorzeichenbehafteter Abstand', () => {
    // Normale = perp((0,1)) = (-1, 0) → links positiv
    expect(signedDistance({ x: 0.2, y: 0.5 }, l)).toBeCloseTo(0.3);
    expect(signedDistance({ x: 0.9, y: 0.1 }, l)).toBeCloseTo(-0.4);
  });

  it('Seite', () => {
    expect(sideOf({ x: 0.1, y: 0.9 }, l)).toBe(1);
    expect(sideOf({ x: 0.6, y: 0.9 }, l)).toBe(-1);
    expect(sideOf({ x: 0.5, y: 0.3 }, l)).toBe(0);
  });

  it('Lotfußpunkt', () => {
    expectVec(projectOntoLine({ x: 0.1, y: 0.7 }, l), { x: 0.5, y: 0.7 });
  });

  it('Abstand zur Strecke', () => {
    expect(distanceToSegment({ x: 0.5, y: 1.5 }, l.p, l.q)).toBeCloseTo(0.5);
    expect(distanceToSegment({ x: 0.7, y: 0.5 }, l.p, l.q)).toBeCloseTo(0.2);
  });

  it('Winkel', () => {
    expect(angleDeg(l)).toBeCloseTo(90);
  });

  it('Eckabstände', () => {
    const r = cornerDistanceRange(l, UNIT_RECT);
    expect(r.min).toBeCloseTo(-0.5);
    expect(r.max).toBeCloseTo(0.5);
  });
});

describe('clipPolygonToHalfPlane', () => {
  const area = (poly: { x: number; y: number }[]) =>
    Math.abs(poly.reduce((s, p, i) => {
      const q = poly[(i + 1) % poly.length];
      return s + p.x * q.y - q.x * p.y;
    }, 0)) / 2;

  it('teilt das Quadrat an der Mittelsenkrechten in zwei Hälften', () => {
    const l = { p: { x: 0.5, y: 0 }, q: { x: 0.5, y: 1 } };
    const left = clipPolygonToHalfPlane(rectCorners(UNIT_RECT), l, 1);
    const right = clipPolygonToHalfPlane(rectCorners(UNIT_RECT), l, -1);
    expect(area(left)).toBeCloseTo(0.5);
    expect(area(right)).toBeCloseTo(0.5);
    expect(left.every((p) => p.x <= 0.5 + 1e-9)).toBe(true);
  });

  it('Diagonale ergibt zwei Dreiecke', () => {
    const l = { p: { x: 0, y: 0 }, q: { x: 1, y: 1 } };
    const a = clipPolygonToHalfPlane(rectCorners(UNIT_RECT), l, 1);
    const b = clipPolygonToHalfPlane(rectCorners(UNIT_RECT), l, -1);
    expect(area(a)).toBeCloseTo(0.5);
    expect(area(b)).toBeCloseTo(0.5);
  });

  it('Gerade außerhalb: ganze Fläche oder nichts', () => {
    const l = { p: { x: 2, y: 0 }, q: { x: 2, y: 1 } }; // links von ihr: Normale (-1,0) → positiv
    expect(area(clipPolygonToHalfPlane(rectCorners(UNIT_RECT), l, 1))).toBeCloseTo(1);
    expect(clipPolygonToHalfPlane(rectCorners(UNIT_RECT), l, -1)).toHaveLength(0);
  });
});
