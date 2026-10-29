/**
 * Zeichnung aus bearbeitbaren Elementen (Formen und Striche). Koordinaten
 * normiert (0…1) auf der quadratischen Zeichenfläche.
 *
 * Jedes Element hat einen eigenen Rahmen: Mitte (cx, cy), Breite w, Höhe h
 * und Drehung rot (Bogenmaß). Die Form bzw. die Strichpunkte liegen in
 * Rahmenkoordinaten −0,5…0,5; Strecken und Stauchen ändert nur w und h.
 */
import type { Vec2 } from '../geometry';

export type ShapeKind = 'square' | 'circle' | 'rtriangle' | 'etriangle' | 'parallelogram' | 'trapezoid';

interface Frame {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
}

export interface ShapeElement extends Frame {
  type: 'shape';
  shape: ShapeKind;
  fill: string;
  outline: boolean;
  line: string;
}

export interface PathElement extends Frame {
  type: 'path';
  /** Punkte in Rahmenkoordinaten (−0,5…0,5). */
  points: Vec2[];
  color: string;
  /** Strichstärke (normiert, unabhängig vom Strecken). */
  width: number;
}

export type DrawElement = ShapeElement | PathElement;

/** Gespeicherte Zeichnung (zum späteren Weiterbearbeiten). */
export interface DrawingDoc {
  version: 1;
  elements: DrawElement[];
}

/** Grundmaß a: Seitenlänge von Quadrat und Dreiecken, Durchmesser des Kreises. */
export const BASE = 0.22;
/** Feste Dicke der Umrandung. */
export const OUTLINE_WIDTH = 0.008;
export const DEFAULT_LINE = '#4a3b2f';

/** Größe der Formen in der Vorauswahl (in Vielfachen von a). */
const SIZE: Record<ShapeKind, [number, number]> = {
  square: [1, 1],
  circle: [1, 1],
  rtriangle: [1, 1],
  etriangle: [1, Math.sqrt(3) / 2],
  // Quadrat mit zwei angesetzten halben Quadraten (45°-Schrägen).
  parallelogram: [3, 1],
  trapezoid: [3, 1],
};

/** Umriss der Form im Rahmen (−0,5…0,5); null = Ellipse. */
export function shapeOutline(shape: ShapeKind): Vec2[] | null {
  const s = 1 / 6;
  switch (shape) {
    case 'square':
      return [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }];
    case 'circle':
      return null;
    case 'rtriangle': // halbes Quadrat, rechter Winkel unten links
      return [{ x: -0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }];
    case 'etriangle':
      return [{ x: 0, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }];
    case 'parallelogram': // unten und oben je 2a, um a versetzt
      return [{ x: -s, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: s, y: 0.5 }, { x: -0.5, y: 0.5 }];
    case 'trapezoid': // unten 3a, oben a
      return [{ x: -s, y: -0.5 }, { x: s, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }];
  }
}

let counter = 0;
export const newElementId = () => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Neue Form in Standardgröße in der Mitte der Fläche. */
export function createShape(shape: ShapeKind, fill: string): ShapeElement {
  const [fw, fh] = SIZE[shape];
  return { id: newElementId(), type: 'shape', shape, cx: 0.5, cy: 0.5, w: fw * BASE, h: fh * BASE, rot: 0, fill, outline: true, line: DEFAULT_LINE };
}

/** Rahmenpunkt → Flächenpunkt. */
export function toWorld(f: Frame, p: Vec2): Vec2 {
  const x = p.x * f.w;
  const y = p.y * f.h;
  const c = Math.cos(f.rot);
  const s = Math.sin(f.rot);
  return { x: f.cx + x * c - y * s, y: f.cy + x * s + y * c };
}

/** Flächenpunkt → Rahmenpunkt, ohne Teilen durch w/h (Abstände bleiben echt). */
function toLocalUnscaled(f: Frame, p: Vec2): Vec2 {
  const dx = p.x - f.cx;
  const dy = p.y - f.cy;
  const c = Math.cos(-f.rot);
  const s = Math.sin(-f.rot);
  return { x: dx * c - dy * s, y: dx * s + dy * c };
}

/** Strich aus Flächenpunkten: Rahmen um die Punkte, Drehung 0. */
export function pathFromWorld(points: Vec2[], color: string, width: number, id = newElementId()): PathElement {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  // Ein Punkt oder eine gerade Linie: Mindestgröße, damit der Rahmen greifbar bleibt.
  const w = Math.max(maxX - minX, 1e-4);
  const h = Math.max(maxY - minY, 1e-4);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { id, type: 'path', cx, cy, w, h, rot: 0, color, width, points: points.map((p) => ({ x: (p.x - cx) / w, y: (p.y - cy) / h })) };
}

export function worldPoints(e: PathElement): Vec2[] {
  return e.points.map((p) => toWorld(e, p));
}

