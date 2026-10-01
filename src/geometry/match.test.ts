import { describe, expect, it } from 'vitest';
import { invert, apply, compose, rotationAbout, translation } from './affine';
import { DEG } from './angle';
import { normal } from './line';
import { createMirror, lineOf, translateMirror } from './mirror';
import { matchScene, TOLERANCES, type ToleranceLevel } from './match';
import { UNIT_RECT } from './rect';
import { scale } from './vec';
import { expectVec } from './testUtils';
import type { Scene } from './scene';

const R = UNIT_RECT;
const solution: Scene = {
  figure: { rotation: 30 * DEG, offset: { x: 0.05, y: -0.04 } },
  mirror: createMirror(R, 60, { x: 0.52, y: 0.47 }, 1),
};

const rotateFigure = (s: Scene, deg: number): Scene => ({ ...s, figure: { ...s.figure, rotation: s.figure.rotation + deg * DEG } });
const shiftAxis = (s: Scene, f: number): Scene => ({ ...s, mirror: translateMirror(s.mirror, scale(normal(lineOf(s.mirror)), f), R) });
const level = (l: ToleranceLevel) => TOLERANCES[l];

describe('Umkehrabbildung', () => {
  it('invert(m) ∘ m = Identität', () => {
    const m = compose(translation({ x: 0.2, y: -0.1 }), rotationAbout({ x: 0.5, y: 0.5 }, 0.7));
    const p = { x: 0.31, y: 0.77 };
    expectVec(apply(invert(m), apply(m, p)), p);
  });
});

describe('Treffer erkennen', () => {
  it('exakt gelöst', () => {
    const r = matchScene(solution, solution);
    expect(r.matches).toBe(true);
    expect(r.rotationDeg).toBeCloseTo(0);
    expect(r.offset).toBeCloseTo(0);
  });

  it('Verschieben der ganzen Anordnung ändert nichts', () => {
    const d = { x: 0.08, y: 0.03 };
    const moved: Scene = {
      figure: { ...solution.figure, offset: { x: solution.figure.offset.x + d.x, y: solution.figure.offset.y + d.y } },
      mirror: translateMirror(solution.mirror, d, R),
    };
    expect(matchScene(moved, solution).matches).toBe(true);
    expect(matchScene(moved, solution).offset).toBeCloseTo(0, 6);
  });

  it('gleiche Achse mit vertauschten Anfasspunkten ist dasselbe', () => {
    const swapped: Scene = { ...solution, mirror: { a: solution.mirror.b, b: solution.mirror.a, originalSide: -1 } };
    expect(matchScene(swapped, solution).matches).toBe(true);
  });

  it('andere Originalseite ist falsch', () => {
    const other: Scene = { ...solution, mirror: { ...solution.mirror, originalSide: -1 } };
    expect(matchScene(other, solution).matches).toBe(false);
  });

  it('Stufen: Figur schief', () => {
    expect(matchScene(rotateFigure(solution, 3), solution, level('strict')).matches).toBe(true);
    expect(matchScene(rotateFigure(solution, 5), solution, level('strict')).matches).toBe(false);
    expect(matchScene(rotateFigure(solution, 5), solution, level('normal')).matches).toBe(true);
    expect(matchScene(rotateFigure(solution, 8), solution, level('normal')).matches).toBe(false);
    expect(matchScene(rotateFigure(solution, 8), solution, level('generous')).matches).toBe(true);
    expect(matchScene(rotateFigure(solution, 12), solution, level('generous')).matches).toBe(false);
    expect(matchScene(rotateFigure(solution, -4), solution).matches).toBe(true);
  });

  it('Stufen: Achse verschoben', () => {
    expect(matchScene(shiftAxis(solution, 0.015), solution, level('strict')).matches).toBe(true);
    expect(matchScene(shiftAxis(solution, 0.025), solution, level('strict')).matches).toBe(false);
    expect(matchScene(shiftAxis(solution, 0.025), solution, level('normal')).matches).toBe(true);
    expect(matchScene(shiftAxis(solution, -0.04), solution, level('normal')).matches).toBe(false);
    expect(matchScene(shiftAxis(solution, -0.04), solution, level('generous')).matches).toBe(true);
  });

  it('Achse um 5° gedreht', () => {
    const mid = { x: (solution.mirror.a.x + solution.mirror.b.x) / 2, y: (solution.mirror.a.y + solution.mirror.b.y) / 2 };
    const turned: Scene = { ...solution, mirror: createMirror(R, 65, mid, 1) };
    const r = matchScene(turned, solution);
    expect(r.axisAngleDeg).toBeCloseTo(5);
    expect(r.matches).toBe(true);
    expect(matchScene(turned, solution, level('strict')).matches).toBe(false);
  });

  it('volle Drehung um 360° zählt als gleich', () => {
    expect(matchScene(rotateFigure(solution, 360), solution).matches).toBe(true);
  });
});
