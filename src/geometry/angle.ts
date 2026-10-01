import type { Vec2 } from './vec';

export const DEG = Math.PI / 180;

/** Rundet einen Winkel (Grad) auf das nächste Vielfache von `stepDeg`. */
export function snapAngleDeg(angleDeg: number, stepDeg = 15): number {
  const snapped = Math.round(angleDeg / stepDeg) * stepDeg;
  return snapped === 0 ? 0 : snapped; // -0 vermeiden
}

/** Bringt eine Winkeldifferenz (rad) in den Bereich (−π, π]. */
export function wrapAngle(rad: number): number {
  let a = rad % (2 * Math.PI);
  if (a <= -Math.PI) a += 2 * Math.PI;
  if (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

/** Richtungswinkel (rad) des Punktes `p` von `center` aus gesehen. */
export function angleAround(center: Vec2, p: Vec2): number {
  return Math.atan2(p.y - center.y, p.x - center.x);
}

/** Drehwinkel (rad) zwischen zwei Fingerpaaren (Zwei-Finger-Drehgeste). */
export function twoFingerRotation(a0: Vec2, b0: Vec2, a1: Vec2, b1: Vec2): number {
  const before = Math.atan2(b0.y - a0.y, b0.x - a0.x);
  const after = Math.atan2(b1.y - a1.y, b1.x - a1.x);
  return wrapAngle(after - before);
}
