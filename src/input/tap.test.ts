import { describe, expect, it } from 'vitest';
import { isTap } from './tap';

describe('Tippen erkennen', () => {
  const down = { x: 100, y: 100, t: 0 };
  it('kurz und ohne Bewegung → Tippen', () => {
    expect(isTap(down, { x: 103, y: 98, t: 150 })).toBe(true);
  });
  it('zu weit bewegt → kein Tippen', () => {
    expect(isTap(down, { x: 130, y: 100, t: 150 })).toBe(false);
  });
  it('hin und zurück gezogen → kein Tippen', () => {
    expect(isTap(down, { x: 100, y: 100, t: 200 }, 40)).toBe(false);
  });
  it('zu lange gedrückt → kein Tippen', () => {
    expect(isTap(down, { x: 100, y: 100, t: 900 })).toBe(false);
  });
});
