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
function keeping(
  rotDeg: number,
  ox: number,
  oy: number,
  through: [number, number],
  motifLineDeg: number,
  keep: [number, number],
  kind: Kind = 'mirror',
  variant?: number,
): PlannedTarget {
  const target = throughPoint(kind, rotDeg, ox, oy, ...through, 1, motifLineDeg);
  const side = sideOf(motifPoint(target.scene.figure, ...keep), lineOf(target.scene.mirror), 0) as Side;
  return { ...target, variant, scene: { ...target.scene, mirror: { ...target.scene.mirror, originalSide: side } } };
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
  // Ungedreht, senkrecht durch die Dachspitze: ganzes Haus mit zwei Fenstern.
  keeping(0, 0, 0, ROOF_TOP, 90, [150, 120]),
  keeping(0, 0, 0, ROOF_TOP, 90, [50, 120]),
  // Achse senkrecht zur Dachkante durch die Wandecke: gerade Unterkante,
  // die gelben Wände bilden zusammen ein Quadrat.
  throughPoint('mirror', 225, 0.0753, -0.0267, ...WALL_CORNER, -1, 45),
  // Ganzes Haus neben dem ganzen Haus (eigener, kleinerer Maßstab).
  wholeBeside(0, -0.2, 0, 90, [0.51, 0.5], [100, 100]),
  t('mirror', 0, -0.0458, -0.0887, 30, 0.5, 0.4717, -1),
  t('mirror', 135, -0.078, -0.0878, 150, 0.5, 0.3862, 1),
  t('swap', 285, -0.0145, 0.0937, 45, 0.3863, 0.6137, -1),
  t('mirror', 75, -0.0712, -0.0443, 75, 0.419, 0.5, -1),
  t('rotate', 225, 0.015, 0.0863, 15, 0.5, 0.5265, 1),
  t('mirror', 300, 0.0114, -0.0609, 105, 0.5261, 0.5, -1),
  // Achse durch die waagrechte Fensterstrebe, untere Haushälfte ohne Dach: das Fenster erscheint ganz.
  throughPoint('mirror', 180, -0.0755, -0.0653, ...WINDOW_CENTER, 1, 0),
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

/** Formen: Mitte von Quadrat und Kreis, Dreieck, Ecken des Quadrats (Motivkoordinaten). */
const SQUARE_CENTER: [number, number] = [73, 93];
const CIRCLE_CENTER: [number, number] = [72, 154];
const TRIANGLE: [number, number] = [131, 105];
const TRIANGLE_TOP: [number, number] = [108, 58];

export const FORMEN_LAYOUT: PlannedTarget[] = [
  // Nicht gedreht, Achse durch die Kreismitte: Rechteck, Kreis, zwei Dreiecke.
  keeping(0, 0, -0.05, CIRCLE_CENTER, 90, TRIANGLE),
  // Achse durch die Mitte des Quadrats: das Blaue bleibt ein Quadrat.
  keeping(270, -0.0198, 0.0495, SQUARE_CENTER, 90, TRIANGLE),
  // Dreieck andersherum; Achse durch die Kreismitte wie bei Nr. 1.
  keeping(60, -0.0076, 0.0863, CIRCLE_CENTER, 90, TRIANGLE, 'swap', 1),
  // Spiegelung an den Diagonalen des Quadrats.
  keeping(330, 0.0023, -0.0284, SQUARE_CENTER, 45, TRIANGLE),
  keeping(345, -0.0254, 0.0275, SQUARE_CENTER, 135, CIRCLE_CENTER),
  t('mirror', 105, -0.0071, 0.0164, 60, 0.4846, 0.5, 1),
  // Drehung um 180° wie bei einer Spielkarte, um die untere Ecke zwischen
  // Quadrat und Dreieck: Ecken von Quadraten und Dreiecken treffen sich dort.
  { ...keeping(0, 0, -0.08, [108, 128], 0, SQUARE_CENTER, 'rotate'), pivot: [108, 128] },
  t('mirror', 225, 0.0867, -0.0968, 75, 0.6032, 0.5, 1),
  t('mirror', 45, 0.0103, -0.0476, 105, 0.437, 0.5, -1),
  // Nur das große grüne Quadrat aus zwei Dreiecken: Mit dem Original kämen
  // Quadrat und Kreis beim Spiegeln immer mit.
  { ...keeping(0, 0, 0.02, TRIANGLE_TOP, 45, TRIANGLE, 'error', 2), variantBoth: true },
  t('mirror', 270, -0.0093, -0.0846, 150, 0.5, 0.4716, -1),
  // Achse auf der langen Dreieckseite: zwei Dreiecke ergeben ein großes grünes Quadrat.
  keeping(90, 0, 0, TRIANGLE_TOP, 45, SQUARE_CENTER),
];

/** Schnecke: Kopf-, Haus- und Körpermitte, Punkte links/rechts/oben/unten (Motivkoordinaten). */
const SHELL_CENTER: [number, number] = [118, 100];
const SHELL_UPPER_RIGHT: [number, number] = [150, 70];
const HEAD_CENTER: [number, number] = [49, 120];
const FOOT_CENTER: [number, number] = [118, 152.5];
const LEFT: [number, number] = [10, 120];
const RIGHT: [number, number] = [190, 120];
const ABOVE: [number, number] = [118, 60];
const BELOW: [number, number] = [118, 190];

export const SCHNECKE_LAYOUT: PlannedTarget[] = [
  // Ohne Drehung, senkrecht durch die Mitte des Hauses, linke Seite bleibt.
  keeping(0, 0.05, 0, SHELL_CENTER, 90, LEFT),
  t('mirror', 135, 0.0584, 0.0594, 150, 0.5, 0.5542, -1),
  // Nur das Schneckenhaus als Kreis: Ohne Fühler ginge das, mit dem echten
  // Motiv kommt bei jeder Achse durch die Hausmitte ein Fühler oder das
  // Körperende mit ins Bild.
  { ...keeping(0, 0, 0, SHELL_CENTER, 30, SHELL_UPPER_RIGHT, 'error', 2), variantBoth: true },
  // Ohne Drehung, senkrecht durch die Kopfmitte, rechte Seite bleibt.
  keeping(0, 0.1, 0, HEAD_CENTER, 90, RIGHT),
  // Ohne Drehung, waagrecht durch die Mitte des Körpers, obere Seite bleibt.
  keeping(0, 0, -0.1, FOOT_CENTER, 0, ABOVE),
  t('mirror', 270, -0.087, -0.0136, 90, 0.4163, 0.5, -1),
  // Wie Nr. 5, aber die Spirale dreht andersherum und das Auge sitzt rechts.
  { ...keeping(0, 0, -0.1, FOOT_CENTER, 0, ABOVE, 'error', 3), variantBoth: true },
  t('mirror', 90, 0.0504, -0.0779, 75, 0.5078, 0.5, -1),
  // Wie Nr. 1, aber Farben von Haus und Körper vertauscht.
  keeping(0, 0.05, 0, SHELL_CENTER, 90, LEFT, 'swap'),
  // Ohne Drehung, senkrecht durch die Mitte des Hauses, rechte Seite bleibt.
  keeping(0, -0.05, 0, SHELL_CENTER, 90, RIGHT),
  // Ohne Drehung, senkrecht durch die Kopfmitte, linke Seite bleibt.
  keeping(0, 0.1, 0, HEAD_CENTER, 90, LEFT),
  // Ohne Drehung, waagrecht durch die Mitte des Körpers, untere Seite bleibt.
  keeping(0, 0, 0, FOOT_CENTER, 0, BELOW),
];

/** Segelboot: Mast, Spitzen der Segel, Punkte links/rechts und in den Segeln (Motivkoordinaten). */
const MAST: [number, number] = [100, 100];
const BIG_SAIL_TOP: [number, number] = [106, 66];
const SMALL_SAIL_TOP: [number, number] = [94, 82];
const HULL: [number, number] = [100, 156];

export const BOOT_LAYOUT: PlannedTarget[] = [
  // Ohne Drehung, senkrecht durch den Mast, linke Seite bleibt.
  keeping(0, 0.04, 0, MAST, 90, LEFT),
  t('swap', 300, 0.0103, -0.0231, 30, 0.5, 0.5658, -1),
  t('mirror', 315, -0.0697, -0.0605, 135, 0.438, 0.438, -1),
  // An der langen Seite des großen Segels: zwei Segel ergeben ein Quadrat.
  keeping(0, -0.08, -0.05, BIG_SAIL_TOP, 45, HULL),
  // Wie Nr. 1, aber beide kleinen Segel in der Farbe des großen Segels.
  { ...keeping(0, 0.04, 0, MAST, 90, LEFT, 'error', 2), variantBoth: true },
  t('mirror', 180, -0.0141, 0.0074, 90, 0.4392, 0.5, 1),
  t('mirror', 315, 0.0491, -0.0343, 30, 0.51, 0.3913, 1),
  // Wie Nr. 9 (zwei große Segel), aber mit Fahne: Am echten Boot sitzt die
  // Fahne auf der Seite des kleinen Segels.
  keeping(0, -0.04, 0, MAST, 90, RIGHT, 'swap', 0),
  // Ohne Drehung, senkrecht durch den Mast, rechte Seite bleibt.
  keeping(0, -0.04, 0, MAST, 90, RIGHT),
  // An der langen Seite des kleinen Segels: zwei Segel ergeben ein Quadrat.
  keeping(0, 0.08, -0.05, SMALL_SAIL_TOP, 135, HULL),
  t('mirror', 330, 0.0693, 0.0027, 0, 0.5, 0.6014, -1),
  t('mirror', 0, -0.0796, 0.0751, 150, 0.49, 0.5428, -1),
];

/** Auto: Radachsen, Wagenmitte, Fenster (Motivkoordinaten). */
const FRONT_AXLE: [number, number] = [58, 146];
const REAR_AXLE: [number, number] = [146, 146];
const CAR_CENTER: [number, number] = [100, 122];
const WHEEL_LINE: [number, number] = [100, 146];
const REAR_SQUARE: [number, number] = [112, 92];
const FRONT_SLOPE: [number, number] = [58, 92];
const REAR_SLOPE: [number, number] = [142, 92];

export const AUTO_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch die Wagenmitte, vordere Hälfte bleibt: zwei Fronten.
  keeping(0, 0, 0, CAR_CENTER, 90, LEFT),
  // An der schrägen Kante des vorderen Dreiecks.
  keeping(0, 0.1, 0.05, FRONT_SLOPE, 135, CAR_CENTER),
  // Wie Nr. 9 (zwei Hecks), aber mit Scheinwerfern hinten.
  keeping(0, 0, 0, CAR_CENTER, 90, RIGHT, 'swap'),
  // Senkrecht durch die Vorderachse, hinterer Teil bleibt: lange Limousine.
  keeping(0, 0.12, 0, FRONT_AXLE, 90, RIGHT),
  // An der Diagonale des hinteren Quadrats.
  keeping(0, 0.05, 0.05, REAR_SQUARE, 135, [124, 104]),
  // Waagrecht durch die Wagenmitte, obere Hälfte bleibt, alle Fenster gelb.
  { ...keeping(0, 0, 0, CAR_CENTER, 0, ABOVE, 'error', 0), variantBoth: true },
  // Waagrecht durch die Wagenmitte, untere Hälfte bleibt: Räder oben und unten.
  keeping(0, 0, 0, CAR_CENTER, 0, BELOW),
  // An der schrägen Kante des hinteren Dreiecks.
  keeping(0, -0.1, 0.05, REAR_SLOPE, 45, CAR_CENTER),
  // Senkrecht durch die Wagenmitte, hintere Hälfte bleibt: zwei Hecks.
  keeping(0, 0, 0, CAR_CENTER, 90, RIGHT),
  // Wie Nr. 9 (zwei Hecks), aber ganz ohne Türgriffe.
  { ...keeping(0, 0, 0, CAR_CENTER, 90, RIGHT, 'error', 2), variantBoth: true },
  // Waagrecht unter dem Auto durch die Radmitten: Die Räder bleiben ganze Kreise.
  keeping(0, 0, -0.1, WHEEL_LINE, 0, ABOVE),
  // Senkrecht durch die Hinterachse, vorderer Teil bleibt: lange Limousine.
  keeping(0, -0.12, 0, REAR_AXLE, 90, LEFT),
];

