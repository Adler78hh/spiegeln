/**
 * Gemeinsame Zeichenroutinen für Arbeitsfläche und Zielfiguren: Figur in
 * einen Zwischenspeicher legen und Originalhälfte + zweite Hälfte zeichnen.
 */
import {
  clipPolygonToHalfPlane,
  figureTransform,
  halves,
  lineOf,
  mirrorTransform,
  normal,
  rectCorners,
  scale,
  add,
  UNIT_RECT,
  type Affine,
  type Scene,
  type Vec2,
} from '../geometry';

export const AREA_COLOR = '#fffdf8';

/**
 * Anteil der Arbeitsfläche, den die Figur einnimmt (Durchmesser des
 * Umkreises). Kleiner als die Fläche, damit Platz für das Spiegelbild bleibt.
 */
export const FIGURE_DIAMETER = 0.6;

/** Auflösung der Stichproben-Maske einer Figur. */
const MASK_SIZE = 48;

/**
 * Zeichnet das Bild ungedreht und mittig in ein quadratisches Canvas der
 * Kantenlänge `px` (entspricht der Arbeitsfläche).
 */
export function createFigureBuffer(image: CanvasImageSource, aspect: number, px: number, target?: HTMLCanvasElement): HTMLCanvasElement {
  const c = target ?? document.createElement('canvas');
  if (c.width !== px) {
    c.width = px;
    c.height = px;
  }
  const g = c.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, px, px);
  // Figur passt in einen Kreis, damit sie bei jeder Drehung ganz sichtbar bleibt.
  const k = (FIGURE_DIAMETER * px) / Math.hypot(aspect, 1);
  const w = k * aspect;
  const h = k;
  g.imageSmoothingQuality = 'high';
  g.drawImage(image, (px - w) / 2, (px - h) / 2, w, h);
  return c;
}

/** Größe des Bildes in der Figur relativ zur Fläche (für Näherungen). */
export function figureSize(aspect: number): { w: number; h: number } {
  const k = FIGURE_DIAMETER / Math.hypot(aspect, 1);
  return { w: k * aspect, h: k };
}

/**
 * Stichproben der deckenden Pixel eines Figur-Zwischenspeichers in
 * normierten Koordinaten. Ohne Pixelzugriff: Bildrechteck als Näherung.
 */
export function sampleFigure(buffer: HTMLCanvasElement, aspect: number): Vec2[] {
  const n = MASK_SIZE;
  const samples: Vec2[] = [];
  try {
    const m = document.createElement('canvas');
    m.width = n;
    m.height = n;
    const g = m.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(buffer, 0, 0, n, n);
    const data = g.getImageData(0, 0, n, n).data;
    for (let i = 0; i < n * n; i++) {
      if (data[i * 4 + 3] > 64) samples.push({ x: ((i % n) + 0.5) / n, y: (Math.floor(i / n) + 0.5) / n });
    }
  } catch {
    const { w, h } = figureSize(aspect);
    for (let i = 0; i < n * n; i++) {
      const x = ((i % n) + 0.5) / n;
      const y = (Math.floor(i / n) + 0.5) / n;
      if (Math.abs(x - 0.5) <= w / 2 && Math.abs(y - 0.5) <= h / 2) samples.push({ x, y });
    }
  }
  return samples;
}

function pathPolygon(ctx: CanvasRenderingContext2D, poly: Vec2[]): void {
  ctx.beginPath();
  poly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
}

export { pathPolygon };

/**
 * Zeichnet Originalhälfte und zweite Hälfte. `ctx` muss bereits auf
 * normierte Koordinaten (Arbeitsfläche = 0…1) eingestellt sein.
 *
 * `otherFigure` ist normalerweise derselbe Zwischenspeicher wie
 * `originalFigure`; für Fehlerfiguren eine leicht veränderte Variante.
 * `other` bildet die Originalseite auf die andere Seite ab.
 */
