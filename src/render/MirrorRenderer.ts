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
  lineOf,
  UNIT_RECT,
  type FigureState,
  type MirrorState,
  type Vec2,
} from '../geometry';
import { AREA_COLOR, createFigureBuffer, drawInvertedComposite, INVERT_COLORS, invertBuffers, pathPolygon, type InvertBuffers, type InvertMode } from './composite';

export const COLORS = {
  area: AREA_COLOR,
  areaBorder: '#d9cdb8',
  line: '#e0322b',
  lineActive: '#b81d17',
  handleFill: '#ffffff',
  mirrorTint: 'rgba(120, 170, 220, 0.18)',
  /** Signalfarbe des Umrisses (grelles Pink, kommt in keinem Motiv vor). */
  outline: '#ff1f8f',
};

export interface RenderInput {
  mirror: MirrorState;
  /** Lage der Ausgangsfigur (Verschiebung und Drehung). */
  figure: FigureState;
  /** Aktiver Teil des Spiegels (wird hervorgehoben). */
  active?: 'a' | 'b' | 'line' | null;
  /** Umriss der ganzen Ausgangsfigur zeigen (auch hinter dem Spiegel). */
  showOutline?: boolean;
  /** Spiegelachse ausblenden; die Anfasspunkte bleiben sichtbar. */
  hideLine?: boolean;
  /** Farbumkehr im Spiegelbild (nur freies Spiegeln). */
  invert?: InvertMode;
  /** Farbe der zweifarbigen Umkehr (neben Schwarz). */
  invertColor?: string;
}

export interface Layout {
  /** Kantenlänge des Canvas in CSS-Pixeln. */
  size: number;
  /** Rand um die Arbeitsfläche in CSS-Pixeln. */
  pad: number;
  /** Kantenlänge der Arbeitsfläche in CSS-Pixeln. */
  area: number;
}

export class MirrorRenderer {
  private ctx: CanvasRenderingContext2D;
  private figure = document.createElement('canvas');
  private figureKey = '';
  /** Umriss der Figur in Signalfarbe (zum Überprüfen fehlender Teile). */
  private outline = document.createElement('canvas');
  /** Einfarbige und negative Fassungen der Figur, erst bei Bedarf berechnet. */
  private inverted: InvertBuffers | null = null;
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

  /** Legt die ungedrehte, mittige Figur in einen Zwischenspeicher (nur bei Änderung). */
  private ensureFigure(): void {
    const px = Math.max(1, Math.round(this.layout.area * this.dpr));
    const key = `${px}|${this.imageVersion}`;
    if (key === this.figureKey) return;
    this.figureKey = key;
    this.inverted = null;
    if (!this.image) {
      this.figure.width = px;
      this.figure.height = px;
      return;
    }
    createFigureBuffer(this.image, this.imageAspect, px, this.figure);
    this.buildOutline(px);
  }

  /** Außenkontur der Figur als schmaler Ring (einmal pro Bild/Größe). */
  private buildOutline(px: number): void {
    const o = this.outline;
    o.width = px;
    o.height = px;
    const g = o.getContext('2d')!;
    const r = 3 * this.dpr;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.drawImage(this.figure, Math.cos(a) * r, Math.sin(a) * r);
    }
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = COLORS.outline;
    g.fillRect(0, 0, px, px);
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(this.figure, 0, 0);
    g.globalCompositeOperation = 'source-over';
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

    const invert = input.invert ?? 'none';
    const color = input.invertColor ?? INVERT_COLORS.light;
    if (invert !== 'none' && this.inverted?.color !== color) this.inverted = invertBuffers(this.figure, color);
    const { mirror } = drawInvertedComposite(ctx, input, this.figure, invert, this.inverted);

    // Dezenter "Glas"-Saum auf der Spiegelseite entlang der Geraden
    if (!input.hideLine) this.drawGlassEdge(input.mirror, mirror, px);

    // Umriss der ganzen Ausgangsfigur an ihrer echten Stelle, über beiden Seiten.
    if (input.showOutline) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 1, 1);
      ctx.clip();
      ctx.transform(...place);
      ctx.drawImage(this.outline, 0, 0, 1, 1);
      ctx.restore();
    }

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
    if (!input.hideLine) {
      ctx.lineCap = 'round';
      // weißer Unterleger für Kontrast auf bunten Motiven
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = (lineActive ? 8 : 6) * px;
      ctx.beginPath();
      ctx.moveTo(clip.entry.x, clip.entry.y);
      ctx.lineTo(clip.exit.x, clip.exit.y);
      ctx.stroke();
      ctx.strokeStyle = lineActive ? COLORS.lineActive : COLORS.line;
      ctx.lineWidth = (lineActive ? 4 : 3) * px;
      ctx.stroke();
    }

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
