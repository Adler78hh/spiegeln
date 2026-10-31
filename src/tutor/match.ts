/**
 * Passt das Spiegelbild des Kindes zur Zielfigur? Beide werden im gleichen
 * Ausschnitt klein gezeichnet und verglichen: Umriss fast deckungsgleich und
 * kaum Farbunterschiede.
 */
import { mirrorTransform, type Scene } from '../geometry';
import { boundsCenter } from '../challenges/generate';
import { contentBounds, createFigureBuffer, cropSquare, differenceRatio, maskOverlap, renderComposite } from '../render/composite';

const PX = 384;
const LOOK = 128;

export interface Matcher {
  matches: (scene: Scene) => boolean;
  /** Kennzahlen (zum Abstimmen der Schwellen). */
  measure: (scene: Scene) => { overlap: number; difference: number };
}

export async function createMatcher(figure: CanvasImageSource, aspect: number, targetImage: string, viewSize: number, look = LOOK): Promise<Matcher> {
  const img = new Image();
  img.src = targetImage;
  await img.decode();
  const target = document.createElement('canvas');
  target.width = target.height = look;
  target.getContext('2d', { willReadFrequently: true })!.drawImage(img, 0, 0, look, look);
  const fig = createFigureBuffer(figure, aspect, PX);
  const measure = (scene: Scene) => {
    const full = renderComposite(PX, scene, fig, fig, mirrorTransform(scene.mirror));
    const mine = cropSquare(full, boundsCenter(contentBounds(full)), viewSize, look);
    return { overlap: maskOverlap(mine, target), difference: Math.max(differenceRatio(mine, target), differenceRatio(target, mine)) };
  };
  return {
    measure,
    matches: (scene) => {
      const m = measure(scene);
      return m.overlap >= MIN_OVERLAP && m.difference <= MAX_DIFFERENCE;
    },
  };
}

export const MIN_OVERLAP = 0.95;
export const MAX_DIFFERENCE = 0.2;
