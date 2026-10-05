/**
 * Vorinstallierte Herausforderungen. Die Zielfiguren werden beim Start aus
 * den eigenen Motiven erzeugt: zufällig, aber reproduzierbar über den Seed,
 * oder fest vorgegeben (siehe layouts.ts).
 */
import {
  apply,
  figureTransform,
  lineOf,
  mirrorTransform,
  originalHalfExtent,
  otherSideTransform,
  pointReflection,
  translationAcrossLine,
  sideOf,
  UNIT_RECT,
  type ComposeMode,
  type Scene,
  type Vec2,
} from '../geometry';
import { applyVariant, findBuiltinMotif, svgToImage, type BuiltinMotif } from '../motifs/builtin';
import {
  AREA_COLOR,
  contentBounds,
  createFigureBuffer,
  cropSquare,
  differenceRatio,
  motifToFigurePoint,
  renderComposite,
  sampleFigure,
} from '../render/composite';
import { allOnOriginalSide, boundsCenter, candidateScenes, shuffle, solvableFirst, viewSizeFor, type CandidateOptions } from './generate';
import { AUTO_LAYOUT, BOOT_LAYOUT, EICHHOERNCHEN_LAYOUT, HASEN_LAYOUT, WUERFEL_LAYOUT, STIFTE_LAYOUT, GESICHT_LAYOUT, MIA_LAYOUT, WUERFELBAU_LAYOUT, KREISQUADRAT_LAYOUT, TETRAKTYS_LAYOUT, FISCH_LAYOUT, FORMEN_LAYOUT, HAUS_LAYOUT, SCHNECKE_LAYOUT } from './layouts';
import type { Store } from '../storage/store';
import type { Challenge, Target, TargetKind } from './types';

type UnsolvableKind = Exclude<TargetKind, 'mirror' | 'upload'>;

/** Eine Zielfigur, festgelegt durch ihre Art und Szene. */
export interface PlannedTarget {
  kind: Exclude<TargetKind, 'upload'>;
  scene: Scene;
  /** Bei „Fehler eingebaut“ und „Teile vertauscht“: welche Variante des Motivs. */
  variant?: number;
  /**
   * Eigener, kleinerer Maßstab (z. B. zwei ganze Figuren nebeneinander),
   * damit nicht alle anderen Zielfiguren mit verkleinert werden.
   */
  ownScale?: boolean;
  /**
   * Nur bei Verschiebung: zusätzlicher Abstand der Kopie hinter der Achse,
   * damit die Kopie ganz zu sehen ist und nicht an der Achse abgeschnitten wird.
   */
  gap?: number;
  /** Nur bei Fehler: die Fehlervariante gilt für beide Hälften, nicht nur für das Spiegelbild. */
  variantBoth?: boolean;
  /** Nur bei Drehung: Drehpunkt im Motiv (Koordinaten 0…200) statt auf der Achse unter der Figurmitte. */
  pivot?: [number, number];
  /**
   * Statt des Zielbilds steht diese Zahl im Feld (Tetraktys: so viele ganze
   * Kreise). Die Szene bleibt als gespeicherte Lösung erhalten.
   */
  label?: string;
}

interface ChallengeSpec {
  id: string;
  name: string;
  motifId: string;
  /**
   * Version dieser Herausforderung. Erhöhen, wenn sich ihre Zielfiguren
   * ändern: sie wird dann neu erzeugt und alte Antworten dazu verworfen
   * (sie würden nicht mehr passen).
   */
  version: number;
  seed: number;
  total: number;
  unsolvable: UnsolvableKind[];
  /** Fest vorgegebene Zielfiguren in dieser Reihenfolge (statt Zufall). */
  layout?: PlannedTarget[];
}

