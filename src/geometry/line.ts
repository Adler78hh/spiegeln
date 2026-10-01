import { EPS, add, cross, distance, dot, length, normalize, perp, scale, sub, type Vec2 } from './vec';
import { rectCorners, type Rect } from './rect';

/** Eine unendliche Gerade, beschrieben durch zwei verschiedene Punkte. */
export interface Line {
  p: Vec2;
  q: Vec2;
}

export const direction = (l: Line): Vec2 => normalize(sub(l.q, l.p));

/** Einheitsnormale der Geraden (zeigt auf die Seite mit positivem Abstand). */
export const normal = (l: Line): Vec2 => perp(direction(l));

export function isDegenerate(l: Line, eps = EPS): boolean {
  return distance(l.p, l.q) <= eps;
}

/**
 * Vorzeichenbehafteter Abstand eines Punktes zur Geraden.
 * Positiv auf der Seite, in die `normal(l)` zeigt.
 */
export function signedDistance(pt: Vec2, l: Line): number {
  const d = sub(l.q, l.p);
  const len = length(d);
  if (len === 0) return distance(pt, l.p);
  return cross(d, sub(pt, l.p)) / len;
}

/** Seite eines Punktes: 1, -1 oder 0 (auf der Geraden, innerhalb eps). */
export function sideOf(pt: Vec2, l: Line, eps = EPS): 1 | -1 | 0 {
  const s = signedDistance(pt, l);
  if (Math.abs(s) <= eps) return 0;
  return s > 0 ? 1 : -1;
}

/** Lotfußpunkt eines Punktes auf der Geraden. */
export function projectOntoLine(pt: Vec2, l: Line): Vec2 {
  const d = direction(l);
  return add(l.p, scale(d, dot(sub(pt, l.p), d)));
}

/** Abstand eines Punktes zur Strecke [a, b]. */
export function distanceToSegment(pt: Vec2, a: Vec2, b: Vec2): number {
  const ab = sub(b, a);
  const len2 = dot(ab, ab);
  if (len2 === 0) return distance(pt, a);
  const t = Math.max(0, Math.min(1, dot(sub(pt, a), ab) / len2));
  return distance(pt, add(a, scale(ab, t)));
}

export interface Clip {
  /** Eintrittspunkt (kleinerer Parameter in Richtung p→q). */
  entry: Vec2;
  /** Austrittspunkt (größerer Parameter in Richtung p→q). */
  exit: Vec2;
  /** Parameter von entry/exit bezogen auf p + t·(q − p). */
  t0: number;
  t1: number;
}

/**
 * Schneidet die unendliche Gerade mit dem Rechteck (Liang–Barsky ohne
 * Parametergrenzen). Liefert die beiden Randpunkte in Richtung p→q oder
 * `null`, wenn die Gerade das Rechteck verfehlt oder entartet ist.
 */
export function clipLineToRect(l: Line, r: Rect): Clip | null {
  const d = sub(l.q, l.p);
  if (length(d) <= EPS) return null;
  let t0 = -Infinity;
  let t1 = Infinity;
  const checks: Array<[number, number]> = [
    [-d.x, l.p.x - r.minX],
    [d.x, r.maxX - l.p.x],
    [-d.y, l.p.y - r.minY],
    [d.y, r.maxY - l.p.y],
  ];
  for (const [pk, qk] of checks) {
    if (Math.abs(pk) <= EPS) {
      // Parallel zu dieser Kante: außerhalb → kein Schnitt.
      if (qk < -EPS) return null;
      continue;
    }
    const t = qk / pk;
    if (pk < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
  }
  if (t0 > t1 + EPS) return null;
  return {
    entry: add(l.p, scale(d, t0)),
    exit: add(l.p, scale(d, t1)),
    t0,
    t1,
  };
}

/** Wertebereich des vorzeichenbehafteten Abstands der Rechteckecken. */
export function cornerDistanceRange(l: Line, r: Rect): { min: number; max: number } {
  const ds = rectCorners(r).map((c) => signedDistance(c, l));
  return { min: Math.min(...ds), max: Math.max(...ds) };
}

/**
 * Schneidet ein konvexes Polygon mit der Halbebene `side` der Geraden
 * (Sutherland–Hodgman). side = 1: Punkte mit signedDistance ≥ 0.
 */
export function clipPolygonToHalfPlane(poly: Vec2[], l: Line, side: 1 | -1): Vec2[] {
  const out: Vec2[] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const da = side * signedDistance(a, l);
    const db = side * signedDistance(b, l);
    const aIn = da >= 0;
    const bIn = db >= 0;
    if (aIn) out.push(a);
    if (aIn !== bIn) {
      const t = da / (da - db);
      out.push(add(a, scale(sub(b, a), t)));
    }
  }
  return out;
}

/** Winkel der Geraden in Grad (Richtung p→q), Bereich (−180, 180]. */
export function angleDeg(l: Line): number {
  const d = sub(l.q, l.p);
  return (Math.atan2(d.y, d.x) * 180) / Math.PI;
}
