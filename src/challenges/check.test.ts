import { describe, expect, it } from 'vitest';
import { initialScene } from '../geometry';
import { canCheck, checkAnswers } from './check';
import type { Challenge, Decision } from './types';

const challenge: Challenge = {
  id: 'c',
  name: 'c',
  motifId: 'haus',
  viewSize: 1,
  targets: [
    { id: 't1', image: '', solvable: true, kind: 'mirror' },
    { id: 't2', image: '', solvable: true, kind: 'mirror' },
    { id: 't3', image: '', solvable: false, kind: 'swap' },
    { id: 't4', image: '', solvable: false, kind: 'rotate' },
  ],
};
const ans = (decision: Decision) => ({ decision, scene: initialScene(), updatedAt: 1 });

describe('Selbstkontrolle', () => {
  it('erst möglich, wenn alle Figuren bearbeitet sind', () => {
    expect(canCheck(challenge, { t1: ans('fits'), t2: ans('fits'), t3: ans('impossible') })).toBe(false);
    expect(canCheck(challenge, { t1: ans('fits'), t2: ans('fits'), t3: ans('impossible'), t4: ans('fits') })).toBe(true);
    expect(canCheck({ ...challenge, targets: [] }, {})).toBe(false);
  });

  it('richtig: Passt bei lösbar, Geht nicht bei unlösbar', () => {
    const r = checkAnswers(challenge, {
      t1: ans('fits'),
      t2: ans('impossible'),
      t3: ans('impossible'),
      t4: ans('fits'),
    });
    expect(r.perTarget).toEqual({ t1: true, t2: false, t3: true, t4: false });
    expect(r.correct).toBe(2);
    expect(r.total).toBe(4);
  });

  it('alles richtig', () => {
    const r = checkAnswers(challenge, { t1: ans('fits'), t2: ans('fits'), t3: ans('impossible'), t4: ans('impossible') });
    expect(r.correct).toBe(4);
  });
});