export function drawComposite(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  originalFigure: CanvasImageSource,
  otherFigure: CanvasImageSource,
  other: Affine,
): { original: Vec2[]; mirror: Vec2[] } {
  const place = figureTransform(scene.figure, UNIT_RECT);
  const parts = halves(scene.mirror, UNIT_RECT);

  // Originalhälfte um ~1,5 Pixel in die andere Hälfte hinein zeichnen, damit an
  // der Geraden keine helle Naht durch Kantenglättung entsteht.
  const seam = 1.5 / Math.abs(ctx.getTransform().a || 1);
  const line = lineOf(scene.mirror);
  const shift = scale(normal(line), -scene.mirror.originalSide * seam);
  const widened = clipPolygonToHalfPlane(
    rectCorners(UNIT_RECT),
    { p: add(line.p, shift), q: add(line.q, shift) },
    scene.mirror.originalSide,
  );

  ctx.save();
  pathPolygon(ctx, widened);
  ctx.clip();
  ctx.transform(...place);
  ctx.drawImage(originalFigure, 0, 0, 1, 1);
  ctx.restore();

  ctx.save();
  pathPolygon(ctx, parts.mirror);
  ctx.clip();
  // Die zweite Hälfte zeigt (abgebildet) den Inhalt der Originalseite.
  ctx.transform(...other);
  pathPolygon(ctx, parts.original);
  ctx.clip();
  ctx.transform(...place);
  ctx.drawImage(otherFigure, 0, 0, 1, 1);
  ctx.restore();

  return parts;
}

/**
 * Farbumkehr beim Spiegeln:
 * - 'silhouette': zweifarbig – Originalhälfte schwarze Figur auf Orange,
 *   Spiegelhälfte orange Figur auf Schwarz (Figur und Grund tauschen).
 * - 'negative': Originalhälfte unverändert, Spiegelhälfte als Negativ
 *   (alle Farben umgekehrt, dunkler Grund).
 */
export type InvertMode = 'none' | 'silhouette' | 'negative';

export const INVERT_COLORS = { light: '#f28c28', dark: '#1d1b19', negativeGround: '#2d2a26' };

/** Figur einfarbig (nur ihre Form). */
export function silhouetteOf(fig: HTMLCanvasElement, color: string, out = document.createElement('canvas')): HTMLCanvasElement {
  out.width = fig.width;
  out.height = fig.height;
  const g = out.getContext('2d')!;
  g.clearRect(0, 0, out.width, out.height);
  g.drawImage(fig, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, out.width, out.height);
  g.globalCompositeOperation = 'source-over';
  return out;
}

/** Figur mit umgekehrten Farben (Transparenz bleibt). */
export function negativeOf(fig: HTMLCanvasElement, out = document.createElement('canvas')): HTMLCanvasElement {
  out.width = fig.width;
  out.height = fig.height;
  const g = out.getContext('2d')!;
  g.clearRect(0, 0, out.width, out.height);
  g.drawImage(fig, 0, 0);
  try {
    const d = g.getImageData(0, 0, out.width, out.height);
    const a = d.data;
    for (let i = 0; i < a.length; i += 4) {
      a[i] = 255 - a[i];
      a[i + 1] = 255 - a[i + 1];
      a[i + 2] = 255 - a[i + 2];
    }
    g.putImageData(d, 0, 0);
  } catch {
    // Ohne Pixelzugriff bleibt die Figur unverändert.
  }
  return out;
}

/** Vorbereitete Figuren für eine Farbumkehr (einmal pro Bild berechnen). */
export interface InvertBuffers {
  dark: HTMLCanvasElement;
  light: HTMLCanvasElement;
  negative: HTMLCanvasElement;
}

export function invertBuffers(fig: HTMLCanvasElement): InvertBuffers {
  return {
    dark: silhouetteOf(fig, INVERT_COLORS.dark),
    light: silhouetteOf(fig, INVERT_COLORS.light),
    negative: negativeOf(fig),
  };
}

/**
 * Zeichnet Hintergrund und gespiegelte Figur mit Farbumkehr (normierte
 * Koordinaten, Fläche 0…1). Bei 'none' wie gewohnt.
 */
