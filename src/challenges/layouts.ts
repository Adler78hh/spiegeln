/**
 * Fest vorgegebene Zielfiguren einzelner Herausforderungen, in der
 * Reihenfolge, in der die Kinder sie sehen.
 *
 * `t(art, Drehung°, Versatz x, Versatz y, Achse°, Punkt x, Punkt y, Seite)`:
 * Figur um den Winkel gedreht und verschoben, Spiegelachse mit dem Winkel
 * durch den Punkt; die Seite gibt die sichtbare Originalhälfte an.
 */
import {
  apply,
  createMirror,
  DEG,
  figureTransform,
  lineOf,
  sideOf,
  UNIT_RECT,
  type FigureState,
  type Side,
  type Vec2,
} from '../geometry';
import { motifToFigurePoint } from '../render/composite';
import type { PlannedTarget } from './builtin';

type Kind = PlannedTarget['kind'];

function t(kind: Kind, rotDeg: number, ox: number, oy: number, lineDeg: number, tx: number, ty: number, side: Side, variant?: number): PlannedTarget {
  const figure: FigureState = { rotation: rotDeg * DEG, offset: { x: ox, y: oy } };
  return { kind, scene: { figure, mirror: createMirror(UNIT_RECT, lineDeg, { x: tx, y: ty }, side) }, variant };
}

/** Punkt des Motivs (Koordinaten 0…200) nach dem Drehen und Verschieben der Figur. */
function motifPoint(figure: FigureState, mx: number, my: number): Vec2 {
  return apply(figureTransform(figure, UNIT_RECT), motifToFigurePoint({ x: mx / 200, y: my / 200 }, 1));
}

/**
 * Spiegelachse durch einen Motivpunkt, Winkel im Motiv gemessen (90° = entlang
 * der Hochachse der Figur). Durch die Dachspitze entsteht so wieder ein
 * ganzes, symmetrisches Haus.
 */
function throughPoint(kind: Kind, rotDeg: number, ox: number, oy: number, mx: number, my: number, side: Side, motifLineDeg = 90): PlannedTarget {
  const figure: FigureState = { rotation: rotDeg * DEG, offset: { x: ox, y: oy } };
  const p = motifPoint(figure, mx, my);
  return { kind, scene: { figure, mirror: createMirror(UNIT_RECT, motifLineDeg + rotDeg, p, side) } };
}

/**
 * Ganze Figur neben der ganzen Figur (Verschiebung, unlösbar): Achse
 * senkrecht knapp rechts neben der Figur, die Figur bleibt vollständig auf
 * der Originalseite.
 */
function sideBySide(rotDeg: number, ox: number, oy: number, lineX: number): PlannedTarget {
  const figure: FigureState = { rotation: rotDeg * DEG, offset: { x: ox, y: oy } };
  const probe = createMirror(UNIT_RECT, 90, { x: lineX, y: 0.5 }, 1);
  const side = sideOf(motifPoint(figure, 100, 100), lineOf(probe), 0) as Side;
  return { kind: 'translate', scene: { figure, mirror: { ...probe, originalSide: side } }, ownScale: true };
}

/** Dachspitze und rechte untere Wandecke des Hauses (Motivkoordinaten). */
const ROOF_TOP: [number, number] = [100, 16];
const WALL_CORNER: [number, number] = [156, 184];
/** Mitte des Fensters (Kreuzungspunkt der Fensterstreben). */
const WINDOW_CENTER: [number, number] = [125, 130];

export const HAUS_LAYOUT: PlannedTarget[] = [
  t('mirror', 0, -0.0458, -0.0887, 30, 0.5, 0.4717, -1),
  t('mirror', 135, -0.078, -0.0878, 150, 0.5, 0.3862, 1),
  t('swap', 285, -0.0145, 0.0937, 45, 0.3863, 0.6137, -1),
  // Achse durch die Dachspitze: ganzes Haus mit dreieckigem Dach.
  throughPoint('mirror', 45, 0.0286, -0.0232, ...ROOF_TOP, -1),
  t('mirror', 75, -0.0712, -0.0443, 75, 0.419, 0.5, -1),
  // Achse senkrecht zur Dachkante durch die Wandecke: gerade Unterkante,
  // die gelben Wände bilden zusammen ein Quadrat.
  throughPoint('mirror', 225, 0.0753, -0.0267, ...WALL_CORNER, -1, 45),
  throughPoint('mirror', 15, -0.0129, 0.072, ...ROOF_TOP, 1),
  t('rotate', 225, 0.015, 0.0863, 15, 0.5, 0.5265, 1),
  t('mirror', 300, 0.0114, -0.0609, 105, 0.5261, 0.5, -1),
  // Achse durch die waagrechte Fensterstrebe: das Fenster erscheint ganz.
  throughPoint('mirror', 180, -0.0755, -0.0653, ...WINDOW_CENTER, -1, 0),
  // Ganzes Haus neben dem ganzen Haus (eigener, kleinerer Maßstab).
  sideBySide(0, -0.2, 0, 0.51),
  t('mirror', 210, -0.0845, -0.0229, 165, 0.5, 0.3936, 1),
];
