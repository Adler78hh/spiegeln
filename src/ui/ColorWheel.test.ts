import { describe, expect, it } from 'vitest';
import { hexToHsv, hsvToHex } from './ColorWheel';

describe('Farbrad', () => {
  it('Umrechnung HSV ↔ Hex', () => {
    expect(hsvToHex(0, 1, 1)).toBe('#ff0000');
    expect(hsvToHex(120, 1, 1)).toBe('#00ff00');
    expect(hsvToHex(240, 1, 0.5)).toBe('#000080');
    expect(hsvToHex(0, 0, 1)).toBe('#ffffff');
    for (const hex of ['#3a8f85', '#e0675f', '#4a3b2f']) {
      const { h, s, v } = hexToHsv(hex);
      expect(hsvToHex(h, s, v)).toBe(hex);
    }
  });
});
