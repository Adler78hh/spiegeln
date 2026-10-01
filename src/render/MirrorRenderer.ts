/**
 * Zeichnet die Arbeitsfläche: Figur (gedreht), Originalseite, Spiegelseite,
 * rote Gerade und Anfasspunkte.
 *
 * Das Canvas enthält die quadratische Arbeitsfläche plus einen Rand `pad`,
 * damit die Anfasspunkte auf dem Rand vollständig sichtbar und greifbar sind.
 * Gezeichnet wird in normierten Koordinaten (Arbeitsfläche = 0…1).
 */
import {
  clipLineToRect,
  figureTransform,
  ghostOpacity,
  halves,
  lineOf,
  mirrorTransform,
  UNIT_RECT,
  visibleFraction,
  type FigureState,
  type MirrorState,
  type Vec2,
} from '../geometry';

export const COLORS = {
  area: '#fffdf8',
  areaBorder: '#d9cdb8',
  line: '#e0322b',
  lineActive: '#b81d17',
  handleFill: '#ffffff',
  mirrorTint: 'rgba(120, 170, 220, 0.18)',
  ghost: '#7f9cbf',
};

export interface RenderInput {
  mirror: MirrorState;
  /** Lage der Ausgangsfigur (Verschiebung und Drehung). */
  figure: FigureState;
  /** Aktiver Teil des Spiegels (wird hervorgehoben). */
  active?: 'a' | 'b' | 'line' | null;
}

export interface Layout {
  /** Kantenlänge des Canvas in CSS-Pixeln. */
  size: number;
  /** Rand um die Arbeitsfläche in CSS-Pixeln. */
  pad: number;
  /** Kantenlänge der Arbeitsfläche in CSS-Pixeln. */
  area: number;
}

/**
 * Anteil der Arbeitsfläche, den die Figur einnimmt (Durchmesser des
 * Umkreises). Kleiner als die Fläche, damit Platz für das Spiegelbild bleibt.
 */
export const FIGURE_DIAMETER = 0.6;

/** Auflösung der Stichproben-Maske für den sichtbaren Anteil der Figur. */
const MASK_SIZE = 48;
/** Maximale Deckkraft des blassen Umrisses. */
const GHOST_ALPHA = 0.6;

