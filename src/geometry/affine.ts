import { add, scale, type Vec2 } from './vec';
import { direction, normal, type Line } from './line';

/**
 * Affine Abbildung im Canvas-Format [a, b, c, d, e, f]:
 *   x' = a·x + c·y + e
 *   y' = b·x + d·y + f
 * (passt direkt zu CanvasRenderingContext2D.setTransform / transform).
 */
export type Affine = readonly [number, number, number, number, number, number];

export const IDENTITY: Affine = [1, 0, 0, 1, 0, 0];

export function apply(m: Affine, p: Vec2): Vec2 {
  return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] };
}

/** Verkettung: erst `second` nach `first`, also compose(second, first)(p) = second(first(p)). */
export function compose(second: Affine, first: Affine): Affine {
  const [a1, b1, c1, d1, e1, f1] = first;
  const [a2, b2, c2, d2, e2, f2] = second;
  return [
    a2 * a1 + c2 * b1,
    b2 * a1 + d2 * b1,
    a2 * c1 + c2 * d1,
    b2 * c1 + d2 * d1,
    a2 * e1 + c2 * f1 + e2,
    b2 * e1 + d2 * f1 + f2,
  ];
}

export function translation(v: Vec2): Affine {
  return [1, 0, 0, 1, v.x, v.y];
}

/** Drehung um `center` um `angleRad` (im Bildschirmkoordinatensystem im Uhrzeigersinn). */
export function rotationAbout(center: Vec2, angleRad: number): Affine {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return [cos, sin, -sin, cos, center.x - cos * center.x + sin * center.y, center.y - sin * center.x - cos * center.y];
}

/** Achsenspiegelung an der Geraden. */
export function reflectionAcross(l: Line): Affine {
  const u = direction(l);
  const a = u.x * u.x - u.y * u.y;
  const b = 2 * u.x * u.y;
  // Lineare Teil M = [[a, b], [b, -a]]; Fixpunkt l.p.
  const mp = { x: a * l.p.x + b * l.p.y, y: b * l.p.x - a * l.p.y };
  return [a, b, b, -a, l.p.x - mp.x, l.p.y - mp.y];
}

export function reflectPoint(pt: Vec2, l: Line): Vec2 {
  return apply(reflectionAcross(l), pt);
}

/** Punktspiegelung (Drehung um 180°) am Punkt `center`. */
export function pointReflection(center: Vec2): Affine {
  return [-1, 0, 0, -1, 2 * center.x, 2 * center.y];
}

/**
 * Verschiebung der Originalseite über die Gerade hinweg (für unlösbare
 * Figuren): quer zur Geraden um `across` in Richtung der Spiegelseite und
 * optional um `along` entlang der Geraden.
 *
 * `originalSide` ist die Seite (bezogen auf `normal(l)`), die als Original
 * sichtbar bleibt.
 */
export function translationAcrossLine(l: Line, originalSide: 1 | -1, across: number, along = 0): Affine {
  const n = normal(l);
  const d = direction(l);
  return translation(add(scale(n, -originalSide * across), scale(d, along)));
}