/** Eichhörnchen: Nase, Augen-, Kopf- und Körpermitte, Punkte am Rand (Motivkoordinaten). */
const SQ_NOSE: [number, number] = [44, 86];
const SQ_NUT: [number, number] = [44, 122];
const SQ_EYE: [number, number] = [70, 72];
const SQ_HEAD: [number, number] = [80, 78];
const SQ_BODY: [number, number] = [96, 136];
const SQ_TAIL: [number, number] = [150, 130];

/**
 * Die „Kuh“: um 30° gedreht, Achse senkrecht durch die Nase, um `dx`
 * (Anteil der Fläche) weiter ins Gesicht verschoben.
 */
function cow(dx: number, kind: Kind = 'mirror', variant?: number): PlannedTarget {
  const figure: FigureState = { rotation: 30 * DEG, offset: { x: 0, y: 0 } };
  const nose = motifPoint(figure, ...SQ_NOSE);
  const mirror = createMirror(UNIT_RECT, 90, { x: nose.x + dx, y: nose.y }, 1);
  const side = sideOf(motifPoint(figure, ...SQ_TAIL), lineOf(mirror), 0) as Side;
  return { kind, variant, variantBoth: kind === 'error' ? true : undefined, scene: { figure, mirror: { ...mirror, originalSide: side } } };
}

