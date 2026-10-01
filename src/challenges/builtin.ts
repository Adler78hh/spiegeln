/**
 * Vorinstallierte Herausforderungen. Die Zielfiguren werden beim Start aus
 * den eigenen Motiven erzeugt (reproduzierbar über den Seed).
 */
import { apply, figureTransform, lineOf, mirrorTransform, otherSideTransform, sideOf, UNIT_RECT, type Scene } from '../geometry';
import { applyVariant, findBuiltinMotif, svgToImage } from '../motifs/builtin';
import { contentBounds, createFigureBuffer, cropSquare, differenceRatio, renderComposite, sampleFigure } from '../render/composite';
import { boundsCenter, candidateScenes, shuffle, viewSizeFor } from './generate';
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
  { id: 'haus-1', name: 'Haus', motifId: 'haus', seed: 101, total: 12, unsolvable: ['error', 'rotate'] },
  { id: 'fisch-1', name: 'Fisch', motifId: 'fisch', seed: 202, total: 12, unsolvable: ['translate', 'error'] },
  { id: 'formen-1', name: 'Formen', motifId: 'formen', seed: 303, total: 12, unsolvable: ['rotate', 'translate'] },
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
    const mode = kind === 'error' ? 'mirror' : kind;
    let other = figure;
    if (kind === 'error') {
      const variant = motif.errorVariants[variantIndex++ % motif.errorVariants.length];
      other = createFigureBuffer(await svgToImage(applyVariant(motif.svg, variant)), 1, RENDER_PX);
    }
    const gen = candidateScenes(samples, seed, used, { mode });
    for (let n = 0; n < 60; n++) {
      const scene = gen.next().value as Scene | undefined;
      if (!scene) return null;
      const place = figureTransform(scene.figure, UNIT_RECT);
      const line = lineOf(scene.mirror);
      const placed = samples.map((s) => apply(place, s)).filter((p) => sideOf(p, line, 0) === scene.mirror.originalSide);
      const candidate = renderComposite(RENDER_PX, scene, figure, other, otherSideTransform(mode, scene, placed));
      const reference = renderComposite(RENDER_PX, scene, figure, figure, mirrorTransform(scene.mirror));
      // Unlösbar nur, wenn sich das Ergebnis sichtbar vom Spiegelbild unterscheidet.
      if (differenceRatio(candidate, reference) >= MIN_DIFFERENCE) return { canvas: candidate, solvable: false, kind };
    }
    return null;
  };

  const kinds: UnsolvableKind[] = ['error', 'rotate', 'translate'];
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
 * Lädt alle Herausforderungen aus dem Speicher. Fehlende vorinstallierte
 * werden einmalig erzeugt und gespeichert. So bleiben die Zielfiguren
 * (und damit die gespeicherten Antworten) auch nach App-Updates stabil.
 */
export async function loadChallenges(store: Store): Promise<Challenge[]> {
  const stored = await store.listChallenges();
  const have = new Set(stored.map((c) => c.id));
  const missing = BUILTIN_CHALLENGES.filter((spec) => !have.has(spec.id));
  if (missing.length) {
    const built = await Promise.all(missing.map(buildChallenge));
    await Promise.all(
      built.map((c) => store.saveChallenge(c, true, BUILTIN_CHALLENGES.findIndex((s) => s.id === c.id))),
    );
    return (await store.listChallenges()).map(({ builtin: _b, ...c }) => c);
  }
  return stored.map(({ builtin: _b, ...c }) => c);
}
