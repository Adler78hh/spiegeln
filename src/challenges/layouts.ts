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
 * Spiegelachse durch einen Motivpunkt (Winkel im Motiv gemessen); sichtbar
 * bleibt die Hälfte, in der der Motivpunkt `keep` liegt.
 */
function keeping(rotDeg: number, ox: number, oy: number, through: [number, number], motifLineDeg: number, keep: [number, number]): PlannedTarget {
  const target = throughPoint('mirror', rotDeg, ox, oy, ...through, 1, motifLineDeg);
  const side = sideOf(motifPoint(target.scene.figure, ...keep), lineOf(target.scene.mirror), 0) as Side;
  return { ...target, scene: { ...target.scene, mirror: { ...target.scene.mirror, originalSide: side } } };
}

/**
 * Ganze Figur neben der ganzen Figur (Verschiebung, unlösbar): Achse mit dem
 * Winkel durch den Punkt knapp neben der Figur, die Figur bleibt vollständig
 * auf der Originalseite; die Kopie steht mit etwas Abstand ganz auf der
 * anderen Seite. Eigener Maßstab, damit die anderen Zielfiguren
 * nicht mit verkleinert werden.
 */
function wholeBeside(rotDeg: number, ox: number, oy: number, lineDeg: number, through: [number, number], center: [number, number]): PlannedTarget {
  const figure: FigureState = { rotation: rotDeg * DEG, offset: { x: ox, y: oy } };
  const probe = createMirror(UNIT_RECT, lineDeg, { x: through[0], y: through[1] }, 1);
  const side = sideOf(motifPoint(figure, ...center), lineOf(probe), 0) as Side;
  return { kind: 'translate', scene: { figure, mirror: { ...probe, originalSide: side } }, ownScale: true, gap: 0.04 };
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
  // Achse durch die waagrechte Fensterstrebe, untere Haushälfte ohne Dach: das Fenster erscheint ganz.
  throughPoint('mirror', 180, -0.0755, -0.0653, ...WINDOW_CENTER, 1, 0),
  // Ganzes Haus neben dem ganzen Haus (eigener, kleinerer Maßstab).
  wholeBeside(0, -0.2, 0, 90, [0.51, 0.5], [100, 100]),
  t('mirror', 210, -0.0845, -0.0229, 165, 0.5, 0.3936, 1),
];

/** Fisch: Mitte der Längsachse, Auge, Maul (Motivkoordinaten). */
const FISH_AXIS: [number, number] = [88, 100];
const FISH_EYE: [number, number] = [62, 92];
const FISH_MOUTH: [number, number] = [40, 108];

export const FISCH_LAYOUT: PlannedTarget[] = [
  t('mirror', 45, 0.0943, -0.0773, 90, 0.6336, 0.5, 1),
  t('mirror', 45, 0.0886, 0.019, 135, 0.571, 0.571, 1),
  t('mirror', 45, -0.001, -0.0272, 165, 0.5, 0.5148, 1),
  // Waagrecht an der Längsachse: Fisch mit zwei Augen.
  keeping(0, 0, 0.02, FISH_AXIS, 0, FISH_EYE),
  t('error', 240, -0.0016, -0.0283, 165, 0.5, 0.4616, 1, 0),
  t('mirror', 210, 0.0335, 0.0741, 135, 0.5198, 0.5198, -1),
  // Waagrecht an der Längsachse: Fisch ohne Augen.
  keeping(180, 0.03, -0.02, FISH_AXIS, 0, FISH_MOUTH),
  t('mirror', 30, 0.0854, 0.087, 90, 0.6142, 0.5, -1),
  // Zwei ganze Fische übereinander.
  wholeBeside(0, 0, -0.18, 0, [0.5, 0.43], FISH_AXIS),
  t('mirror', 120, -0.08, -0.0044, 30, 0.5, 0.5307, -1),
  t('swap', 240, -0.0659, 0.0751, 120, 0.3788, 0.5, -1),
  t('mirror', 165, -0.0784, -0.0602, 60, 0.4174, 0.5, 1),
];
