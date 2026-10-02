/**
 * Entwurf einer eigenen Herausforderung im Editor (rein, ohne DOM).
 */
import { shuffle, solvableFirst } from './generate';
import type { Target, TargetKind } from './types';

export interface DraftTarget extends Target {
  /** Bild der ganzen Arbeitsfläche (unbeschnitten), Grundlage für den Ausschnitt. */
  raw: string;
}

export interface Draft {
  id: string;
  name: string;
  motifId: string;
  /** Vorgabe: Anzahl Zielfiguren insgesamt und davon unlösbar. */
  plannedTotal: number;
  plannedUnsolvable: number;
  targets: DraftTarget[];
}

export const DEFAULT_TOTAL = 12;
export const DEFAULT_UNSOLVABLE = 3;

export function newDraft(id: string, motifId: string, name: string): Draft {
  return { id, name, motifId, plannedTotal: DEFAULT_TOTAL, plannedUnsolvable: DEFAULT_UNSOLVABLE, targets: [] };
}

export function addTarget(d: Draft, t: DraftTarget): Draft {
  return { ...d, targets: [...d.targets, t] };
}

export function removeTarget(d: Draft, id: string): Draft {
  return { ...d, targets: d.targets.filter((t) => t.id !== id) };
}

/** Kennzeichnung lösbar/unlösbar umschalten (z. B. bei eigenen Bildern). */
export function toggleSolvable(d: Draft, id: string): Draft {
  return { ...d, targets: d.targets.map((t) => (t.id === id ? { ...t, solvable: !t.solvable } : t)) };
}

export function shuffleTargets(d: Draft, seed: number): Draft {
  return { ...d, targets: solvableFirst(shuffle(d.targets, seed), (t) => t.solvable) };
}

/** Vorgabe setzen; unlösbar ist nie größer als insgesamt. */
export function setPlan(d: Draft, total: number, unsolvable: number): Draft {
  const t = Math.max(1, Math.min(30, Math.round(total)));
  const u = Math.max(0, Math.min(t, Math.round(unsolvable)));
  return { ...d, plannedTotal: t, plannedUnsolvable: u };
}

export interface DraftCounts {
  solvable: number;
  unsolvable: number;
  /** Noch fehlende lösbare/unlösbare Figuren laut Vorgabe (nie negativ). */
  missingSolvable: number;
  missingUnsolvable: number;
  /** Entspricht der Entwurf genau der Vorgabe? */
  matchesPlan: boolean;
}

export function counts(d: Draft): DraftCounts {
  const unsolvable = d.targets.filter((t) => !t.solvable).length;
  const solvable = d.targets.length - unsolvable;
  const plannedSolvable = d.plannedTotal - d.plannedUnsolvable;
  return {
    solvable,
    unsolvable,
    missingSolvable: Math.max(0, plannedSolvable - solvable),
    missingUnsolvable: Math.max(0, d.plannedUnsolvable - unsolvable),
    matchesPlan: solvable === plannedSolvable && unsolvable === d.plannedUnsolvable,
  };
}

/** Bezeichnung einer Zielfigur-Art für Erwachsene. */
export const KIND_LABELS: Record<TargetKind, string> = {
  mirror: 'lösbar',
  error: 'Fehler eingebaut',
  rotate: 'gedreht (180°)',
  translate: 'verschoben',
  swap: 'Teile vertauscht',
  upload: 'eigenes Bild',
};