export const EICHHOERNCHEN_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch die Körpermitte, vordere Hälfte bleibt: Eichhörnchen von vorne.
  keeping(0, 0.05, 0, SQ_BODY, 90, [10, 100]),
  // Senkrecht durch die Nuss: zwei Eichhörnchen teilen sich eine Nuss
  // (sehr breit, daher eigener Maßstab).
  { ...keeping(0, 0.15, 0, SQ_NUT, 90, [190, 100]), ownScale: true },
  // Wie Nr. 7 (zwei Schwänze), aber mit zwei Augen, die geradeaus schauen.
  { ...keeping(0, -0.05, 0, SQ_HEAD, 90, [190, 100], 'error', 3), variantBoth: true },
  // Waagrecht durch die Bauchmitte, oben bleibt: zwei Eichhörnchen übereinander.
  keeping(0, 0, -0.05, SQ_BODY, 0, [96, 20]),
  // Diagonale durch die Körpermitte.
  keeping(0, 0, 0, SQ_BODY, 45, [160, 60]),
  // Wie die Kuh Nr. 8, aber ohne Nüstern.
  cow(0.03, 'error', 1),
  // Senkrecht durch die Kopfmitte, hintere Hälfte bleibt: zwei Schwänze.
  keeping(0, -0.05, 0, SQ_HEAD, 90, [190, 100]),
  // Die Kuh, Achse etwas weiter im Gesicht: Augen enger.
  cow(0.03),
  // Waagrecht knapp unter dem Kopf, unten bleibt: nur die beiden Unterteile.
  keeping(0, 0, -0.05, [96, 110], 0, [96, 190]),
  // Wie Nr. 1, aber die Ohren ohne Pinsel.
  { ...keeping(0, 0.05, 0, SQ_BODY, 90, [10, 100], 'error', 2), variantBoth: true },
  // Diagonale durch die Kopfmitte.
  keeping(0, 0, 0.05, SQ_HEAD, 45, [160, 20]),
  // Senkrecht durch das Auge, Rücken bleibt: ein Auge in der Mitte.
  keeping(0, -0.05, 0, SQ_EYE, 90, [190, 100]),
];

