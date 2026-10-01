/**
 * Zustand und Zustandsübergänge des Spiegels (rote Gerade).
 *
 * Alle Funktionen sind rein: sie bekommen einen Zustand und liefern einen
 * neuen. Koordinaten sind normiert auf die Arbeitsfläche (meist UNIT_RECT).
 */
import { DEG, snapAngleDeg } from './angle';
import { reflectionAcross, type Affine } from './affine';
import {
  clipLineToRect,
  clipPolygonToHalfPlane,
  cornerDistanceRange,
  distanceToSegment,
  normal,
  sideOf,
  type Line,
} from './line';
import { clampToRect, rectCorners, type Rect } from './rect';
import { add, distance, dot, length, scale, sub, type Vec2 } from './vec';

export type Side = 1 | -1;
export type HandleId = 'a' | 'b';

export interface MirrorState {
  /** Anfasspunkt A (nach dem Loslassen immer auf dem Rand). */
  a: Vec2;
  /** Anfasspunkt B (nach dem Loslassen immer auf dem Rand). */
  b: Vec2;
  /**
   * Seite, die als Original sichtbar bleibt, bezogen auf die Normale der
   * Geraden A→B (siehe `normal`). Die andere Seite zeigt das Spiegelbild.
   */
  originalSide: Side;
}

export interface DragOptions {
  /** Einrasten der Geraden auf Vielfache von 15°. */
  snap?: boolean;
  snapStepDeg?: number;
  /** Mindestabstand zwischen den Anfasspunkten (normiert). */
  minHandleDistance?: number;
}

const DEFAULT_MIN_HANDLE_DISTANCE = 0.08;

export const lineOf = (s: MirrorState): Line => ({ p: s.a, q: s.b });

/**
 * Erzeugt einen Spiegel durch `through` mit Richtungswinkel `angleDeg`,
 * Anfasspunkte auf dem Rand. Standard: senkrechte Gerade durch die Mitte,
 * linke Seite ist Original.
 */
export function createMirror(
  rect: Rect,
  angleDeg = 90,
  through: Vec2 = { x: (rect.minX + rect.maxX) / 2, y: (rect.minY + rect.maxY) / 2 },
  originalSide: Side = 1,
): MirrorState {
  const d = { x: Math.cos(angleDeg * DEG), y: Math.sin(angleDeg * DEG) };
  const clip = clipLineToRect({ p: through, q: add(through, d) }, rect);
  if (!clip) throw new Error('Gerade verfehlt die Arbeitsfläche');
  return { a: clip.entry, b: clip.exit, originalSide };
}

/**
 * Anfasspunkt `which` wird zu `pointer` gezogen. Der Punkt darf frei in der
 * Arbeitsfläche liegen; der andere Anfasspunkt bleibt fest.
 *
 * `prev` ist der Zustand des vorherigen Frames. Kippt die Richtung A→B um
 * mehr als 90° (Punkt wird über den anderen hinweggezogen), wird die
 * Originalseite mitgedreht, damit sie optisch dieselbe bleibt.
 */
export function dragHandle(
  prev: MirrorState,
  which: HandleId,
  pointer: Vec2,
  rect: Rect,
  opts: DragOptions = {},
): MirrorState {
  const minDist = opts.minHandleDistance ?? DEFAULT_MIN_HANDLE_DISTANCE;
  const fixed = which === 'a' ? prev.b : prev.a;
  let moving = clampToRect(pointer, rect);

  if (opts.snap) {
    const v = sub(moving, fixed);
    if (length(v) < minDist) return prev;
    const ang = snapAngleDeg((Math.atan2(v.y, v.x) * 180) / Math.PI, opts.snapStepDeg ?? 15) * DEG;
    const u = { x: Math.cos(ang), y: Math.sin(ang) };
    moving = add(fixed, scale(u, Math.max(dot(v, u), minDist)));
    // Bleibt der Punkt nach dem Einrasten nicht in der Fläche, auf den Rand setzen.
    const clip = clipLineToRect({ p: fixed, q: moving }, rect);
    if (!clip || clip.t1 <= 0) return prev;
    if (clip.t1 < 1) moving = clip.exit;
  }

  if (distance(moving, fixed) < minDist) return prev;

  const next: MirrorState =
    which === 'a' ? { a: moving, b: fixed, originalSide: prev.originalSide } : { a: fixed, b: moving, originalSide: prev.originalSide };

  const flipped = dot(sub(prev.b, prev.a), sub(next.b, next.a)) < 0;
  return flipped ? { ...next, originalSide: (-next.originalSide) as Side } : next;
}

