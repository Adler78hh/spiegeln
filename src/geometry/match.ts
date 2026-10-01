/**
 * Hat das Kind die Zielfigur (fast) genau getroffen?
 *
 * Verglichen wird nicht das Bild, sondern die Lage: Drehung der Figur und
 * Spiegelachse *relativ zur Figur* (wo die Figur auf der Fläche liegt, ist
 * egal) sowie die gewählte Originalseite.
 */
import { DEG, wrapAngle } from './angle';
import { apply, invert } from './affine';
import { figureTransform } from './figure';
import { signedDistance, type Line } from './line';
import { UNIT_RECT } from './rect';
import type { Scene } from './scene';

export interface Tolerance {
  /** Erlaubte Abweichung der Winkel (Grad). */
  angleDeg: number;
  /** Erlaubte Abweichung der Achsenlage (Anteil der Flächenbreite). */
  offset: number;
}

export type ToleranceLevel = 'generous' | 'normal' | 'strict';

export const TOLERANCES: Record<ToleranceLevel, Tolerance> = {
  generous: { angleDeg: 8, offset: 0.04 },
  normal: { angleDeg: 5, offset: 0.025 },
  strict: { angleDeg: 3, offset: 0.015 },
};

/**
 * Spiegelachse in Koordinaten der ungedrehten, mittigen Figur, so
 * ausgerichtet, dass die Originalseite immer links der Richtung liegt.
 * Liefert Richtungswinkel und Abstand des Figurmittelpunkts zur Achse.
 */
export function relativeAxis(scene: Scene): { angle: number; distance: number } {
  const inv = invert(figureTransform(scene.figure, UNIT_RECT));
  let p = apply(inv, scene.mirror.a);
  let q = apply(inv, scene.mirror.b);
  // Originalseite auf die positive Seite drehen (Richtung umkehren kehrt die Seite um).
  if (scene.mirror.originalSide === -1) [p, q] = [q, p];
  const line: Line = { p, q };
  return {
    angle: Math.atan2(q.y - p.y, q.x - p.x),
    distance: signedDistance({ x: 0.5, y: 0.5 }, line),
  };
}

export interface MatchResult {
  matches: boolean;
  /** Abweichungen (für Tests und Anzeige). */
  rotationDeg: number;
  axisAngleDeg: number;
  offset: number;
}

export function matchScene(kid: Scene, solution: Scene, tol: Tolerance = TOLERANCES.normal): MatchResult {
  const rotationDeg = Math.abs(wrapAngle(kid.figure.rotation - solution.figure.rotation)) / DEG;
  const a = relativeAxis(kid);
  const b = relativeAxis(solution);
  const axisAngleDeg = Math.abs(wrapAngle(a.angle - b.angle)) / DEG;
  const offset = Math.abs(a.distance - b.distance);
  return {
    matches: rotationDeg <= tol.angleDeg + 1e-9 && axisAngleDeg <= tol.angleDeg + 1e-9 && offset <= tol.offset + 1e-9,
    rotationDeg,
    axisAngleDeg,
    offset,
  };
}
