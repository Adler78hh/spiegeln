/**
 * Automatische Zielfiguren für eigene Herausforderungen (mit DOM, zeichnet
 * die Bilder). Genutzt vom Editor und von den eigenen Herausforderungen der
 * Kinder.
 */
import type { Scene } from '../geometry';
import { applyVariant, findBuiltinMotif, svgToImage } from '../motifs/builtin';
import { loadImage, type MotifInfo } from '../motifs/library';
import { createFigureBuffer, motifToFigurePoint, sampleFigure } from '../render/composite';
import { newId } from '../storage/store';
import type { DraftTarget } from './draft';
import { allOnOriginalSide, shuffle, solvableFirst } from './generate';
import { canvasFromImage, differsFromMirror, finalizeTargets, lookOf, looksSame, RAW_PX, renderRaw, type FigureSource } from './render';
import { suggestScenes } from './suggest';
import type { Challenge, TargetKind } from './types';

/** Feste Vorgabe für die Herausforderungen der Kinder. */
export const KID_TOTAL = 12;
export const KID_UNSOLVABLE = 3;

const toUrl = (c: HTMLCanvasElement) => c.toDataURL('image/png');

/**
 * Erzeugt `solvable` lösbare und `unsolvable` unlösbare Zielfiguren. Keine
 * sieht aus wie eine andere oder wie eine der `kept` (selbst gemachten).
 * Ergebnis gemischt; die Reihenfolge der `kept` bleibt vorn.
 */
export async function buildSuggestions(
  motif: MotifInfo,
  src: FigureSource,
  kept: DraftTarget[],
  solvable: number,
  unsolvable: number,
  seed = Date.now() % 1_000_000_007,
): Promise<{ targets: DraftTarget[]; missing: number }> {
  const samples = sampleFigure(createFigureBuffer(src.image, src.aspect, RAW_PX), src.aspect);
  const used = new Set<string>();
  const looks = await Promise.all(kept.filter((t) => t.kind !== 'upload').map(async (t) => lookOf(canvasFromImage(await loadImage(t.raw)))));
  const fresh = (canvas: HTMLCanvasElement) => {
    const look = lookOf(canvas);
    if (looks.some((l) => looksSame(l, look))) return false;
    looks.push(look);
    return true;
  };
  const make = (canvas: HTMLCanvasElement, isSolvable: boolean, kind: TargetKind, s: Scene): DraftTarget => {
    const raw = toUrl(canvas);
    return { id: newId(), raw, image: raw, solvable: isSolvable, kind, scene: s, auto: true };
  };

  const rendered = new Map<Scene, HTMLCanvasElement>();
  const added = suggestScenes(samples, solvable, seed, {
    used,
    accept: (s) => {
      const canvas = renderRaw(src, s, 'mirror');
      rendered.set(s, canvas);
      return fresh(canvas);
    },
  }).map(({ scene: s }) => make(rendered.get(s)!, true, 'mirror', s));

  // Unlösbare: reihum gedreht, verschoben und (falls es eine Vorlage gibt) vertauscht.
  const builtin = findBuiltinMotif(motif.id);
  const swap = builtin?.swapVariants[0];
  const swapImage = swap ? await svgToImage(applyVariant(builtin!.svg, swap.replacements)) : null;
  const markers = swap ? swap.markers.map(([x, y]) => motifToFigurePoint({ x: x / 200, y: y / 200 }, motif.aspect)) : [];
  const kinds: TargetKind[] = swapImage ? ['rotate', 'translate', 'swap'] : ['rotate', 'translate'];
  for (let i = 0; i < unsolvable; i++) {
    for (const kind of [kinds[i % kinds.length], ...kinds]) {
      let canvas: HTMLCanvasElement | null = null;
      const [hit] = suggestScenes(samples, 1, seed + 101 * (i + 1), {
        mode: kind === 'swap' ? 'mirror' : (kind as 'rotate' | 'translate'),
        used,
        start: i * 4,
        accept: (s) => {
          if (kind === 'swap' && !allOnOriginalSide(markers, s)) return false;
          canvas =
            kind === 'swap'
              ? renderRaw(src, s, 'mirror', { image: swapImage!, aspect: motif.aspect })
              : renderRaw(src, s, kind as 'rotate' | 'translate');
          return differsFromMirror(canvas, src, s) && fresh(canvas);
        },
      });
      if (hit && canvas) {
        added.push(make(canvas, false, kind, hit.scene));
        break;
      }
    }
  }
  return {
    targets: solvableFirst([...kept, ...shuffle(added, seed)], (t) => t.solvable),
    missing: solvable + unsolvable - added.length,
  };
}

/** Neue Herausforderung eines Kindes zu seiner Zeichnung: 12 Zielfiguren, 3 davon unlösbar. */
export async function createKidChallenge(motif: MotifInfo, ownerProfileId: string, id = `kind-${newId()}`): Promise<Challenge> {
  const image = await loadImage(motif.src);
  const { targets: draftTargets } = await buildSuggestions(motif, { image, aspect: motif.aspect }, [], KID_TOTAL - KID_UNSOLVABLE, KID_UNSOLVABLE);
  const { targets, viewSize } = await finalizeTargets(draftTargets, loadImage);
  return {
    id,
    name: motif.name,
    motifId: motif.id,
    targets,
    viewSize,
    plan: { total: KID_TOTAL, unsolvable: KID_UNSOLVABLE },
    ownerProfileId,
    createdAt: Date.now(),
  };
}