/**
 * Loslassen eines Anfasspunkts: er springt auf den Schnittpunkt der Geraden
 * mit dem Rand, auf der Seite, auf der er gezogen wurde.
 */
export function releaseHandle(state: MirrorState, which: HandleId, rect: Rect): MirrorState {
  const fixed = which === 'a' ? state.b : state.a;
  const moving = which === 'a' ? state.a : state.b;
  const clip = clipLineToRect({ p: fixed, q: moving }, rect);
  if (!clip) return state;
  const snapped = clip.exit;
  // Der feste Punkt wird ebenfalls exakt auf den Rand gesetzt (Rundungsfehler).
  const fixedOnRect = clip.entry;
  return which === 'a'
    ? { a: snapped, b: fixedOnRect, originalSide: state.originalSide }
    : { a: fixedOnRect, b: snapped, originalSide: state.originalSide };
}

/**
 * Parallelverschiebung der ganzen Geraden um `delta`, ausgehend vom Zustand
 * bei Beginn des Ziehens. Nur der Anteil quer zur Geraden zählt; die Gerade
 * bleibt immer innerhalb der Arbeitsfläche (Abstand `margin` zu den Ecken).
 */
export function translateMirror(start: MirrorState, delta: Vec2, rect: Rect, margin = 0.02): MirrorState {
  const line = lineOf(start);
  const n = normal(line);
  const range = cornerDistanceRange(line, rect);
  const lo = range.min + margin;
  const hi = range.max - margin;
  let offset = dot(delta, n);
  if (lo <= hi) offset = Math.min(hi, Math.max(lo, offset));
  else offset = 0;
  const shift = scale(n, offset);
  const clip = clipLineToRect({ p: add(start.a, shift), q: add(start.b, shift) }, rect);
  if (!clip) return start;
  return { a: clip.entry, b: clip.exit, originalSide: start.originalSide };
}

/**
 * Tippen auf die Arbeitsfläche: die angetippte Seite wird zum Original.
 * Ein Tippen genau auf der Geraden ändert nichts.
 */
export function chooseOriginalSide(state: MirrorState, tap: Vec2): MirrorState {
  const s = sideOf(tap, lineOf(state));
  if (s === 0 || s === state.originalSide) return state;
  return { ...state, originalSide: s };
}

export type MirrorHit = HandleId | 'line' | null;

/**
 * Welcher Teil des Spiegels liegt unter `pt`? Anfasspunkte haben Vorrang vor
 * der Linie. Toleranzen in normierten Einheiten.
 */
export function hitTest(state: MirrorState, pt: Vec2, handleRadius: number, lineTolerance: number): MirrorHit {
  const da = distance(pt, state.a);
  const db = distance(pt, state.b);
  if (Math.min(da, db) <= handleRadius) return da <= db ? 'a' : 'b';
  if (distanceToSegment(pt, state.a, state.b) <= lineTolerance) return 'line';
  return null;
}

/** Spiegelabbildung als Affine-Matrix (für Canvas). */
export function mirrorTransform(state: MirrorState): Affine {
  return reflectionAcross(lineOf(state));
}

/** Die beiden Teilflächen der Arbeitsfläche als Polygone. */
export function halves(state: MirrorState, rect: Rect): { original: Vec2[]; mirror: Vec2[] } {
  const corners = rectCorners(rect);
  const line = lineOf(state);
  return {
    original: clipPolygonToHalfPlane(corners, line, state.originalSide),
    mirror: clipPolygonToHalfPlane(corners, line, (-state.originalSide) as Side),
  };
}
