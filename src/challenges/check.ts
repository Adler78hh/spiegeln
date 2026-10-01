/**
 * Selbstkontrolle des Kindes: Erst wenn alle Zielfiguren bearbeitet sind,
 * kann das Kind prüfen lassen, ob seine Entscheidungen stimmen.
 *
 * Richtig ist „Passt“ bei einer lösbaren und „Geht nicht“ bei einer
 * unlösbaren Zielfigur. Wie genau der Spiegel lag, wird nicht bewertet.
 */
import type { Challenge, ChallengeAnswers } from './types';

export interface CheckResult {
  /** Zielfigur-ID → richtig entschieden? (nur bearbeitete Figuren) */
  perTarget: Record<string, boolean>;
  correct: number;
  total: number;
}

/** Sind alle Zielfiguren bearbeitet? Erst dann ist die Kontrolle möglich. */
export function canCheck(challenge: Challenge, answers: ChallengeAnswers): boolean {
  return challenge.targets.length > 0 && challenge.targets.every((t) => answers[t.id]);
}

export function checkAnswers(challenge: Challenge, answers: ChallengeAnswers): CheckResult {
  const perTarget: Record<string, boolean> = {};
  let correct = 0;
  for (const t of challenge.targets) {
    const a = answers[t.id];
    if (!a) continue;
    const ok = a.decision === (t.solvable ? 'fits' : 'impossible');
    perTarget[t.id] = ok;
    if (ok) correct++;
  }
  return { perTarget, correct, total: challenge.targets.length };
}