export const BUILTIN_CHALLENGES: ChallengeSpec[] = [
  { id: 'haus-1', name: 'Haus', motifId: 'haus', version: 9, seed: 101, total: 12, unsolvable: ['swap', 'rotate', 'translate'], layout: HAUS_LAYOUT },
  { id: 'fisch-1', name: 'Fisch', motifId: 'fisch', version: 4, seed: 202, total: 12, unsolvable: ['error', 'translate', 'swap'], layout: FISCH_LAYOUT },
  { id: 'formen-1', name: 'Formen', motifId: 'formen', version: 5, seed: 303, total: 12, unsolvable: ['rotate', 'swap', 'error'], layout: FORMEN_LAYOUT },
  { id: 'schnecke-1', name: 'Schnecke', motifId: 'schnecke', version: 5, seed: 404, total: 12, unsolvable: ['error', 'error', 'swap'], layout: SCHNECKE_LAYOUT },
  { id: 'boot-1', name: 'Segelboot', motifId: 'boot', version: 5, seed: 505, total: 12, unsolvable: ['swap', 'error', 'swap'], layout: BOOT_LAYOUT },
  { id: 'auto-1', name: 'Auto', motifId: 'auto', version: 5, seed: 606, total: 12, unsolvable: ['swap', 'error', 'error'], layout: AUTO_LAYOUT },
  { id: 'eichhoernchen-1', name: 'Eichhörnchen', motifId: 'eichhoernchen', version: 4, seed: 707, total: 12, unsolvable: ['error', 'error', 'error'], layout: EICHHOERNCHEN_LAYOUT },
  { id: 'hasen-1', name: 'Stoffhasen', motifId: 'hasen', version: 3, seed: 909, total: 12, unsolvable: ['swap', 'error', 'error'], layout: HASEN_LAYOUT },
  { id: 'wuerfel-1', name: 'Würfel', motifId: 'wuerfel', version: 1, seed: 1010, total: 12, unsolvable: ['rotate', 'error', 'translate'], layout: WUERFEL_LAYOUT },
  { id: 'wuerfelbau-1', name: 'Würfelbau', motifId: 'wuerfelbau', version: 1, seed: 1515, total: 12, unsolvable: ['error', 'translate', 'error'], layout: WUERFELBAU_LAYOUT },
  { id: 'kreisquadrat-1', name: 'Kreise und Quadrate', motifId: 'kreisquadrat', version: 1, seed: 1616, total: 12, unsolvable: ['error', 'translate', 'error'], layout: KREISQUADRAT_LAYOUT },
  { id: 'stifte-1', name: 'Buntstifte', motifId: 'stifte', version: 1, seed: 1111, total: 12, unsolvable: ['error', 'error', 'error'], layout: STIFTE_LAYOUT },
  { id: 'gesicht-1', name: 'Gesicht', motifId: 'gesicht', version: 3, seed: 1212, total: 12, unsolvable: ['error', 'rotate', 'error'], layout: GESICHT_LAYOUT },
  { id: 'mia-1', name: 'MIA', motifId: 'mia', version: 1, seed: 1414, total: 12, unsolvable: ['translate', 'translate', 'error'], layout: MIA_LAYOUT },
  { id: 'tetraktys-1', name: 'Tetraktys', motifId: 'tetraktys', version: 2, seed: 808, total: 22, unsolvable: ['translate'], layout: TETRAKTYS_LAYOUT },
];

/** Auflösung, in der die Zielfiguren berechnet werden. */
const RENDER_PX = 768;
/** Auflösung der gespeicherten Zielbilder. */
export const TARGET_PX = 512;
/** Mindestanteil sichtbar veränderter Figurpixel, damit ein Unterschied erkennbar ist. */
const MIN_DIFFERENCE = 0.04;

interface Raw {
  canvas: HTMLCanvasElement;
  solvable: boolean;
  kind: TargetKind;
  scene?: Scene;
}

interface Context {
  motif: BuiltinMotif;
  figure: HTMLCanvasElement;
  samples: Vec2[];
  buffers: Map<string, Promise<HTMLCanvasElement>>;
}

async function contextFor(motifId: string): Promise<Context> {
  const motif = findBuiltinMotif(motifId);
  if (!motif) throw new Error(`Unbekanntes Motiv ${motifId}`);
  const figure = createFigureBuffer(await svgToImage(motif.svg), 1, RENDER_PX);
  return { motif, figure, samples: sampleFigure(figure, 1), buffers: new Map() };
}

/** Figurpuffer einer abgewandelten Fassung des Motivs (zwischengespeichert). */
function variantBuffer(ctx: Context, key: string, replacements: Array<[string, string]>): Promise<HTMLCanvasElement> {
  let b = ctx.buffers.get(key);
  if (!b) {
    b = svgToImage(applyVariant(ctx.motif.svg, replacements)).then((img) => createFigureBuffer(img, 1, RENDER_PX));
    ctx.buffers.set(key, b);
  }
  return b;
}

