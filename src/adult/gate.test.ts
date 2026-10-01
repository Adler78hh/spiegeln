import { describe, expect, it } from 'vitest';
import { isCorrect, makeQuestion } from './gate';

describe('Zugang zum Erwachsenenbereich', () => {
  it('Faktoren liegen zwischen 3 und 9', () => {
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion();
      expect(q.a).toBeGreaterThanOrEqual(3);
      expect(q.a).toBeLessThanOrEqual(9);
      expect(q.b).toBeGreaterThanOrEqual(3);
      expect(q.b).toBeLessThanOrEqual(9);
    }
    expect(makeQuestion(() => 0)).toEqual({ a: 3, b: 3 });
    expect(makeQuestion(() => 0.999)).toEqual({ a: 9, b: 9 });
  });

  it('prüft die Antwort', () => {
    const q = { a: 7, b: 8 };
    expect(isCorrect(q, '56')).toBe(true);
    expect(isCorrect(q, ' 56 ')).toBe(true);
    expect(isCorrect(q, '54')).toBe(false);
    expect(isCorrect(q, '')).toBe(false);
    expect(isCorrect(q, '56.0x')).toBe(false);
  });
});