/**
 * Tetraktys: ungedreht, Achse mit dem Winkel durch den Punkt (Motivkoordinaten);
 * sichtbar bleibt die Seite mit `keep`. Die Figur wird so verschoben, dass die
 * zusammengesetzte Figur (Mittelpunkt `center`) mittig liegt.
 */
function tetra(lineDeg: number, through: [number, number], keep: [number, number], center: [number, number]): PlannedTarget {
  const base: FigureState = { rotation: 0, offset: { x: 0, y: 0 } };
  const c = motifPoint(base, ...center);
  const figure: FigureState = { rotation: 0, offset: { x: 0.5 - c.x, y: 0.5 - c.y } };
  const mirror = createMirror(UNIT_RECT, lineDeg, motifPoint(figure, ...through), 1);
  const side = sideOf(motifPoint(figure, ...keep), lineOf(mirror), 0) as Side;
  return { kind: 'mirror', scene: { figure, mirror: { ...mirror, originalSide: side } } };
}

/**
 * Tetraktys: statt Zielbildern die Zahlen 0 bis 21 der Reihe nach. Gefragt ist
 * eine Figur mit genau so vielen ganzen Kreisen. 0 bis 20 gehen (gespeichert ist
 * je eine Lösung), 21 geht nicht: 10 Kreise ergeben gespiegelt höchstens 20.
 */
