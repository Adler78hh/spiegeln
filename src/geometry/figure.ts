/**
 * Lage der Ausgangsfigur auf der Arbeitsfläche: Verschiebung und Drehung.
 * Die Figur dreht sich immer um ihren eigenen Mittelpunkt.
 */
import { twoFingerRotation } from './angle';
import { compose, rotationAbout, translation, type Affine } from './affine';
import { clampToRect, rectCenter, type Rect } from './rect';
import { add, lerp, sub, type Vec2 } from './vec';

export interface FigureState {
  /** Verschiebung des Figurmittelpunkts gegenüber der Flächenmitte (normiert). */
  offset: Vec2;
  /** Drehung in Bogenmaß. */
  rotation: number;
}

export const INITIAL_FIGURE: FigureState = { offset: { x: 0, y: 0 }, rotation: 0 };

/** Mittelpunkt der Figur in normierten Koordinaten. */
export function figureCenter(f: FigureState, rect: Rect): Vec2 {
  return add(rectCenter(rect), f.offset);
}

/**
 * Begrenzt die Verschiebung so, dass der Figurmittelpunkt in der Fläche
 * bleibt (mit Abstand `margin` zum Rand). So kann die Figur nicht verloren gehen.
 */
export function clampFigure(f: FigureState, rect: Rect, margin = 0.05): FigureState {
  const inner = { minX: rect.minX + margin, minY: rect.minY + margin, maxX: rect.maxX - margin, maxY: rect.maxY - margin };
  const c = clampToRect(figureCenter(f, rect), inner);
  return { ...f, offset: sub(c, rectCenter(rect)) };
}

/** Verschiebt die Figur ausgehend von `start` um `delta`. */
export function moveFigure(start: FigureState, delta: Vec2, rect: Rect): FigureState {
  return clampFigure({ ...start, offset: add(start.offset, delta) }, rect);
}

/**
 * Zwei-Finger-Geste: Drehung um den Winkel zwischen den Fingerpaaren und
 * Verschiebung um die Bewegung des Fingermittelpunkts.
 * a0/b0 = Fingerpositionen zu Beginn, a1/b1 = jetzt (normiert).
 */
export function pinchFigure(start: FigureState, a0: Vec2, b0: Vec2, a1: Vec2, b1: Vec2, rect: Rect): FigureState {
  const rotation = start.rotation + twoFingerRotation(a0, b0, a1, b1);
  const delta = sub(lerp(a1, b1, 0.5), lerp(a0, b0, 0.5));
  return clampFigure({ rotation, offset: add(start.offset, delta) }, rect);
}

/**
 * Abbildung von Koordinaten der ungedrehten, mittigen Figur auf die
 * Arbeitsfläche: erst um die Flächenmitte drehen, dann verschieben.
 */
export function figureTransform(f: FigureState, rect: Rect): Affine {
  return compose(translation(f.offset), rotationAbout(rectCenter(rect), f.rotation));
}
