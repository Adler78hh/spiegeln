import { describe, expect, it } from 'vitest';
import { INITIAL_FIGURE } from './figure';
import { createMirror } from './mirror';
import { UNIT_RECT } from './rect';
import { ghostOpacity, visibleFraction } from './visibility';

const R = UNIT_RECT;
// Gitter von Stichproben in einem Quadrat um die Mitte (0.3 … 0.7)
const samples = Array.from({ length: 100 }, (_, i) => ({ x: 0.3 + 0.04 * (i % 10) + 0.02, y: 0.3 + 0.04 * Math.floor(i / 10) + 0.02 }));

describe('sichtbarer Anteil der Figur', () => {
  it('Spiegel durch die Mitte: halb sichtbar', () => {
    expect(visibleFraction(samples, INITIAL_FIGURE, createMirror(R), R)).toBeCloseTo(0.5);
  });

  it('Figur ganz auf der Spiegelseite: nichts sichtbar', () => {
    const fig = { offset: { x: 0.25, y: 0 }, rotation: 0 }; // 0.55 … 0.95, Original links
    expect(visibleFraction(samples, fig, createMirror(R), R)).toBe(0);
  });

  it('Figur ganz auf der Originalseite: alles sichtbar', () => {
    const fig = { offset: { x: -0.25, y: 0 }, rotation: 0 };
    expect(visibleFraction(samples, fig, createMirror(R), R)).toBe(1);
  });

  it('Teile außerhalb der Fläche zählen nicht als sichtbar', () => {
    const fig = { offset: { x: -0.45, y: 0 }, rotation: 0 }; // −0.15 … 0.25
    expect(visibleFraction(samples, fig, createMirror(R), R)).toBeCloseTo(0.6);
  });
});

describe('Deckkraft des Umrisses', () => {
  it('nur wenn die Figur fast ganz verschwunden ist', () => {
    expect(ghostOpacity(0)).toBe(1);
    expect(ghostOpacity(0.1)).toBe(1);
    expect(ghostOpacity(0.17)).toBeCloseTo(0.5);
    expect(ghostOpacity(0.3)).toBe(0);
    expect(ghostOpacity(0.5)).toBe(0);
  });
});
