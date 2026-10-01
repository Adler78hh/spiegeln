import type { Scene } from '../geometry';

/** Wie eine Zielfigur entstanden ist. Nur 'mirror' ist durch Spiegeln erreichbar. */
export type TargetKind = 'mirror' | 'error' | 'rotate' | 'translate' | 'upload';

export interface Target {
  id: string;
  /** Bild der Zielfigur (Daten-URL, quadratisch wie die Arbeitsfläche). */
  image: string;
  solvable: boolean;
  kind: TargetKind;
  /** Lösung (nur bei lösbaren Figuren; für Erwachsene/Editor). */
  scene?: Scene;
}

export interface Challenge {
  id: string;
  name: string;
  /** Motiv der Startfigur. */
  motifId: string;
  targets: Target[];
  /**
   * Kantenlänge (normiert) des gemeinsamen Bildausschnitts der Zielbilder.
   * Das Spiegelergebnis des Kindes wird mit demselben Ausschnitt gespeichert.
   */
  viewSize: number;
}

export const unsolvableCount = (c: Challenge): number => c.targets.filter((t) => !t.solvable).length;

export type Decision = 'fits' | 'impossible';

/** Eingabe des Kindes zu einer Zielfigur. */
export interface Answer {
  decision: Decision;
  /** Konfiguration beim Entscheiden (Drehung, Spiegel, Originalseite). */
  scene: Scene;
  /** Bild des Spiegelergebnisses bei "Passt" (für die Ergebnisübersicht). */
  snapshot?: string;
  updatedAt: number;
}

/** Antworten einer Herausforderung: Zielfigur-ID → Antwort. */
export type ChallengeAnswers = Record<string, Answer>;
