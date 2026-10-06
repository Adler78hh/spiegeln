import type { Scene } from '../geometry';

/**
 * Wie eine Zielfigur entstanden ist. Nur 'mirror' ist durch Spiegeln erreichbar.
 * - error: ein Fehler (Farbe/Detail) nur in der gespiegelten Hälfte
 * - rotate: zweite Hälfte um 180° gedreht statt gespiegelt
 * - translate: zweite Hälfte verschoben statt gespiegelt
 * - swap: Teile der Figur vertauscht, dann gespiegelt (symmetrisch, ähnlich)
 * - upload: eigenes Bild
 */
export type TargetKind = 'mirror' | 'error' | 'rotate' | 'translate' | 'swap' | 'upload';

export interface Target {
  id: string;
  /** Bild der Zielfigur (Daten-URL, quadratisch wie die Arbeitsfläche). */
  image: string;
  solvable: boolean;
  kind: TargetKind;
  /** Lösung (nur bei lösbaren Figuren; für Erwachsene/Editor). */
  scene?: Scene;
  /** Unbeschnittenes Bild der ganzen Arbeitsfläche (nur bei selbst erstellten). */
  raw?: string;
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
  /** Version (bei vorinstallierten Herausforderungen). */
  version?: number;
  /** Vorgabe aus dem Editor (nur bei selbst erstellten). */
  plan?: { total: number; unsolvable: number };
  /** Erstellungszeit (nur bei selbst erstellten; bestimmt die Reihenfolge). */
  createdAt?: number;
}

export const unsolvableCount = (c: Challenge): number => c.targets.filter((t) => !t.solvable).length;

export type Decision = 'fits' | 'impossible';

/** Eingabe des Kindes zu einer Zielfigur. */
export interface Answer {
  decision: Decision;
  /** Konfiguration beim Entscheiden (Drehung, Spiegel, Originalseite). */
  scene: Scene;
  /** Früher: Bild bei „Passt“ (entfällt, heute gibt es die Sicherung mit dem Fotoapparat). */
  snapshot?: string;
  updatedAt: number;
}

/** Antworten einer Herausforderung: Zielfigur-ID → Antwort. */
export type ChallengeAnswers = Record<string, Answer>;
