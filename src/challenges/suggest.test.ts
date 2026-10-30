import { describe, expect, it } from 'vitest';
import { apply, figureTransform, lineOf, sideOf, UNIT_RECT, type Vec2 } from '../geometry';
import { evaluateScene } from './generate';
import { COMBOS, suggestScenes } from './suggest';

// Ungleichmäßige Figur (L-Form) in der Mitte der Fläche.
const samples: Vec2[] = [];
for (let x = 0.32; x <= 0.68; x += 0.01)
  for (let y = 0.32; y <= 0.68; y += 0.01) if (x < 0.45 || y > 0.58) samples.push({ x, y });

describe('Automatische Vorschläge', () => {
  it('liefert die gewünschte Anzahl, alle Kombinationen reihum', () => {
    const s = suggestScenes(samples, COMBOS.length, 1);
    expect(s).toHaveLength(COMBOS.length);
    expect(s.map((x) => x.moves)).toEqual(COMBOS);
  });

  it('alles passt in die Fläche; Verschieben schneidet, sonst liegt die Figur daneben', () => {
    for (const { scene, moves } of suggestScenes(samples, 22, 7)) {
      const ev = evaluateScene(samples, scene, 'mirror');
      expect(ev.fits).toBe(true);
      if (moves.includes('shift')) expect(ev.fraction).toBeLessThan(0.8);
      else expect(ev.fraction).toBeGreaterThan(0.98);
      expect(Math.round(scene.figure.rotation / (Math.PI / 12)) * (Math.PI / 12)).toBeCloseTo(scene.figure.rotation, 6);
      if (!moves.includes('rotate')) expect(scene.figure.rotation).toBe(0);
    }
  });

  it('ohne Umdrehen bleibt bei senkrechter Achse links das Original', () => {
    const [only] = suggestScenes(samples, 1, 3);
    expect(only.moves).toEqual(['shift']);
    const line = lineOf(only.scene.mirror);
    const left = apply(figureTransform(only.scene.figure, UNIT_RECT), { x: 0.33, y: 0.4 });
    expect(sideOf(left, line, 0)).toBe(only.scene.mirror.originalSide);
  });

  it('keine doppelten Formen, auch bei vielen Vorschlägen', () => {
    const s = suggestScenes(samples, 30, 11);
    const keys = s.map(({ scene }) => JSON.stringify([scene.figure.rotation.toFixed(3), scene.mirror.a, scene.mirror.originalSide]));
    expect(new Set(keys).size).toBe(s.length);
    expect(s.length).toBeGreaterThan(20);
  });
});