function pointInPolygon(p: Vec2, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function distToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Liegt der Punkt auf dem Element? (`tol` = zusätzlicher Spielraum) */
export function hitElement(e: DrawElement, p: Vec2, tol = 0.01): boolean {
  if (e.type === 'path') {
    const pts = worldPoints(e);
    const r = e.width / 2 + tol;
    if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= r;
    for (let i = 1; i < pts.length; i++) if (distToSegment(p, pts[i - 1], pts[i]) <= r) return true;
    return false;
  }
  const l = toLocalUnscaled(e, p);
  const outline = shapeOutline(e.shape);
  if (!outline) {
    const rx = e.w / 2 + tol;
    const ry = e.h / 2 + tol;
    return (l.x * l.x) / (rx * rx) + (l.y * l.y) / (ry * ry) <= 1;
  }
  const poly = outline.map((q) => ({ x: q.x * e.w, y: q.y * e.h }));
  if (pointInPolygon(l, poly)) return true;
  for (let i = 0; i < poly.length; i++) if (distToSegment(l, poly[i], poly[(i + 1) % poly.length]) <= tol) return true;
  return false;
}

/** Oberstes Element unter dem Punkt (Elemente stehen von hinten nach vorn). */
export function topElementAt(elements: DrawElement[], p: Vec2, tol?: number): DrawElement | null {
  for (let i = elements.length - 1; i >= 0; i--) if (hitElement(elements[i], p, tol)) return elements[i];
  return null;
}

// ---------- Anfasser ----------

/** 0…7 = Ecken und Seitenmitten (im Uhrzeigersinn ab oben links), 'rotate' = Drehgriff. */
export type HandleId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'rotate';

const HANDLE_POS: Vec2[] = [
  { x: -0.5, y: -0.5 },
  { x: 0, y: -0.5 },
  { x: 0.5, y: -0.5 },
  { x: 0.5, y: 0 },
  { x: 0.5, y: 0.5 },
  { x: 0, y: 0.5 },
  { x: -0.5, y: 0.5 },
  { x: -0.5, y: 0 },
];

/** Abstand des Drehgriffs über der oberen Kante (normiert). */
export const ROTATE_OFFSET = 0.06;

/** Rahmen eines Elements mit kleinem Rand, damit Striche greifbar bleiben. */
function paddedFrame(e: DrawElement): Frame {
  const pad = e.type === 'path' ? e.width / 2 : 0;
  return { ...e, w: e.w + 2 * pad, h: e.h + 2 * pad };
}

export function handlePositions(e: DrawElement): { id: HandleId; p: Vec2 }[] {
  const f = paddedFrame(e);
  const out: { id: HandleId; p: Vec2 }[] = HANDLE_POS.map((q, i) => ({ id: i as HandleId, p: toWorld(f, q) }));
  const top = toWorld(f, { x: 0, y: -0.5 });
  const up = { x: Math.sin(f.rot), y: -Math.cos(f.rot) };
  out.push({ id: 'rotate', p: { x: top.x + up.x * ROTATE_OFFSET, y: top.y + up.y * ROTATE_OFFSET } });
  return out;
}

export function handleAt(e: DrawElement, p: Vec2, radius: number): HandleId | null {
  let best: HandleId | null = null;
  let bestD = radius;
  for (const h of handlePositions(e)) {
    const d = Math.hypot(p.x - h.p.x, p.y - h.p.y);
    if (d <= bestD) {
      best = h.id;
      bestD = d;
    }
  }
  return best;
}

const MIN_SIZE = 0.02;

/**
 * Ziehen an einem Größen-Anfasser: Die gegenüberliegende Kante (bzw. Ecke)
 * bleibt stehen, Breite und Höhe ändern sich getrennt.
 */
export function resizeByHandle<T extends DrawElement>(start: T, handle: Exclude<HandleId, 'rotate'>, p: Vec2): T {
  const q = HANDLE_POS[handle];
  const l = toLocalUnscaled(start, p);
  let left = -start.w / 2;
  let right = start.w / 2;
  let top = -start.h / 2;
  let bottom = start.h / 2;
  // Bei Strichen den Rand mitdenken (Anfasser sitzen am gepolsterten Rahmen).
  const pad = start.type === 'path' ? start.width / 2 : 0;
  if (q.x < 0) left = Math.min(l.x + pad, right - MIN_SIZE);
  if (q.x > 0) right = Math.max(l.x - pad, left + MIN_SIZE);
  if (q.y < 0) top = Math.min(l.y + pad, bottom - MIN_SIZE);
  if (q.y > 0) bottom = Math.max(l.y - pad, top + MIN_SIZE);
  const mid = toWorld({ ...start, w: 1, h: 1 }, { x: (left + right) / 2, y: (top + bottom) / 2 });
  return { ...start, cx: mid.x, cy: mid.y, w: right - left, h: bottom - top };
}

/** Drehwinkel, wenn der Drehgriff zu `p` gezogen wird; `snapDeg` rastet ein. */
export function rotationTowards(e: DrawElement, p: Vec2, snapDeg?: number): number {
  let rot = Math.atan2(p.x - e.cx, -(p.y - e.cy));
  if (snapDeg) {
    const step = (snapDeg * Math.PI) / 180;
    rot = Math.round(rot / step) * step;
  }
  return rot;
}

// ---------- Radierer (nur Striche) ----------

/**
 * Entfernt die Teile aller Striche, die der Radierer berührt; ein Strich
 * kann dabei in mehrere zerfallen. Formen bleiben unverändert.
 */
export function eraseAt(elements: DrawElement[], p: Vec2, radius: number): DrawElement[] {
  let changed = false;
  const out: DrawElement[] = [];
  for (const e of elements) {
    if (e.type !== 'path') {
      out.push(e);
      continue;
    }
    const pts = worldPoints(e);
    const r = radius + e.width / 2;
    const keep = pts.map((q) => Math.hypot(q.x - p.x, q.y - p.y) > r);
    if (keep.every(Boolean)) {
      out.push(e);
      continue;
    }
    changed = true;
    let run: Vec2[] = [];
    let first = true;
    const flush = () => {
      if (run.length) out.push(pathFromWorld(run, e.color, e.width, first ? e.id : newElementId()));
      if (run.length) first = false;
      run = [];
    };
    pts.forEach((q, i) => {
      if (keep[i]) run.push(q);
      else flush();
    });
    flush();
  }
  return changed ? out : elements;
}

// ---------- Ordnen, Kopieren ----------

export function bringForward(elements: DrawElement[], id: string): DrawElement[] {
  const i = elements.findIndex((e) => e.id === id);
  if (i < 0 || i === elements.length - 1) return elements;
  const out = elements.slice();
  [out[i], out[i + 1]] = [out[i + 1], out[i]];
  return out;
}

export function sendBackward(elements: DrawElement[], id: string): DrawElement[] {
  const i = elements.findIndex((e) => e.id === id);
  if (i <= 0) return elements;
  const out = elements.slice();
  [out[i], out[i - 1]] = [out[i - 1], out[i]];
  return out;
}

/** Kopie leicht versetzt, direkt über dem Original. */
export function duplicate(elements: DrawElement[], id: string): { elements: DrawElement[]; copy: DrawElement | null } {
  const i = elements.findIndex((e) => e.id === id);
  if (i < 0) return { elements, copy: null };
  const src = elements[i];
  const copy = { ...src, id: newElementId(), cx: Math.min(0.95, src.cx + 0.04), cy: Math.min(0.95, src.cy + 0.04) } as DrawElement;
  const out = elements.slice();
  out.splice(i + 1, 0, copy);
  return { elements: out, copy };
}

// ---------- Zeichnen ----------

/** Zeichnet alle Elemente. `ctx` muss auf normierte Koordinaten eingestellt sein. */
export function drawElements(ctx: CanvasRenderingContext2D, elements: DrawElement[]): void {
  for (const e of elements) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (e.type === 'path') {
      const pts = worldPoints(e);
      ctx.strokeStyle = e.color;
      ctx.fillStyle = e.color;
      ctx.lineWidth = e.width;
      ctx.beginPath();
      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, e.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
      }
    } else {
      ctx.translate(e.cx, e.cy);
      ctx.rotate(e.rot);
      ctx.beginPath();
      const outline = shapeOutline(e.shape);
      if (!outline) ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
      else outline.forEach((q, i) => (i === 0 ? ctx.moveTo(q.x * e.w, q.y * e.h) : ctx.lineTo(q.x * e.w, q.y * e.h)));
      ctx.closePath();
      ctx.fillStyle = e.fill;
      ctx.fill();
      if (e.outline) {
        ctx.strokeStyle = e.line;
        ctx.lineWidth = OUTLINE_WIDTH;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

/** Zeichnet Rahmen und Anfasser des ausgewählten Elements (`px` = ein Pixel, normiert). */
export function drawSelection(ctx: CanvasRenderingContext2D, e: DrawElement, px: number): void {
  const f = paddedFrame(e);
  const hs = handlePositions(e);
  ctx.save();
  ctx.strokeStyle = '#3a8f85';
  ctx.lineWidth = 2 * px;
  ctx.setLineDash([6 * px, 4 * px]);
  ctx.beginPath();
  HANDLE_POS.filter((_, i) => i % 2 === 0).forEach((q, i) => {
    const w = toWorld(f, q);
    if (i === 0) ctx.moveTo(w.x, w.y);
    else ctx.lineTo(w.x, w.y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  const top = toWorld(f, { x: 0, y: -0.5 });
  const rot = hs.find((h) => h.id === 'rotate')!.p;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(rot.x, rot.y);
  ctx.stroke();
  for (const h of hs) {
    ctx.beginPath();
    ctx.arc(h.p.x, h.p.y, (h.id === 'rotate' ? 9 : 7) * px, 0, Math.PI * 2);
    ctx.fillStyle = h.id === 'rotate' ? '#3a8f85' : '#fff';
    ctx.fill();
    ctx.lineWidth = 2 * px;
    ctx.stroke();
  }
  ctx.restore();
}