/** Zeichnet eine geplante Zielfigur (volle Arbeitsfläche). */
async function renderPlanned(p: PlannedTarget, ctx: Context): Promise<Raw> {
  const { scene } = p;
  if (p.kind === 'mirror') {
    return { canvas: renderComposite(RENDER_PX, scene, ctx.figure, ctx.figure, mirrorTransform(scene.mirror)), solvable: true, kind: 'mirror', scene };
  }
  const mode: ComposeMode = p.kind === 'error' || p.kind === 'swap' ? 'mirror' : p.kind;
  // Figur der Originalhälfte und der zweiten Hälfte.
  let first = ctx.figure;
  let other = ctx.figure;
  if (p.kind === 'error') {
    const n = (p.variant ?? 0) % ctx.motif.errorVariants.length;
    other = await variantBuffer(ctx, `error-${n}`, ctx.motif.errorVariants[n]);
    if (p.variantBoth) first = other;
  } else if (p.kind === 'swap') {
    const n = (p.variant ?? 0) % ctx.motif.swapVariants.length;
    first = other = await variantBuffer(ctx, `swap-${n}`, ctx.motif.swapVariants[n].replacements);
  }
  const place = figureTransform(scene.figure, UNIT_RECT);
  const line = lineOf(scene.mirror);
  const placed = ctx.samples.map((s) => apply(place, s)).filter((q) => sideOf(q, line, 0) === scene.mirror.originalSide);
  const transform =
    p.kind === 'rotate' && p.pivot
      ? pointReflection(apply(figureTransform(scene.figure, UNIT_RECT), motifToFigurePoint({ x: p.pivot[0] / 200, y: p.pivot[1] / 200 }, 1)))
      : p.kind === 'translate' && p.gap
      ? translationAcrossLine(line, scene.mirror.originalSide, originalHalfExtent(placed, scene.mirror) + p.gap)
      : otherSideTransform(mode, scene, placed);
  return { canvas: renderComposite(RENDER_PX, scene, first, other, transform), solvable: false, kind: p.kind };
}

/** Zufällige, reproduzierbare Auswahl der Zielfiguren (über den Seed). */
async function planRandom(spec: ChallengeSpec, ctx: Context): Promise<PlannedTarget[]> {
  const { motif, figure, samples } = ctx;
  const used = new Set<string>();
  const plan: PlannedTarget[] = [];

  const solvable = candidateScenes(samples, spec.seed, used);
  for (let i = 0; i < spec.total - spec.unsolvable.length; i++) {
    const scene = solvable.next().value as Scene | undefined;
    if (!scene) break;
    plan.push({ kind: 'mirror', scene });
  }

  let variantIndex = 0;
  const makeUnsolvable = async (kind: UnsolvableKind, seed: number): Promise<PlannedTarget | null> => {
    const mode: ComposeMode = kind === 'error' || kind === 'swap' ? 'mirror' : kind;
    const variant = kind === 'error' ? variantIndex++ : undefined;
    let markers: Vec2[] = [];
    if (kind === 'swap') {
      const swap = motif.swapVariants[0];
      if (!swap) return null;
      markers = swap.markers.map(([x, y]) => motifToFigurePoint({ x: x / 200, y: y / 200 }, 1));
    }
    // Vertauschte Teile brauchen alle Merkmale im Bild, daher auch größere Ausschnitte.
    const opts: CandidateOptions = kind === 'swap' ? { mode, maxFraction: 0.95 } : { mode };
    const gen = candidateScenes(samples, seed, used, opts);
    for (let n = 0; n < 400; n++) {
      const scene = gen.next().value as Scene | undefined;
      if (!scene) return null;
      if (markers.length && !allOnOriginalSide(markers, scene)) continue;
      const planned: PlannedTarget = { kind, scene, variant };
      const candidate = (await renderPlanned(planned, ctx)).canvas;
      const reference = renderComposite(RENDER_PX, scene, figure, figure, mirrorTransform(scene.mirror));
      // Unlösbar nur, wenn sich das Ergebnis sichtbar vom Spiegelbild unterscheidet.
      if (differenceRatio(candidate, reference) >= MIN_DIFFERENCE) return planned;
    }
    return null;
  };

  const kinds: UnsolvableKind[] = ['swap', 'error', 'rotate', 'translate'];
  for (const [i, kind] of spec.unsolvable.entries()) {
    // Falls eine Art nicht gelingt, die anderen Arten versuchen.
    for (const k of [kind, ...kinds.filter((x) => x !== kind)]) {
      const r = await makeUnsolvable(k, spec.seed + 1000 * (i + 1));
      if (r) {
        plan.push(r);
        break;
      }
    }
  }

  return solvableFirst(shuffle(plan, spec.seed), (t) => t.kind === 'mirror');
}

