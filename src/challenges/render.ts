/**
 * Erzeugt Bilder von Zielfiguren aus einer Szene (für den Editor).
 */
import { apply, figureTransform, lineOf, mirrorTransform, otherSideTransform, sideOf, UNIT_RECT, type ComposeMode, type Scene } from '../geometry';
import { contentBounds, createFigureBuffer, cropSquare, differenceRatio, renderComposite, sampleFigure } from '../render/composite';
import { boundsCenter, viewSizeFor } from './generate';
import type { DraftTarget } from './draft';
import type { Target } from './types';

/** Auflösung der unbeschnittenen Zielbilder. */
export const RAW_PX = 768;
/** Auflösung der gespeicherten Zielbilder. */
export const TARGET_PX = 512;
/** Ab diesem Unterschied gilt eine unlösbare Figur als sichtbar verschieden. */
export const MIN_DIFFERENCE = 0.04;

export interface FigureSource {
  image: CanvasImageSource;
  aspect: number;
}

/**
 * Zeichnet die zusammengesetzte Figur der ganzen Arbeitsfläche.
 * `variant` ersetzt die Figur in beiden Hälften (vertauschte Teile).
 */
export function renderRaw(source: FigureSource, scene: Scene, mode: ComposeMode, variant?: FigureSource): HTMLCanvasElement {
  const fig = createFigureBuffer(source.image, source.aspect, RAW_PX);
  const used = variant ? createFigureBuffer(variant.image, variant.aspect, RAW_PX) : fig;
  const samples = sampleFigure(used, (variant ?? source).aspect);
  const place = figureTransform(scene.figure, UNIT_RECT);
  const line = lineOf(scene.mirror);
  const placed = samples.map((s) => apply(place, s)).filter((p) => sideOf(p, line, 0) === scene.mirror.originalSide);
  return renderComposite(RAW_PX, scene, used, used, otherSideTransform(mode, scene, placed));
}

/** Normales Spiegelbild derselben Szene (zum Vergleich). */
export function renderMirror(source: FigureSource, scene: Scene): HTMLCanvasElement {
  const fig = createFigureBuffer(source.image, source.aspect, RAW_PX);
  return renderComposite(RAW_PX, scene, fig, fig, mirrorTransform(scene.mirror));
}

/** Unterscheidet sich das Bild sichtbar vom Spiegelbild derselben Szene? */
export function differsFromMirror(candidate: HTMLCanvasElement, source: FigureSource, scene: Scene): boolean {
  return differenceRatio(candidate, renderMirror(source, scene)) >= MIN_DIFFERENCE;
}

export function canvasFromImage(img: HTMLImageElement, px = RAW_PX): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  c.getContext('2d')!.drawImage(img, 0, 0, px, px);
  return c;
}

/**
 * Schneidet alle Zielbilder mit einem gemeinsamen Ausschnitt zu (wie bei
 * den vorinstallierten). Eigene Bilder bleiben unverändert.
 */
export async function finalizeTargets(targets: DraftTarget[], loadImage: (src: string) => Promise<HTMLImageElement>): Promise<{ targets: Target[]; viewSize: number }> {
  const raws = await Promise.all(targets.map((t) => loadImage(t.raw).then((img) => canvasFromImage(img))));
  const bounds = raws.map((c, i) => (targets[i].kind === 'upload' ? null : contentBounds(c)));
  const viewSize = viewSizeFor(bounds.filter((b): b is NonNullable<typeof b> => b !== null));
  const out = targets.map((t, i) => ({
    ...t,
    image: t.kind === 'upload' ? t.raw : cropSquare(raws[i], boundsCenter(bounds[i]), viewSize, TARGET_PX).toDataURL('image/png'),
  }));
  return { targets: out, viewSize };
}