export class MirrorRenderer {
  private ctx: CanvasRenderingContext2D;
  private figure = document.createElement('canvas');
  private figureKey = '';
  /** Umriss der Figur (für den blassen Hinweis auf der Spiegelseite). */
  private outline = document.createElement('canvas');
  /** Stichproben der Figur (normierte Koordinaten der ungedrehten Figur). */
  private samples: Vec2[] = [];
  private image: CanvasImageSource | null = null;
  private imageAspect = 1;
  private imageVersion = 0;
  layout: Layout = { size: 0, pad: 0, area: 0 };
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D nicht verfügbar');
    this.ctx = ctx;
  }

  setImage(image: CanvasImageSource | null, width = 1, height = 1): void {
    this.image = image;
    this.imageAspect = width / height;
    this.imageVersion++;
  }

  resize(sizeCss: number, padCss: number, dpr: number): void {
    const px = Math.round(sizeCss * dpr);
    this.layout = { size: sizeCss, pad: padCss, area: sizeCss - 2 * padCss };
    this.dpr = dpr;
    if (this.canvas.width !== px) {
      this.canvas.width = px;
      this.canvas.height = px;
    }
  }

  /** CSS-Pixel relativ zum Canvas → normierte Koordinaten der Arbeitsfläche. */
  toNormalized(xCss: number, yCss: number): Vec2 {
    const { pad, area } = this.layout;
    return { x: (xCss - pad) / area, y: (yCss - pad) / area };
  }

  /** Rendert die ungedrehte, mittige Figur in einen Zwischenspeicher (nur bei Änderung). */
  private ensureFigure(): void {
    const px = Math.max(1, Math.round(this.layout.area * this.dpr));
    const key = `${px}|${this.imageVersion}`;
    if (key === this.figureKey) return;
    this.figureKey = key;
    const c = this.figure;
    if (c.width !== px) {
      c.width = px;
      c.height = px;
    }
    const g = c.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, px, px);
    if (!this.image) return;
    // Figur passt in einen Kreis, damit sie bei jeder Drehung ganz sichtbar bleibt.
    const diag = FIGURE_DIAMETER * px;
    const k = diag / Math.hypot(this.imageAspect, 1);
    const w = k * this.imageAspect;
    const h = k;
    g.translate(px / 2, px / 2);
    g.imageSmoothingQuality = 'high';
    g.drawImage(this.image, -w / 2, -h / 2, w, h);
    this.buildOutline(px);
    this.buildSamples(w / px, h / px);
  }

  /** Außenkontur der Figur als schmaler Ring (einmal pro Bild/Größe). */
  private buildOutline(px: number): void {
    const o = this.outline;
    o.width = px;
    o.height = px;
    const g = o.getContext('2d')!;
    const r = 2.5 * this.dpr;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.drawImage(this.figure, Math.cos(a) * r, Math.sin(a) * r);
    }
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = COLORS.ghost;
    g.fillRect(0, 0, px, px);
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(this.figure, 0, 0);
    g.globalCompositeOperation = 'source-over';
  }

  /** Stichproben der deckenden Pixel; ohne Pixelzugriff: Rechteck der Figur. */
  private buildSamples(wRel: number, hRel: number): void {
    const n = MASK_SIZE;
    const samples: Vec2[] = [];
    try {
      const m = document.createElement('canvas');
      m.width = n;
      m.height = n;
      const g = m.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(this.figure, 0, 0, n, n);
      const data = g.getImageData(0, 0, n, n).data;
      for (let i = 0; i < n * n; i++) {
        if (data[i * 4 + 3] > 64) samples.push({ x: ((i % n) + 0.5) / n, y: (Math.floor(i / n) + 0.5) / n });
      }
    } catch {
      // Canvas nicht lesbar: Bildrechteck als Näherung.
      for (let i = 0; i < n * n; i++) {
        const x = ((i % n) + 0.5) / n;
        const y = (Math.floor(i / n) + 0.5) / n;
        if (Math.abs(x - 0.5) <= wRel / 2 && Math.abs(y - 0.5) <= hRel / 2) samples.push({ x, y });
      }
    }
    this.samples = samples;
  }

  draw(input: RenderInput): void {
    const { ctx } = this;
    const { pad, area } = this.layout;
    if (area <= 0) return;
    const s = this.dpr * area;
    this.ensureFigure();
    const place = figureTransform(input.figure, UNIT_RECT);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Ab hier normierte Koordinaten.
    ctx.setTransform(s, 0, 0, s, this.dpr * pad, this.dpr * pad);
    const px = 1 / area; // ein CSS-Pixel in normierten Einheiten

    ctx.fillStyle = COLORS.area;
    ctx.fillRect(0, 0, 1, 1);

    const { original, mirror } = halves(input.mirror, UNIT_RECT);

    // Originalseite
    ctx.save();
    pathPolygon(ctx, original);
    ctx.clip();
    ctx.transform(...place);
    ctx.drawImage(this.figure, 0, 0, 1, 1);
    ctx.restore();

    // Spiegelseite
    ctx.save();
    pathPolygon(ctx, mirror);
    ctx.clip();
    ctx.transform(...mirrorTransform(input.mirror));
    ctx.transform(...place);
    ctx.drawImage(this.figure, 0, 0, 1, 1);
    ctx.restore();

    // Blasser Umriss des verdeckten Teils, nur wenn die Figur sonst fast ganz verschwände.
    const ghost = ghostOpacity(visibleFraction(this.samples, input.figure, input.mirror, UNIT_RECT));
    if (ghost > 0) {
      ctx.save();
      pathPolygon(ctx, mirror);
      ctx.clip();
      ctx.globalAlpha = ghost * GHOST_ALPHA;
      ctx.transform(...place);
      ctx.drawImage(this.outline, 0, 0, 1, 1);
      ctx.restore();
    }

    // Dezenter "Glas"-Saum auf der Spiegelseite entlang der Geraden
    this.drawGlassEdge(input.mirror, mirror, px);

    ctx.strokeStyle = COLORS.areaBorder;
    ctx.lineWidth = 2 * px;
    ctx.strokeRect(0, 0, 1, 1);

    this.drawLine(input, px);
  }

  private drawGlassEdge(m: MirrorState, mirrorPoly: Vec2[], px: number): void {
    const clip = clipLineToRect(lineOf(m), UNIT_RECT);
    if (!clip || mirrorPoly.length < 3) return;
    const { ctx } = this;
    const d = { x: clip.exit.x - clip.entry.x, y: clip.exit.y - clip.entry.y };
    const len = Math.hypot(d.x, d.y);
    // Normale zur Spiegelseite
    const n = { x: (-d.y / len) * -m.originalSide, y: (d.x / len) * -m.originalSide };
    const w = 14 * px;
    const mid = { x: (clip.entry.x + clip.exit.x) / 2, y: (clip.entry.y + clip.exit.y) / 2 };
    const grad = ctx.createLinearGradient(mid.x, mid.y, mid.x + n.x * w, mid.y + n.y * w);
    grad.addColorStop(0, COLORS.mirrorTint);
    grad.addColorStop(1, 'rgba(120, 170, 220, 0)');
    ctx.save();
    pathPolygon(ctx, mirrorPoly);
    ctx.clip();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(clip.entry.x, clip.entry.y);
    ctx.lineTo(clip.exit.x, clip.exit.y);
    ctx.lineTo(clip.exit.x + n.x * w, clip.exit.y + n.y * w);
    ctx.lineTo(clip.entry.x + n.x * w, clip.entry.y + n.y * w);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawLine(input: RenderInput, px: number): void {
    const { ctx } = this;
    const m = input.mirror;
    const clip = clipLineToRect(lineOf(m), UNIT_RECT);
    if (!clip) return;
    const lineActive = input.active === 'line';

    ctx.save();
    ctx.lineCap = 'round';
    // weißer Unterleger für Kontrast auf bunten Motiven
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = (lineActive ? 12 : 10) * px;
    ctx.beginPath();
    ctx.moveTo(clip.entry.x, clip.entry.y);
    ctx.lineTo(clip.exit.x, clip.exit.y);
    ctx.stroke();
    ctx.strokeStyle = lineActive ? COLORS.lineActive : COLORS.line;
    ctx.lineWidth = (lineActive ? 7 : 5) * px;
    ctx.stroke();

    for (const id of ['a', 'b'] as const) {
      const p = m[id];
      const active = input.active === id;
      const r = (active ? 26 : 22) * px;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.handleFill;
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6 * this.dpr;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 6 * px;
      ctx.strokeStyle = active ? COLORS.lineActive : COLORS.line;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7 * px, 0, Math.PI * 2);
      ctx.fillStyle = active ? COLORS.lineActive : COLORS.line;
      ctx.fill();
    }
    ctx.restore();
  }
}

function pathPolygon(ctx: CanvasRenderingContext2D, poly: Vec2[]): void {
  ctx.beginPath();
  poly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
}
