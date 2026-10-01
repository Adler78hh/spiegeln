/**
 * Einfacher Zugang zum Erwachsenenbereich: langes Drücken, dann eine
 * Einmaleins-Aufgabe. Soll nur verhindern, dass Kinder versehentlich
 * hineingeraten; es ist kein Passwortschutz.
 */

/** Dauer des langen Drückens in Millisekunden. */
export const LONG_PRESS_MS = 3000;

export interface Question {
  a: number;
  b: number;
}

/** Aufgabe aus dem kleinen Einmaleins mit Faktoren von 3 bis 9. */
export function makeQuestion(random: () => number = Math.random): Question {
  const pick = () => 3 + Math.floor(random() * 7);
  return { a: pick(), b: pick() };
}

export function isCorrect(q: Question, input: string): boolean {
  const n = Number(input.trim());
  return input.trim() !== '' && Number.isInteger(n) && n === q.a * q.b;
}