export const TETRAKTYS_LAYOUT: PlannedTarget[] = [
  // 0 Kreise: Spiegel rechts neben der Figur, die leere Seite bleibt.
  { ...t('mirror', 0, 0, 0, 90, 0.92, 0.5, -1), label: '0' },
  // 1 Kreise: 1 auf der Achse, 0 ganz auf einer Seite
  { ...tetra(90.0, [184.0, -0.0], [484.0, -0.0], [184.0, 172.75]), label: '1' },
  // 2 Kreise: 0 auf der Achse, 1 ganz auf einer Seite
  { ...tetra(60.0, [-41.8, 24.13], [-301.6, 174.1], [37.0, 160.62]), label: '2' },
  // 3 Kreise: 1 auf der Achse, 1 ganz auf einer Seite
  { ...tetra(90.0, [44.0, -0.0], [-256.0, 0.0], [44.0, 148.5]), label: '3' },
  // 4 Kreise: 2 auf der Achse, 1 ganz auf einer Seite
  { ...tetra(60.0, [-20.8, 12.01], [-280.6, 162.0], [58.0, 148.5]), label: '4' },
  // 5 Kreise: 1 auf der Achse, 2 ganz auf einer Seite
  { ...tetra(79.0, [109.15, -21.22], [403.6, -78.5], [148.21, 131.21]), label: '5' },
  // 6 Kreise: 2 auf der Achse, 2 ganz auf einer Seite
  { ...tetra(90.0, [128.0, -0.0], [428.0, -0.0], [128.0, 124.25]), label: '6' },
  // 7 Kreise: 1 auf der Achse, 3 ganz auf einer Seite
  { ...tetra(79.0, [55.19, -10.73], [-239.3, 46.5], [88.13, 124.25]), label: '7' },
  // 8 Kreise: 0 auf der Achse, 4 ganz auf einer Seite
  { ...tetra(60.0, [42.2, -24.36], [302.0, -174.4], [121.0, 112.12]), label: '8' },
  // 9 Kreise: 3 auf der Achse, 3 ganz auf einer Seite
  { ...tetra(60.0, [21.2, -12.24], [-238.6, 137.8], [100.0, 124.25]), label: '9' },
  // 10 Kreise: 2 auf der Achse, 4 ganz auf einer Seite
  { ...tetra(90.0, [100.0, -0.0], [-200.0, 0.0], [100.0, 100.0]), label: '10' },
  // 11 Kreise: 3 auf der Achse, 4 ganz auf einer Seite
  { ...tetra(60.0, [21.2, -12.24], [281.0, -162.2], [100.0, 124.25]), label: '11' },
  // 12 Kreise: 0 auf der Achse, 6 ganz auf einer Seite
  { ...tetra(60.0, [42.2, -24.36], [-217.6, 125.6], [121.0, 112.12]), label: '12' },
  // 13 Kreise: 1 auf der Achse, 6 ganz auf einer Seite
  { ...tetra(79.0, [55.19, -10.73], [349.7, -68.0], [94.25, 117.45]), label: '13' },
  // 14 Kreise: 2 auf der Achse, 6 ganz auf einer Seite
  { ...tetra(90.0, [128.0, -0.0], [-172.0, 0.0], [128.0, 100.0]), label: '14' },
  // 15 Kreise: 1 auf der Achse, 7 ganz auf einer Seite
  { ...tetra(79.0, [109.15, -21.22], [-185.3, 36.0], [142.09, 96.52]), label: '15' },
  // 16 Kreise: 2 auf der Achse, 7 ganz auf einer Seite
  { ...tetra(60.0, [-20.8, 12.01], [239.0, -138.0], [58.0, 148.5]), label: '16' },
  // 17 Kreise: 1 auf der Achse, 8 ganz auf einer Seite
  { ...tetra(90.0, [44.0, -0.0], [344.0, -0.0], [44.0, 100.0]), label: '17' },
  // 18 Kreise: 0 auf der Achse, 9 ganz auf einer Seite
  { ...tetra(60.0, [-41.8, 24.13], [218.0, -125.9], [37.0, 160.62]), label: '18' },
  // 19 Kreise: 1 auf der Achse, 9 ganz auf einer Seite
  { ...tetra(90.0, [184.0, -0.0], [-116.0, 0.0], [184.0, 100.0]), label: '19' },
  // 20 Kreise: 0 auf der Achse, 10 ganz auf einer Seite
  { ...tetra(75.0, [148.77, -39.86], [-141.0, 37.8], [193.03, 83.31]), label: '20' },
  // 21 Kreise gehen nicht (Szene ohne Bedeutung, das Feld zeigt nur die Zahl).
  { ...t('translate', 0, 0, 0, 90, 0.5, 0.5, 1), label: '21', ownScale: true },
];

/** Stoffhasen: Mitte des vorderen und des hinteren Hasen, rechter Fuß des hinteren (Motivkoordinaten). */
const FRONT_BUNNY: [number, number] = [70, 120];
const BACK_BUNNY: [number, number] = [130, 120];
const BACK_RIGHT_FOOT: [number, number] = [159, 166];

export const HASEN_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch den vorderen Hasen, links bleibt: nur der vordere, mit zwei Broschen.
  keeping(0, 0.1, 0, FRONT_BUNNY, 90, LEFT),
  // Waagrecht durch die Bauchmitte des vorderen Hasen, oben bleibt.
  keeping(0, 0, -0.1, [100, 154], 0, ABOVE),
  // Wie Nr. 8, aber die Farben der beiden Hasen sind vertauscht.
  keeping(0, 0.05, 0, FRONT_BUNNY, 90, RIGHT, 'swap', 0),
  // Senkrecht durch den rechten Fuß des hinteren Hasen: vier Hasen, die
  // hinteren teilen sich einen Fuß (sehr breit, daher eigener Maßstab).
  { ...keeping(0, -0.12, 0, BACK_RIGHT_FOOT, 90, LEFT), ownScale: true },
  // Senkrecht durch den hinteren Hasen, rechts bleibt: nur der hintere.
  keeping(0, -0.1, 0, BACK_BUNNY, 90, RIGHT),
  // 45° durch das Ohr des hinteren Hasen: ein zweites Hasenpaar balanciert
  // schräg auf dem Ohr.
  { ...keeping(0, -0.12, 0.14, [144, 46], 45, [160, 200]), ownScale: true },
  // Wie Nr. 1 (nur der vordere Hase), aber ohne Broschen.
  { ...keeping(0, 0.1, 0, FRONT_BUNNY, 90, LEFT, 'error', 0), variantBoth: true },
  // Senkrecht durch den vorderen Hasen, rechts bleibt: hinterer Hase zweimal.
  keeping(0, 0.05, 0, FRONT_BUNNY, 90, RIGHT),
  // Waagrecht am Halsansatz des vorderen Hasen, unten bleibt.
  keeping(0, 0, 0.05, [100, 128], 0, BELOW),
  // Wie Nr. 11 (zwei vordere Hasen um den hinteren), aber ohne Broschen.
  { ...keeping(0, -0.05, 0, BACK_BUNNY, 90, LEFT, 'error', 0), variantBoth: true },
  // Senkrecht durch den hinteren Hasen, links bleibt: vorderer Hase zweimal.
  keeping(0, -0.05, 0, BACK_BUNNY, 90, LEFT),
  // 30° durch den linken Fuß des vorderen Hasen: ein zweites Hasenpaar
  // purzelt schräg nach unten weg.
  { ...keeping(0, 0.12, -0.14, [41, 178], 30, [150, 20]), ownScale: true },
];

