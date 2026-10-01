import { describe, expect, it } from 'vitest';
import { lineOf, sideOf } from '../geometry';
import { candidateScenes, evaluateScene, rng, shapeKey, shuffle } from './generate';

// Asymmetrische Figur: ein "L" aus Stichproben um die Mitte
const samples = [
  ...Array.from({ length: 30 }, (_, i) => ({ x: 0.36 + (i % 3) * 0.03, y: 0.3 + Math.floor(i / 3) * 0.04 })),
  ...Array.from({ length: 15 }, (_, i) => ({ x: 0.45 + (i % 5) * 0.04, y: 0.62 + Math.floor(i / 5) * 0.03 })),
];

describe('Zufall und Mischen', () => {
  it('rng ist reproduzierbar', () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('shuffle behält alle Elemente und ist reproduzierbar', () => {
    const items = Array.from({ length: 12 }, (_, i) => i);
    const s = shuffle(items, 7);
    expect([...s].sort((x, y) => x - y)).toEqual(items);
    expect(shuffle(items, 7)).toEqual(s);
    expect(shuffle(items, 8)).not.toEqual(s);
  });
});

describe('Zielfiguren erzeugen', () => {
  it('liefert unterschiedliche, passende Szenen', () => {
    const used = new Set<string>();
    const gen = candidateScenes(samples, 1, used);
    const scenes = Array.from({ length: 10 }, () => gen.next().value!);
    expect(scenes.every(Boolean)).toBe(true);
    expect(used.size).toBe(10);
    for (const s of scenes) {
      const ev = evaluateScene(samples, s, 'mirror');
      expect(ev.fits).toBe(true);
      expect(ev.fraction).toBeGreaterThanOrEqual(0.3);
      expect(ev.fraction).toBeLessThanOrEqual(0.75);
    }
  });

  it('Winkel sind Vielfache von 15°', () => {
    const gen = candidateScenes(samples, 3, new Set());
    for (let i = 0; i < 5; i++) {
      const s = gen.next().value!;
      const rotDeg = (s.figure.rotation * 180) / Math.PI;
      expect(Math.abs(rotDeg / 15 - Math.round(rotDeg / 15))).toBeLessThan(1e-9);
      const d = { x: s.mirror.b.x - s.mirror.a.x, y: s.mirror.b.y - s.mirror.a.y };
      const lineDeg = (Math.atan2(d.y, d.x) * 180) / Math.PI;
      expect(Math.abs(lineDeg / 15 - Math.round(lineDeg / 15))).toBeLessThan(1e-6);
    }
  });

  it('verwendete Formen werden nicht wiederholt', () => {
    const used = new Set([shapeKey(0, 0, 1)]);
    const s = candidateScenes(samples, 5, used).next().value!;
    expect(s).toBeDefined();
    expect(used.size).toBe(2);
  });

  it('auch Szenen für unlösbare Varianten passen in die Fläche', () => {
    for (const mode of ['rotate', 'translate'] as const) {
      const s = candidateScenes(samples, 9, new Set(), { mode }).next().value!;
      expect(evaluateScene(samples, s, mode).fits).toBe(true);
      expect(sideOf(s.mirror.a, lineOf(s.mirror))).toBe(0);
    }
  });
});

describe('Bildausschnitt', () => {
  it('richtet sich nach der größten Figur', async () => {
    const { viewSizeFor, boundsCenter } = await import('./generate');
    const b = [
      { minX: 0.3, minY: 0.3, maxX: 0.6, maxY: 0.5 },
      { minX: 0.2, minY: 0.4, maxX: 0.6, maxY: 0.7 },
    ];
    expect(viewSizeFor(b, 0.25)).toBeCloseTo(0.5);
    expect(viewSizeFor([{ minX: 0, minY: 0, maxX: 1, maxY: 0.9 }])).toBe(1);
    expect(viewSizeFor([])).toBe(1);
    expect(boundsCenter(b[0]).x).toBeCloseTo(0.45);
    expect(boundsCenter(b[0]).y).toBeCloseTo(0.4);
    expect(boundsCenter(null)).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe('Merkmale auf der Originalseite', () => {
  it('prüft den Mindestabstand zur Geraden', async () => {
    const { allOnOriginalSide } = await import('./generate');
    const { initialScene } = await import('../geometry');
    const scene = initialScene(); // senkrecht durch die Mitte, links Original
    expect(allOnOriginalSide([{ x: 0.3, y: 0.2 }, { x: 0.45, y: 0.8 }], scene)).toBe(true);
    expect(allOnOriginalSide([{ x: 0.3, y: 0.2 }, { x: 0.49, y: 0.8 }], scene)).toBe(false);
    expect(allOnOriginalSide([{ x: 0.7, y: 0.5 }], scene)).toBe(false);
    const moved = { ...scene, figure: { offset: { x: -0.3, y: 0 }, rotation: 0 } };
    expect(allOnOriginalSide([{ x: 0.7, y: 0.5 }], moved)).toBe(true);
  });
});