/** Zielfiguren einer vorinstallierten Herausforderung in ihrer Reihenfolge. */
export async function planChallenge(id: string): Promise<PlannedTarget[]> {
  const spec = BUILTIN_CHALLENGES.find((s) => s.id === id);
  if (!spec) throw new Error(`Unbekannte Herausforderung ${id}`);
  return spec.layout ?? planRandom(spec, await contextFor(spec.motifId));
}

async function buildChallenge(spec: ChallengeSpec): Promise<Challenge> {
  const ctx = await contextFor(spec.motifId);
  const plan = spec.layout ?? (await planRandom(spec, ctx));
  const raw = await Promise.all(plan.map((p) => renderPlanned(p, ctx)));

  // Gemeinsamer Ausschnitt: alle Ziele gleich stark vergrößert (außer mit eigenem Maßstab).
  const bounds = raw.map((r) => contentBounds(r.canvas));
  const present = <T,>(b: T | null): b is T => b !== null;
  const viewSize = viewSizeFor(bounds.filter((_b, i) => !plan[i].ownScale).filter(present));
  const targets: Target[] = raw.map((r, i) => ({
    id: `${spec.id}-${i + 1}`,
    image: plan[i].label !== undefined ? labelImage(plan[i].label!) : cropSquare(r.canvas, boundsCenter(bounds[i]), plan[i].ownScale ? Math.max(viewSize, viewSizeFor([bounds[i]].filter(present))) : viewSize, TARGET_PX).toDataURL('image/png'),
    solvable: r.solvable,
    kind: r.kind,
    scene: r.scene,
  }));
  return { id: spec.id, name: spec.name, motifId: spec.motifId, targets, viewSize };
}

/** Zielfeld nur mit einer großen Zahl (statt eines Zielbilds). */
function labelImage(label: string): string {
  const c = document.createElement('canvas');
  c.width = c.height = TARGET_PX;
  const g = c.getContext('2d')!;
  g.fillStyle = AREA_COLOR;
  g.fillRect(0, 0, TARGET_PX, TARGET_PX);
  g.fillStyle = LABEL_COLOR;
  g.font = `800 ${Math.round(TARGET_PX * 0.5)}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, TARGET_PX / 2, TARGET_PX * 0.53);
  return c.toDataURL('image/png');
}

/** Farbe der Zahlen (Petrol wie die Kreise der Tetraktys). */
const LABEL_COLOR = '#1e6f73';

/**
 * Lädt alle Herausforderungen aus dem Speicher. Fehlende oder veraltete
 * vorinstallierte werden erzeugt und gespeichert. So bleiben Zielfiguren
 * und gespeicherte Antworten auch nach App-Updates zusammen.
 */
export async function loadChallenges(store: Store): Promise<Challenge[]> {
  const stored = await store.listChallenges();
  const versionOf = (id: string) => BUILTIN_CHALLENGES.find((s) => s.id === id)?.version;
  const current = new Set(stored.filter((c) => c.builtin && c.version === versionOf(c.id)).map((c) => c.id));
  const outdated = new Set(stored.filter((c) => c.builtin && c.version !== versionOf(c.id)).map((c) => c.id));
  const missing = BUILTIN_CHALLENGES.filter((spec) => !current.has(spec.id));
  // Nicht mehr mitgelieferte Herausforderungen (z. B. BOA, ersetzt durch MIA) samt Antworten entfernen.
  const removed = stored.filter((c) => c.builtin && versionOf(c.id) === undefined);
  for (const c of removed) {
    await store.deleteAnswersForChallenge(c.id);
    await store.deleteChallenge(c.id);
  }
  if (missing.length) {
    const built = await Promise.all(missing.map(buildChallenge));
    for (const c of built) {
      if (outdated.has(c.id)) await store.deleteAnswersForChallenge(c.id);
      await store.saveChallenge(
        { ...c, version: versionOf(c.id) },
        true,
        BUILTIN_CHALLENGES.findIndex((s) => s.id === c.id),
      );
    }
  }
  const all = missing.length || removed.length ? await store.listChallenges() : stored;
  return all.map(({ builtin: _b, ...c }) => c);
}