/** Würfel: Ecken des Sechsecks und Mitte (Motivkoordinaten). */
const CUBE = {
  T: [100, 40] as [number, number],
  UR: [152, 70] as [number, number],
  LR: [152, 130] as [number, number],
  B: [100, 160] as [number, number],
  LL: [48, 130] as [number, number],
  UL: [48, 70] as [number, number],
  C: [100, 100] as [number, number],
};
const deg = (p: [number, number], q: [number, number]) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;

export const WUERFEL_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch die Mitte, links bleibt: beide Seiten magenta.
  keeping(0, 0, 0, CUBE.C, 90, LEFT),
  // An der langen Diagonale der linken Raute.
  keeping(0, 0.05, -0.03, CUBE.UL, deg(CUBE.UL, CUBE.B), [190, 60]),
  // Würfel und daneben derselbe Würfel um 180° gedreht (wie Nr. 8, aber gedreht).
  { ...keeping(0, -0.06, -0.06, CUBE.LR, deg(CUBE.LR, CUBE.B), CUBE.C, 'rotate'), pivot: [126, 145] },
  // Entlang der rechten Außenkante: der ganze Würfel verdoppelt.
  keeping(0, -0.1, 0, CUBE.UR, 90, LEFT),
  // Waagrecht durch die lange Diagonale der oberen Raute, unten bleibt.
  keeping(0, 0, 0.1, CUBE.UL, 0, BELOW),
  // Entlang der Kante von der Mitte nach links unten, rechts oben bleibt.
  keeping(0, 0, 0, CUBE.UR, deg(CUBE.UR, CUBE.LL), [150, 20]),
  // Nur der Würfel selbst: Er ist nicht symmetrisch, kann also nicht entstehen.
  keeping(0, 0, 0, CUBE.C, 90, LEFT, 'error', 0),
  // Entlang der Außenkante rechts unten: Würfel verdoppelt nach rechts unten.
  keeping(0, -0.08, -0.08, CUBE.LR, deg(CUBE.LR, CUBE.B), CUBE.C),
  // An der langen Diagonale der rechten Raute.
  keeping(0, -0.05, -0.03, CUBE.UR, deg(CUBE.UR, CUBE.B), [10, 60]),
  // Wie Nr. 4, aber verschoben statt gespiegelt (beide Würfel gleich gefärbt).
  keeping(0, -0.1, 0, CUBE.UR, 90, LEFT, 'translate'),
  // Waagrecht durch die lange Diagonale der oberen Raute, oben bleibt: nur die obere Raute.
  keeping(0, 0, 0.05, CUBE.UL, 0, ABOVE),
  // Entlang der Außenkante links oben: Würfel verdoppelt nach links oben.
  keeping(0, 0.08, 0.08, CUBE.UL, deg(CUBE.UL, CUBE.T), CUBE.C),
];

/** Buntstifte: Mitten der Stifte (Motivkoordinaten). */
const PEN = {
  magenta: [73.5, 145.9] as [number, number],
  gruen: [47, 100] as [number, number],
  cyan: [100, 100] as [number, number],
  rot: [126.5, 54.1] as [number, number],
  gelb: [153, 100] as [number, number],
};
/** Achse parallel zum Cyan-Stift in der Lücke daneben (Abstand 9,7 zur Stiftmitte). */
const besideCyan = (dir: 1 | -1): [number, number] => [100 - dir * 9.7 * Math.sin(60 * DEG), 100 + dir * 9.7 * Math.cos(60 * DEG)];

