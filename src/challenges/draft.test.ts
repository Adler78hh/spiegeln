import { describe, expect, it } from 'vitest';
import { addTarget, counts, newDraft, removeTarget, setPlan, shuffleTargets, toggleSolvable, type DraftTarget } from './draft';

const t = (id: string, solvable: boolean): DraftTarget => ({
  id,
  image: id,
  raw: id,
  solvable,
  kind: solvable ? 'mirror' : 'rotate',
});

describe('Entwurf einer Herausforderung', () => {
  it('Standardvorgabe 12 / 2', () => {
    const d = newDraft('c', 'haus', 'Haus');
    expect(d.plannedTotal).toBe(12);
    expect(d.plannedUnsolvable).toBe(2);
    expect(counts(d)).toEqual({ solvable: 0, unsolvable: 0, missingSolvable: 10, missingUnsolvable: 2, matchesPlan: false });
  });

  it('zählt gegen die Vorgabe', () => {
    let d = setPlan(newDraft('c', 'haus', 'Haus'), 3, 1);
    d = addTarget(d, t('a', true));
    d = addTarget(d, t('b', false));
    expect(counts(d).matchesPlan).toBe(false);
    d = addTarget(d, t('c', true));
    expect(counts(d)).toMatchObject({ solvable: 2, unsolvable: 1, matchesPlan: true, missingSolvable: 0 });
    d = addTarget(d, t('d', true));
    expect(counts(d)).toMatchObject({ missingSolvable: 0, matchesPlan: false });
  });

  it('Vorgabe wird begrenzt', () => {
    const d = setPlan(newDraft('c', 'haus', 'Haus'), 5, 9);
    expect(d.plannedUnsolvable).toBe(5);
    expect(setPlan(d, 0, -1)).toMatchObject({ plannedTotal: 1, plannedUnsolvable: 0 });
    expect(setPlan(d, 99, 2).plannedTotal).toBe(30);
  });

  it('entfernen, umschalten, mischen', () => {
    let d = newDraft('c', 'haus', 'Haus');
    for (let i = 0; i < 8; i++) d = addTarget(d, t(`t${i}`, i > 1));
    d = removeTarget(d, 't0');
    expect(d.targets.map((x) => x.id)).not.toContain('t0');
    d = toggleSolvable(d, 't1');
    expect(d.targets.find((x) => x.id === 't1')!.solvable).toBe(true);
    const mixed = shuffleTargets(d, 3);
    expect(mixed.targets.map((x) => x.id).sort()).toEqual(d.targets.map((x) => x.id).sort());
    expect(mixed.targets.map((x) => x.id)).not.toEqual(d.targets.map((x) => x.id));
  });
});
