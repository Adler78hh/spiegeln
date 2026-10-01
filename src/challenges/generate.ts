/**
 * Erzeugt Zielfiguren für Herausforderungen (rein, ohne DOM).
 *
 * Grundlage sind Stichproben der Figur (Punkte der ungedrehten, mittigen
 * Figur in normierten Koordinaten). Winkel von Figur und Spiegel sind
 * Vielfache von 15°, damit Kinder die Ziele auch mit Einrasten erreichen.
 */
import {
  apply,
  createMirror,
  DEG,
  figureCenter,
  figureTransform,
  lineOf,
  otherSideTransform,
  sideOf,
  signedDistance,
  UNIT_RECT,
  type ComposeMode,
  type Scene,
  type Side,
  type Vec2,
} from '../geometry';

/** Deterministischer Zufallsgenerator (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mischt eine Liste reproduzierbar (Fisher–Yates). */
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const r = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface Evaluation {
  /** Anteil der Figur auf der Originalseite. */
  fraction: number;
  /** Liegt die zusammengesetzte Figur vollständig in der Fläche? */
  fits: boolean;
}

export function evaluateScene(samples: Vec2[], scene: Scene, mode: ComposeMode, margin = 0.03): Evaluation {
  const place = figureTransform(scene.figure, UNIT_RECT);
  const line = lineOf(scene.mirror);
  const original = samples.map((s) => apply(place, s)).filter((p) => sideOf(p, line, 0) === scene.mirror.originalSide);
  const fraction = samples.length ? original.length / samples.length : 0;
  const t = otherSideTransform(mode, scene, original);
  const inside = (p: Vec2) => p.x >= margin && p.x <= 1 - margin && p.y >= margin && p.y <= 1 - margin;
  const fits = original.every(inside) && original.every((p) => inside(apply(t, p)));
  return { fraction, fits };
}

export interface CandidateOptions {
  mode?: ComposeMode;
  /** Mindest-/Höchstanteil der Figur auf der Originalseite (sinnvoller Schnitt). */
  minFraction?: number;
  maxFraction?: number;
}

/** Kennzeichen der Form einer Zielfigur, um Wiederholungen zu vermeiden. */
export function shapeKey(rotationDeg: number, lineDeg: number, side: Side): string {
  const rel = (((rotationDeg - lineDeg) % 360) + 360) % 360;
  return `${rel}|${side}`;
}

/**
 * Liefert nacheinander passende, unterschiedliche Szenen.
 * `usedKeys` wird fortgeschrieben, damit keine Form doppelt vorkommt.
 */
export function* candidateScenes(
  samples: Vec2[],
  seed: number,
  usedKeys: Set<string>,
  opts: CandidateOptions = {},
): Generator<Scene> {
  const r = rng(seed);
  const mode = opts.mode ?? 'mirror';
  const minF = opts.minFraction ?? 0.3;
  const maxF = opts.maxFraction ?? 0.75;
  for (let attempt = 0; attempt < 5000; attempt++) {
    const rotationDeg = 15 * Math.floor(r() * 24);
    const lineDeg = 15 * Math.floor(r() * 12);
    const side: Side = r() < 0.5 ? 1 : -1;
    const key = shapeKey(rotationDeg, lineDeg, side);
    if (usedKeys.has(key)) continue;
    const figure = { rotation: rotationDeg * DEG, offset: { x: (r() - 0.5) * 0.2, y: (r() - 0.5) * 0.2 } };
    const c = figureCenter(figure, UNIT_RECT);
    const n = { x: -Math.sin(lineDeg * DEG), y: Math.cos(lineDeg * DEG) };
    const shift = (r() - 0.5) * 0.2;
    const through = { x: c.x + n.x * shift, y: c.y + n.y * shift };
    let mirror;
    try {
      mirror = createMirror(UNIT_RECT, lineDeg, through, side);
    } catch {
      continue;
    }
    const scene: Scene = { figure, mirror };
    const ev = evaluateScene(samples, scene, mode);
    if (!ev.fits || ev.fraction < minF || ev.fraction > maxF) continue;
    usedKeys.add(key);
    yield scene;
  }
}

/**
 * Gemeinsamer Bildausschnitt aller Zielfiguren einer Herausforderung
 * (Kantenlänge, normiert): größte Inhaltsausdehnung plus Rand, höchstens 1.
 * Alle Ziele werden mit derselben Vergrößerung gezeigt.
 */
export function viewSizeFor(bounds: Array<{ minX: number; minY: number; maxX: number; maxY: number }>, margin = 0.15): number {
  const maxSide = Math.max(0, ...bounds.map((b) => Math.max(b.maxX - b.minX, b.maxY - b.minY)));
  return Math.min(1, maxSide * (1 + margin) || 1);
}

/** Mittelpunkt eines Begrenzungsrechtecks (ohne Inhalt: Flächenmitte). */
export function boundsCenter(b: { minX: number; minY: number; maxX: number; maxY: number } | null): Vec2 {
  return b ? { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 } : { x: 0.5, y: 0.5 };
}

/**
 * Liegen alle Punkte (Figurkoordinaten der ungedrehten, mittigen Figur)
 * nach dem Platzieren deutlich auf der Originalseite? `minDistance` ist der
 * Mindestabstand zur Geraden.
 */
export function allOnOriginalSide(points: Vec2[], scene: Scene, minDistance = 0.02): boolean {
  const place = figureTransform(scene.figure, UNIT_RECT);
  const line = lineOf(scene.mirror);
  return points.every((p) => scene.mirror.originalSide * signedDistance(apply(place, p), line) >= minDistance);
}
