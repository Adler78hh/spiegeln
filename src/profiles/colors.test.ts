import { describe, expect, it } from 'vitest';
import { firstFreeColor, GROUP_COLORS, initialsOf, suggestGroupName, textOn, tintOf } from './colors';

describe('Gruppenfarben', () => {
  it('28 verschiedene Farben', () => {
    expect(GROUP_COLORS).toHaveLength(28);
    expect(new Set(GROUP_COLORS.map((c) => c.id)).size).toBe(28);
    expect(new Set(GROUP_COLORS.map((c) => c.name)).size).toBe(28);
  });

  it('Name mit Nummer, wenn die Farbe schon vergeben ist', () => {
    expect(suggestGroupName('gelb', ['weiss'])).toBe('Gelb');
    expect(suggestGroupName('gelb', ['weiss', 'gelb'])).toBe('Gelb2');
    expect(suggestGroupName('gelb', ['gelb', 'gelb'])).toBe('Gelb3');
  });

  it('erste freie Farbe, danach wieder von vorn', () => {
    expect(firstFreeColor([])).toBe('weiss');
    expect(firstFreeColor(['weiss'])).toBe('beige');
    const all = GROUP_COLORS.map((c) => c.id);
    expect(firstFreeColor(all)).toBe('weiss');
    expect(firstFreeColor([...all, 'weiss'])).toBe('beige');
  });

  it('heller Hintergrund und lesbare Schrift', () => {
    expect(tintOf('#ffffff')).toBe('#ffffff');
    expect(tintOf('#000000', 0.5)).toBe('#808080');
    expect(textOn('#ffffff')).not.toBe('#ffffff');
    expect(textOn('#222222')).toBe('#ffffff');
  });
});

describe('Anfangsbuchstaben', () => {
  it('zwei Buchstaben, immer groß', () => {
    expect(initialsOf('Mia')).toBe('MI');
    expect(initialsOf('  ömer ')).toBe('ÖM');
    expect(initialsOf('A')).toBe('A');
    expect(initialsOf('')).toBe('?');
    expect(initialsOf('J.-P.')).toBe('JP');
  });
});
