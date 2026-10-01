/**
 * Vorinstallierte Herausforderungen. Die Zielfiguren werden beim Start aus
 * den eigenen Motiven erzeugt (reproduzierbar über den Seed).
 */
import {
  apply,
  figureTransform,
  lineOf,
  mirrorTransform,
  otherSideTransform,
  sideOf,
  UNIT_RECT,
  type ComposeMode,
  type Scene,
  type Vec2,
} from '../geometry';
import { applyVariant, findBuiltinMotif, svgToImage } from '../motifs/builtin';
import {
  contentBounds,
  createFigureBuffer,
  cropSquare,
  differenceRatio,
  motifToFigurePoint,
  renderComposite,
  sampleFigure,
} from '../render/composite';
import { allOnOriginalSide, boundsCenter, candidateScenes, shuffle, viewSizeFor, type CandidateOptions } from './generate';
import type { Store } from '../storage/store';
import type { Challenge, Target, TargetKind } from './types';

type UnsolvableKind = Exclude<TargetKind, 'mirror' | 'upload'>;

interface ChallengeSpec {
  id: string;
  name: string;
  motifId: string;
  seed: number;
  total: number;
  unsolvable: UnsolvableKind[];
}

export const BUILTIN_CHALLENGES: ChallengeSpec[] = [
  { id: 'haus-1', name: 'Haus', motifId: 'haus', seed: 101, total: 12, unsolvable: ['swap', 'rotate'] },
  { id: 'fisch-1', name: 'Fisch', motifId: 'fisch', seed: 202, total: 12, unsolvable: ['swap', 'error'] },
  { id: 'formen-1', name: 'Formen', motifId: 'formen', seed: 303, total: 12, unsolvable: ['translate', 'error'] },
];

/**
 * Version der vorinstallierten Herausforderungen. Erhöhen, wenn sich die
 * Zielfiguren ändern: gespeicherte Herausforderungen werden dann neu erzeugt
 * und alte Antworten dazu verworfen (sie würden nicht mehr passen).
 */
export const BUILTIN_VERSION = 2;

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

async function buildChallenge(spec: ChallengeSpec): Promise<Challenge> {
  const motif = findBuiltinMotif(spec.motifId);
  if (!motif) throw new Error(`Unbekanntes Motiv ${spec.motifId}`);
  const image = await svgToImage(motif.svg);
  const figure = createFigureBuffer(image, 1, RENDER_PX);
  const samples = sampleFigure(figure, 1);
  const used = new Set<string>();
  const raw: Raw[] = [];

  const solvable = candidateScenes(samples, spec.seed, used);
  for (let i = 0; i < spec.total - spec.unsolvable.length; i++) {
    const scene = solvable.next().value as Scene | undefined;
    if (!scene) break;
    raw.push({ canvas: renderComposite(RENDER_PX, scene, figure, figure, mirrorTransform(scene.mirror)), solvable: true, kind: 'mirror', scene });
  }

  let variantIndex = 0;
  const makeUnsolvable = async (kind: UnsolvableKind, seed: number): Promise<Raw | null> => {
    const mode: ComposeMode = kind === 'error' || kind === 'swap' ? 'mirror' : kind;
    // Figur der Originalhälfte und der zweiten Hälfte.
    let first = figure;
    let other = figure;
    let markers: Vec2[] = [];
    if (kind === 'error') {
      const variant = motif.errorVariants[variantIndex++ % motif.errorVariants.length];
      other = createFigureBuffer(await svgToImage(applyVariant(motif.svg, variant)), 1, RENDER_PX);
    } else if (kind === 'swap') {
      const swap = motif.swapVariants[0];
      if (!swap) return null;
      first = other = createFigureBuffer(await svgToImage(applyVariant(motif.svg, swap.replacements)), 1, RENDER_PX);
      markers = swap.markers.map(([x, y]) => motifToFigurePoint({ x: x / 200, y: y / 200 }, 1));
    }
    // Vertauschte Teile brauchen alle Merkmale im Bild, daher auch größere Ausschnitte.
    const opts: CandidateOptions = kind === 'swap' ? { mode, maxFraction: 0.95 } : { mode };
    const gen = candidateScenes(samples, seed, used, opts);
    for (let n = 0; n < 400; n++) {
      const scene = gen.next().value as Scene | undefined;
      if (!scene) return null;
      if (markers.length && !allOnOriginalSide(markers, scene)) continue;
      const place = figureTransform(scene.figure, UNIT_RECT);
      const line = lineOf(scene.mirror);
      const placed = samples.map((s) => apply(place, s)).filter((p) => sideOf(p, line, 0) === scene.mirror.originalSide);
      const candidate = renderComposite(RENDER_PX, scene, first, other, otherSideTransform(mode, scene, placed));
      const reference = renderComposite(RENDER_PX, scene, figure, figure, mirrorTransform(scene.mirror));
      // Unlösbar nur, wenn sich das Ergebnis sichtbar vom Spiegelbild unterscheidet.
      if (differenceRatio(candidate, reference) >= MIN_DIFFERENCE) return { canvas: candidate, solvable: false, kind };
    }
    return null;
  };

  const kinds: UnsolvableKind[] = ['swap', 'error', 'rotate', 'translate'];
  for (const [i, kind] of spec.unsolvable.entries()) {
    // Falls eine Art nicht gelingt, die anderen Arten versuchen.
    for (const k of [kind, ...kinds.filter((x) => x !== kind)]) {
      const r = await makeUnsolvable(k, spec.seed + 1000 * (i + 1));
      if (r) {
        raw.push(r);
        break;
      }
    }
  }

  // Gemeinsamer Ausschnitt: alle Ziele gleich stark vergrößert.
  const bounds = raw.map((r) => contentBounds(r.canvas));
  const viewSize = viewSizeFor(bounds.filter((b): b is NonNullable<typeof b> => b !== null));
  const targets: Target[] = raw.map((r, i) => ({
    id: '',
    image: cropSquare(r.canvas, boundsCenter(bounds[i]), viewSize, TARGET_PX).toDataURL('image/png'),
    solvable: r.solvable,
    kind: r.kind,
    scene: r.scene,
  }));

  const mixed = shuffle(targets, spec.seed).map((t, i) => ({ ...t, id: `${spec.id}-${i + 1}` }));
  return { id: spec.id, name: spec.name, motifId: spec.motifId, targets: mixed, viewSize };
}

/**
 * Lädt alle Herausforderungen aus dem Speicher. Fehlende oder veraltete
 * vorinstallierte werden erzeugt und gespeichert. So bleiben Zielfiguren
 * und gespeicherte Antworten auch nach App-Updates zusammen.
 */
export async function loadChallenges(store: Store): Promise<Challenge[]> {
  const stored = await store.listChallenges();
  const current = new Set(stored.filter((c) => c.builtin && c.version === BUILTIN_VERSION).map((c) => c.id));
  const outdated = new Set(stored.filter((c) => c.builtin && c.version !== BUILTIN_VERSION).map((c) => c.id));
  const missing = BUILTIN_CHALLENGES.filter((spec) => !current.has(spec.id));
  if (missing.length) {
    const built = await Promise.all(missing.map(buildChallenge));
    for (const c of built) {
      if (outdated.has(c.id)) await store.deleteAnswersForChallenge(c.id);
      await store.saveChallenge(
        { ...c, version: BUILTIN_VERSION },
        true,
        BUILTIN_CHALLENGES.findIndex((s) => s.id === c.id),
      );
    }
  }
  const all = missing.length ? await store.listChallenges() : stored;
  return all.map(({ builtin: _b, ...c }) => c);
}
