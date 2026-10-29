import { describe, expect, it } from 'vitest';
import {
  BASE,
  bringForward,
  createShape,
  duplicate,
  eraseAt,
  handleAt,
  handlePositions,
  hitElement,
  pathFromWorld,
  resizeByHandle,
  rotationTowards,
  sendBackward,
  shapeOutline,
  topElementAt,
  worldPoints,
  type DrawElement,
} from './elements';

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

describe('Formen der Vorauswahl', () => {
  it('Quadrat, Kreis und Dreiecke haben das Grundmaß a', () => {
    for (const k of ['square', 'circle', 'rtriangle'] as const) {
      const s = createShape(k, '#fff');
      close(s.w, BASE);
      close(s.h, BASE);
    }
    const e = createShape('etriangle', '#fff');
    close(e.w, BASE);
    close(e.h, (BASE * Math.sqrt(3)) / 2);
  });

  it('Parallelogramm: unten und oben je 2a; Trapez: unten 3a, oben a; Höhe a', () => {
    const width = (k: 'parallelogram' | 'trapezoid', y: number) => {
      const s = createShape(k, '#fff');
      const xs = shapeOutline(k)!.filter((p) => p.y === y).map((p) => p.x * s.w);
      return Math.abs(xs[1] - xs[0]);
    };
    close(width('parallelogram', 0.5), 2 * BASE);
    close(width('parallelogram', -0.5), 2 * BASE);
    close(width('trapezoid', 0.5), 3 * BASE);
    close(width('trapezoid', -0.5), BASE);
    close(createShape('trapezoid', '#fff').h, BASE);
  });
});

describe('Auswählen', () => {
  it('trifft gedrehte Formen und Striche, oberstes Element zuerst', () => {
    const a = createShape('square', '#f00');
    const b = { ...createShape('circle', '#0f0'), cx: 0.6 };
    expect(topElementAt([a, b], { x: 0.6, y: 0.5 })?.id).toBe(b.id);
    expect(topElementAt([b, a], { x: 0.55, y: 0.5 })?.id).toBe(a.id);
    // Quadrat um 45° gedreht: die Ecke ragt nach rechts hinaus.
    const r = { ...a, rot: Math.PI / 4 };
    expect(hitElement(r, { x: 0.5 + BASE * 0.68, y: 0.5 }, 0)).toBe(true);
    expect(hitElement(a, { x: 0.5 + BASE * 0.68, y: 0.5 }, 0)).toBe(false);
    const line = pathFromWorld([{ x: 0.1, y: 0.1 }, { x: 0.3, y: 0.1 }], '#000', 0.02);
    expect(hitElement(line, { x: 0.2, y: 0.105 })).toBe(true);
    expect(hitElement(line, { x: 0.2, y: 0.2 })).toBe(false);
  });
});

describe('Strecken, Stauchen, Drehen', () => {
  it('rechter Anfasser: linke Kante bleibt stehen, nur die Breite ändert sich', () => {
    const s = createShape('square', '#fff');
    const r = resizeByHandle(s, 3, { x: 0.5 + BASE, y: 0.5 });
    close(r.cx - r.w / 2, s.cx - s.w / 2);
    close(r.w, 1.5 * BASE);
    close(r.h, s.h);
  });

  it('funktioniert auch bei gedrehter Form', () => {
    const s = { ...createShape('square', '#fff'), rot: Math.PI / 2 };
    // Bei 90° zeigt die rechte Seite nach unten.
    const r = resizeByHandle(s, 3, { x: 0.5, y: 0.5 + BASE });
    close(r.w, 1.5 * BASE);
    close(r.h, s.h);
    close(r.cx, 0.5);
    close(r.cy, 0.5 + BASE / 4);
  });

  it('Drehgriff: frei oder in 15°-Schritten', () => {
    const s = createShape('square', '#fff');
    close(rotationTowards(s, { x: 0.8, y: 0.5 }), Math.PI / 2);
    const free = rotationTowards(s, { x: 0.6, y: 0.4 });
    close(free, Math.PI / 4);
    const snapped = rotationTowards(s, { x: 0.62, y: 0.41 }, 15);
    close((snapped * 180) / Math.PI / 15, Math.round((snapped * 180) / Math.PI / 15));
  });

  it('Anfasser werden gefunden', () => {
    const s = createShape('square', '#fff');
    const hs = handlePositions(s);
    expect(handleAt(s, hs[4].p, 0.02)).toBe(4);
    expect(handleAt(s, hs[8].p, 0.02)).toBe('rotate');
    expect(handleAt(s, { x: 0.5, y: 0.5 }, 0.02)).toBe(null);
  });
});

describe('Radierer', () => {
  it('teilt Striche und lässt Formen unberührt', () => {
    const pts = Array.from({ length: 21 }, (_, i) => ({ x: 0.1 + i * 0.02, y: 0.5 }));
    const line = pathFromWorld(pts, '#000', 0.01);
    const sq = createShape('square', '#f00');
    const out = eraseAt([sq, line], { x: 0.3, y: 0.5 }, 0.03);
    expect(out[0]).toBe(sq);
    const paths = out.filter((e) => e.type === 'path');
    expect(paths).toHaveLength(2);
    const all = paths.flatMap((p) => worldPoints(p as Extract<DrawElement, { type: 'path' }>));
    expect(all.every((p) => Math.abs(p.x - 0.3) > 0.03)).toBe(true);
    // Radieren neben dem Strich ändert nichts.
    const same = [sq, line];
    expect(eraseAt(same, { x: 0.5, y: 0.9 }, 0.03)).toBe(same);
  });
});

describe('Ordnen und Kopieren', () => {
  it('nach vorn, nach hinten, kopieren', () => {
    const a = createShape('square', '#f00');
    const b = createShape('circle', '#0f0');
    expect(bringForward([a, b], a.id).map((e) => e.id)).toEqual([b.id, a.id]);
    expect(sendBackward([a, b], b.id).map((e) => e.id)).toEqual([b.id, a.id]);
    const { elements, copy } = duplicate([a, b], a.id);
    expect(elements.map((e) => e.id)).toEqual([a.id, copy!.id, b.id]);
    expect(copy!.cx).toBeGreaterThan(a.cx);
  });
});
