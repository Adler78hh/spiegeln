import { describe, expect, it } from 'vitest';
import { worksheetPages } from './Worksheet';

describe('Arbeitsblatt', () => {
  it('Seite 1: 4 Zielfiguren, danach je 8', () => {
    const r = (n: number) => worksheetPages(Array.from({ length: n }, (_, i) => i)).map((p) => p.length);
    expect(r(12)).toEqual([4, 8]);
    expect(r(13)).toEqual([4, 8, 1]);
    expect(r(45)).toEqual([4, 8, 8, 8, 8, 8, 1]);
    expect(r(3)).toEqual([3]);
  });
});