export const STIFTE_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch die Mitte des Magenta-Stifts, links bleibt:
  // Dreieck aus zwei grünen Stiften, Magenta mit zwei Enden.
  keeping(0, 0.05, -0.04, PEN.magenta, 90, [30, 140]),
  // Längs mitten im Cyan-Stift, links bleibt.
  keeping(0, 0, 0, PEN.cyan, 60, [20, 140]),
  // Quer durch die Mitte des grünen Stifts: zwei Magenta-Stifte, Grün mit zwei Spitzen.
  keeping(0, 0.04, -0.06, PEN.gruen, 30, [40, 150]),
  // Wie das Dreieck aus Nr. 1, aber rechts bleibt – Magenta hätte zwei Spitzen;
  // eingesetzt ist der gewöhnliche Stift mit einer Spitze.
  keeping(0, 0, 0, PEN.magenta, 90, [180, 60], 'error', 0),
  // Längs mitten im gelben Stift.
  { ...keeping(0, 0, 0, PEN.gelb, -60, [20, 140]), ownScale: true },
  // Senkrecht durch die Mitte des roten Stifts, rechts bleibt:
  // zwei gelbe Stifte, Rot mit zwei Enden.
  keeping(0, -0.05, 0.04, PEN.rot, 90, [170, 60]),
  // Links neben dem Cyan-Stift, links bleibt: Raute aus Magenta und Grün.
  keeping(0, 0.04, -0.03, besideCyan(1), 60, [20, 140]),
  // Wie Nr. 3, aber Grün mit nur einer Spitze.
  keeping(0, 0.04, -0.06, PEN.gruen, 30, [40, 150], 'error', 1),
  // Quer durch die Mitte des gelben Stifts: zwei rote Stifte, Gelb mit zwei Spitzen.
  keeping(0, -0.04, 0.06, PEN.gelb, 30, [170, 40]),
  // Rechts neben dem Cyan-Stift, rechts bleibt: Raute aus Rot und Gelb.
  keeping(0, -0.04, 0.03, besideCyan(-1), 60, [180, 60]),
  // Wie Nr. 6, aber Rot mit nur einem Ende.
  keeping(0, -0.05, 0.04, PEN.rot, 90, [170, 60], 'error', 2),
  // Wie Nr. 3, aber gedreht: der grüne Stift liegt waagrecht.
  keeping(240, 0, 0, PEN.gruen, 30, [40, 150]),
];

/** Gesicht: Nase (Mitte) und linkes Auge (Motivkoordinaten). */
const NOSE: [number, number] = [100, 100];
const EYE_LEFT: [number, number] = [68, 78];

const EYE_RIGHT: [number, number] = [132, 78];
/** Punkt links am Kinn, knapp innerhalb des Kopfkreises. */
const CHIN_LEFT: [number, number] = [52, 148];

export const GESICHT_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch die Nase, links bleibt: fröhlich.
  keeping(0, 0, 0, NOSE, 90, LEFT),
  // Waagrecht durch die Nase, oben bleibt: vier Augen, die Locke wird zum Mund.
  keeping(0, 0, 0, NOSE, 0, ABOVE),
  // Waagrecht durch die Augen, oben bleibt: gestauchtes Gesicht mit zwei Augen.
  keeping(0, 0, 0, EYE_LEFT, 0, ABOVE),
  // Fröhliches Gesicht ohne Nase: Die Achse müsste durch die Nase gehen.
  { ...keeping(0, 0, 0, NOSE, 90, LEFT, 'error', 0), variantBoth: true },
  // Senkrecht durch die Nase, rechts bleibt: traurig.
  keeping(0, 0, 0, NOSE, 90, RIGHT),
  // Senkrecht durch das rechte Auge, links bleibt: breit und fröhlich, drei Augen.
  keeping(0, 0, 0, EYE_RIGHT, 90, LEFT),
  // Diagonal durch das linke Auge: zwei Gesichter schräg übereinander.
  keeping(0, 0, 0, EYE_LEFT, -45, [180, 180]),
  // Drehsymmetrie: das zweite Gesicht steht auf dem Kopf und hängt links
  // am Kinn mit dem ersten zusammen (Drehung um einen Punkt am Kinn).
  { ...keeping(0, 0.06, -0.06, CHIN_LEFT, 45, [180, 20], 'rotate'), pivot: CHIN_LEFT },
  // Waagrecht durch die Nase, unten bleibt: der Mund wird oben zur Locke.
  keeping(0, 0, 0, NOSE, 0, BELOW),
  // Waagrecht durch die Augen, unten bleibt: langes Gesicht mit zwei Nasen.
  keeping(0, 0, 0, EYE_LEFT, 0, BELOW),
  // Wie Nr. 2, aber der Mund ist die seitenverkehrte Locke.
  keeping(0, 0, 0, NOSE, 0, ABOVE, 'error', 1),
  // Senkrecht zwischen linkem Auge und Nase, links bleibt: schmales,
  // fröhliches Gesicht mit zwei Augen und ohne Nase.
  keeping(0, 0, 0, [82, 100], 90, LEFT),
];

/** MIA: Mitten der Buchstaben und Lücken dazwischen (Motivkoordinaten). */
const I_MID: [number, number] = [102, 100];
const GAP_MI: [number, number] = [80, 100];
const GAP_IA: [number, number] = [125, 100];
const A_MID_MIA: [number, number] = [160, 100];
/** Knapp unter den Buchstaben. */
const UNDER_MIA: [number, number] = [100, 152];
/** Mitte des A in der Fehlervariante „MA“. */
const A_IN_MA: [number, number] = [114, 100];

