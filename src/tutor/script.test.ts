import { describe, expect, it } from 'vitest';
import { createMirror, flipSide, initialScene, UNIT_RECT } from '../geometry';
import { COMMANDS, handlePoint, HAUS_SCRIPT, pointerFor, sceneClose, scriptFor, stepDone } from './script';

describe('Tutor', () => {
  it('nur die ersten sechs Haus-Figuren', () => {
    expect(HAUS_SCRIPT).toHaveLength(6);
    expect(scriptFor('haus-1', 0)).toEqual(['axis']);
    expect(scriptFor('haus-1', 6)).toBe(null);
    expect(scriptFor('fisch-1', 0)).toBe(null);
    for (const steps of HAUS_SCRIPT) for (const s of steps) expect(COMMANDS[s]).toMatch(/\.$/);
  });

  it('erkennt ausgeführte Befehle', () => {
    const s = initialScene();
    const shifted = { ...s, mirror: createMirror(UNIT_RECT, 90, { x: 0.6, y: 0.5 }, 1) };
    expect(stepDone('axis', s, s, false)).toBe(false);
    expect(stepDone('axis', s, shifted, false)).toBe(true);
    const rotated = { ...s, figure: { ...s.figure, rotation: 0.3 } };
    expect(stepDone('rotate', s, rotated, false)).toBe(true);
    expect(stepDone('rotate', s, shifted, false)).toBe(false);
    expect(stepDone('flip', s, flipSide(s), false)).toBe(true);
    expect(stepDone('snap', s, s, true)).toBe(true);
    const tilted = { ...s, mirror: { ...s.mirror, [s.mirror.a.y > s.mirror.b.y ? 'a' : 'b']: { x: 0.4, y: 1 } } };
    expect(stepDone('lower', s, tilted, false)).toBe(true);
  });

  it('Finger: Mitte der Achse, unterer Punkt unten, Drehen auf dem Haus', () => {
    const s = initialScene();
    expect(pointerFor('axis', s)!.p.y).toBeCloseTo(0.5);
    expect(handlePoint(s, 'lower').y).toBeGreaterThan(handlePoint(s, 'upper').y);
    expect(pointerFor('rotate', s)).toEqual({ p: { x: 0.5, y: 0.5 }, kind: 'rotate' });
    expect(pointerFor('snap', s)).toBe(null);
  });
});

describe('Passt die Lage zur Lösung?', () => {
  const sol = { figure: { rotation: 0, offset: { x: 0, y: 0 } }, mirror: createMirror(UNIT_RECT, 90, { x: 0.5, y: 0.5 }, 1) };
  it('gleich, verschoben entlang der Achse oder ganz verschoben: ja', () => {
    expect(sceneClose(sol, sol)).toBe(true);
    const along = { ...sol, figure: { ...sol.figure, offset: { x: 0, y: 0.1 } } };
    expect(sceneClose(sol, along)).toBe(true);
    const both = { figure: { rotation: 0, offset: { x: 0.1, y: 0 } }, mirror: createMirror(UNIT_RECT, 90, { x: 0.6, y: 0.5 }, 1) };
    expect(sceneClose(sol, both)).toBe(true);
  });
  it('knapp daneben ist noch richtig, deutlich daneben nicht', () => {
    const near = { ...sol, mirror: createMirror(UNIT_RECT, 90, { x: 0.515, y: 0.5 }, 1) };
    const far = { ...sol, mirror: createMirror(UNIT_RECT, 90, { x: 0.56, y: 0.5 }, 1) };
    expect(sceneClose(sol, near)).toBe(true);
    expect(sceneClose(sol, far)).toBe(false);
  });
  it('andere Seite, andere Drehung oder schräge Achse: nein', () => {
    expect(sceneClose(sol, flipSide(sol))).toBe(false);
    expect(sceneClose(sol, { ...sol, figure: { ...sol.figure, rotation: Math.PI / 12 } })).toBe(false);
    expect(sceneClose(sol, { ...sol, mirror: createMirror(UNIT_RECT, 75, { x: 0.5, y: 0.5 }, 1) })).toBe(false);
  });
});