export function drawInvertedComposite(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  fig: HTMLCanvasElement,
  mode: InvertMode,
  buffers: InvertBuffers | null,
): { original: Vec2[]; mirror: Vec2[] } {
  const parts = halves(scene.mirror, UNIT_RECT);
  const t = mirrorTransform(scene.mirror);
  if (mode === 'none' || !buffers) {
    ctx.fillStyle = AREA_COLOR;
    ctx.fillRect(0, 0, 1, 1);
    return drawComposite(ctx, scene, fig, fig, t);
  }
  const [groundOriginal, groundMirror] =
    mode === 'silhouette' ? [INVERT_COLORS.light, INVERT_COLORS.dark] : [AREA_COLOR, INVERT_COLORS.negativeGround];
  ctx.fillStyle = groundOriginal;
  pathPolygon(ctx, parts.original);
  ctx.fill();
  ctx.fillStyle = groundMirror;
  pathPolygon(ctx, parts.mirror);
  ctx.fill();
  const [first, other] = mode === 'silhouette' ? [buffers.dark, buffers.light] : [fig, buffers.negative];
  return drawComposite(ctx, scene, first, other, t);
}

/** Rendert eine zusammengesetzte Figur als eigenständiges Bild. */
export function renderComposite(
  px: number,
  scene: Scene,
  originalFigure: CanvasImageSource,
  otherFigure: CanvasImageSource,
  other: Affine,
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  const ctx = c.getContext('2d')!;
  ctx.setTransform(px, 0, 0, px, 0, 0);
  ctx.fillStyle = AREA_COLOR;
  ctx.fillRect(0, 0, 1, 1);
  drawComposite(ctx, scene, originalFigure, otherFigure, other);
  return c;
}

/** Wie `renderComposite`, aber mit Farbumkehr (Hintergrund gehört dazu). */
export function renderInvertedComposite(px: number, scene: Scene, fig: HTMLCanvasElement, mode: InvertMode): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  const ctx = c.getContext('2d')!;
  ctx.setTransform(px, 0, 0, px, 0, 0);
  drawInvertedComposite(ctx, scene, fig, mode, mode === 'none' ? null : invertBuffers(fig));
  return c;
}

/**
 * Anteil der Figurpixel, die sich zwischen zwei gleich großen Bildern
 * deutlich unterscheiden (bezogen auf die Figurfläche von `reference`).
 */
export function differenceRatio(candidate: HTMLCanvasElement, reference: HTMLCanvasElement): number {
  try {
    const da = candidate.getContext('2d')!.getImageData(0, 0, candidate.width, candidate.height).data;
    const db = reference.getContext('2d')!.getImageData(0, 0, reference.width, reference.height).data;
    const bg = hexToRgb(AREA_COLOR);
    let diff = 0;
    let content = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(db[i] - bg[0]) + Math.abs(db[i + 1] - bg[1]) + Math.abs(db[i + 2] - bg[2]) > 30) content++;
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 60) diff++;
    }
    return content ? diff / content : 0;
  } catch {
    return 1;
  }
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Begrenzungsrechteck des Inhalts (alles, was nicht Hintergrund ist), normiert. */
export function contentBounds(c: HTMLCanvasElement): Bounds | null {
  try {
    const { width: w, height: h } = c;
    const data = c.getContext('2d')!.getImageData(0, 0, w, h).data;
    const bg = hexToRgb(AREA_COLOR);
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    return { minX: minX / w, minY: minY / h, maxX: (maxX + 1) / w, maxY: (maxY + 1) / h };
  } catch {
    return null;
  }
}

/**
 * Schneidet ein quadratisches Stück der Kantenlänge `size` (normiert) um
 * `center` aus und skaliert es auf `outPx`. Außerhalb liegt Hintergrund.
 */
export function cropSquare(src: HTMLCanvasElement, center: { x: number; y: number }, size: number, outPx: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = outPx;
  c.height = outPx;
  const g = c.getContext('2d')!;
  g.fillStyle = AREA_COLOR;
  g.fillRect(0, 0, outPx, outPx);
  const k = outPx / (size * src.width);
  g.imageSmoothingQuality = 'high';
  g.setTransform(k, 0, 0, k, outPx / 2 - center.x * src.width * k, outPx / 2 - center.y * src.height * k);
  g.drawImage(src, 0, 0);
  return c;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Punkt im Motiv (0…1 relativ zum Bild) → Koordinaten der ungedrehten, mittigen Figur. */
export function motifToFigurePoint(p: { x: number; y: number }, aspect: number): Vec2 {
  const { w, h } = figureSize(aspect);
  return { x: 0.5 + (p.x - 0.5) * w, y: 0.5 + (p.y - 0.5) * h };
}