export const MIA_LAYOUT: PlannedTarget[] = [
  // Senkrecht durch das I, rechts bleibt: AIA.
  keeping(0, 0, 0, I_MID, 90, RIGHT),
  // Waagrecht durch die Mitte, oben bleibt.
  keeping(0, 0, 0, I_MID, 0, ABOVE),
  // Senkrecht durch das I, links bleibt: MIM.
  keeping(0, 0, 0, I_MID, 90, LEFT),
  // MIMI geht nicht (rückwärts gelesen IMIM): „MI“ verschoben statt gespiegelt.
  { ...keeping(0, 0.06, 0, GAP_IA, 90, LEFT, 'translate'), gap: 0.0085 },
  // In der Lücke zwischen M und I, rechts bleibt: AIIA.
  keeping(0, 0, 0, GAP_MI, 90, RIGHT),
  // Knapp unter dem Wort, oben bleibt: darunter MIA auf dem Kopf.
  keeping(0, 0, -0.08, UNDER_MIA, 0, ABOVE),
  // MIA über MIA (verschoben statt gespiegelt: unten steht nichts auf dem Kopf).
  { ...keeping(0, 0, -0.08, UNDER_MIA, 0, ABOVE, 'translate'), gap: 0.02 },
  // In der Lücke zwischen I und A, rechts bleibt: AA.
  keeping(0, -0.04, 0, GAP_IA, 90, RIGHT),
  // In der Lücke zwischen M und I, links bleibt: MM.
  keeping(0, 0.04, 0, GAP_MI, 90, LEFT),
  // MAM geht nicht: M und A stehen in MIA nicht nebeneinander.
  { ...keeping(0, 0, 0, A_IN_MA, 90, LEFT, 'error', 0), variantBoth: true },
  // Waagrecht durch die Mitte, unten bleibt.
  keeping(0, 0, 0, I_MID, 0, BELOW),
  // Senkrecht durch das A, links bleibt: MIAIM.
  { ...keeping(0, -0.13, 0, A_MID_MIA, 90, LEFT), ownScale: true },
];

/**
 * Würfelbau: Linien des Schrägbilds (Motivkoordinaten). Senkrechte von links
 * nach rechts, waagrechte von unten nach oben gezählt, schräge von oben.
 */
const BAU = {
  senkrecht2: [71.5, 100] as [number, number],
  senkrecht4: [109.5, 100] as [number, number],
  waagrecht2: [100, 147.5] as [number, number],
  waagrecht3: [100, 128.5] as [number, number],
  waagrecht5: [100, 71.5] as [number, number],
  /** Schräge Linien (45° nach rechts oben) x + y = 143 bzw. 181. */
  schraeg2: [71.5, 71.5] as [number, number],
  schraeg3: [90.5, 90.5] as [number, number],
  /** Untere rechte Ecke des Brombeer-Quadrats unten rechts. */
  eckeUnten: [147.5, 185.5] as [number, number],
};
const OBEN_LINKS: [number, number] = [20, 20];
const UNTEN_RECHTS: [number, number] = [190, 190];

export const WUERFELBAU_LAYOUT: PlannedTarget[] = [
  // 1. Turm: 2. senkrechte Linie, links bleibt.
  keeping(0, 0, 0, BAU.senkrecht2, 90, LEFT),
  // 2. 3. waagrechte Linie, unten bleibt, um 90° gegen den Uhrzeigersinn gedreht.
  keeping(-90, 0, 0, BAU.waagrecht3, 0, BELOW),
  // 3. 2. schräge Linie von oben, oben bleibt.
  keeping(0, 0, 0, BAU.schraeg2, -45, OBEN_LINKS),
  // Fehler: wie der Turm, aber rechts Petrol und Brombeer vertauscht.
  keeping(0, 0, 0, BAU.senkrecht2, 90, LEFT, 'error', 0),
  // 3. schräge Linie von oben, oben bleibt.
  keeping(0, 0, 0, BAU.schraeg3, -45, OBEN_LINKS),
  // 3. schräge Linie von oben, unten bleibt (Achse um eine halbe Strichbreite
  // nach unten versetzt, sonst bliebe die Kante als feiner Strich stehen).
  keeping(0, 0, 0, [94, 94], -45, UNTEN_RECHTS),
  // Würfelbau neben Würfelbau (verschoben statt gespiegelt).
  wholeBeside(0, -0.2, 0, 90, [0.51, 0.5], [100, 100]),
  // Ring: Achse ab der unteren rechten Ecke des Brombeer-Quadrats, 75° nach links oben, links bleibt.
  keeping(0, 0, 0, BAU.eckeUnten, 75, LEFT),
  // 2. waagrechte Linie, oben bleibt, um 90° im Uhrzeigersinn gedreht.
  keeping(90, 0, 0, BAU.waagrecht2, 0, ABOVE),
  // Haus mit Loch: 4. senkrechte Linie, links bleibt.
  keeping(0, 0, 0, BAU.senkrecht4, 90, LEFT),
  // Fehler: wie das Haus, aber unten Ocker und Petrol vertauscht.
  keeping(0, 0, 0, BAU.senkrecht4, 90, LEFT, 'error', 1),
  // E-Figur: 5. waagrechte Linie, unten bleibt.
  keeping(0, 0, 0, BAU.waagrecht5, 0, BELOW),
];
