/**
 * Eine Szene: Lage der Ausgangsfigur und des Spiegels. Genau das wird bei
 * "Passt" gespeichert und beim erneuten Auswählen wiederhergestellt.
 */
import { pointReflection, reflectionAcross, translationAcrossLine, type Affine } from './affine';
import { INITIAL_FIGURE, figureCenter, type FigureState } from './figure';
import { projectOntoLine, signedDistance } from './line';
import { createMirror, lineOf, type MirrorState } from './mirror';
import { UNIT_RECT, type Rect } from './rect';
import type { Vec2 } from './vec';

export interface Scene {
  mirror: MirrorState;
  figure: FigureState;
}

export const initialScene = (): Scene => ({ mirror: createMirror(UNIT_RECT), figure: INITIAL_FIGURE });

/** Abstand des Start-Spiegels zum rechten Rand der Figur (Anteil der Fläche). */
export const START_GAP = 0.025;

/**
 * Startlage für die Kinder: Spiegel senkrecht knapp rechts neben der Figur,
 * die ganze Figur liegt auf der Originalseite. So ist die Mitte der Figur
 * nicht schon vorgegeben. `rightEdge` = rechter Rand der Figur (0…1).
 */
export const besideScene = (rightEdge: number): Scene => ({
  mirror: createMirror(UNIT_RECT, 90, { x: Math.min(rightEdge + START_GAP, 0.98), y: 0.5 }, 1),
  figure: INITIAL_FIGURE,
});

/** Spiegel umdrehen: die bisher gespiegelte Seite wird zur Originalseite. */
export const flipSide = (scene: Scene): Scene => ({
  ...scene,
  mirror: { ...scene.mirror, originalSide: scene.mirror.originalSide === 1 ? -1 : 1 },
});

/**
 * Wie entsteht die zweite Hälfte?
 * - mirror: Achsenspiegelung (lösbar)
 * - rotate: Drehung um 180° um einen Punkt auf der Geraden (wie Spielkarten)
 * - translate: Verschiebung der Originalhälfte über die Gerade
 */
export type ComposeMode = 'mirror' | 'rotate' | 'translate';

/**
 * Größter Abstand eines Punktes auf der Originalseite zur Geraden.
 * `points` sind bereits auf der Arbeitsfläche platzierte Punkte.
 */
export function originalHalfExtent(points: Vec2[], mirror: MirrorState): number {
  const line = lineOf(mirror);
  let max = 0;
  for (const p of points) max = Math.max(max, mirror.originalSide * signedDistance(p, line));
  return max;
}

/**
 * Abbildung, die die Originalhälfte auf die andere Seite bringt.
 * `placed` sind die platzierten Figurpunkte (für die Verschiebungsweite).
 */
export function otherSideTransform(mode: ComposeMode, scene: Scene, placed: Vec2[], rect: Rect = UNIT_RECT): Affine {
  const line = lineOf(scene.mirror);
  switch (mode) {
    case 'mirror':
      return reflectionAcross(line);
    case 'rotate':
      return pointReflection(projectOntoLine(figureCenter(scene.figure, rect), line));
    case 'translate':
      return translationAcrossLine(line, scene.mirror.originalSide, originalHalfExtent(placed, scene.mirror));
  }
}
