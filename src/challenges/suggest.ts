/**
 * Automatische Vorschläge für eigene Herausforderungen (rein, ohne DOM).
 *
 * Ausgangslage ist die Startlage: Figur gerade und mittig, Spiegel senkrecht
 * rechts daneben. Jeder Vorschlag entsteht aus einer Kombination von vier
 * Bewegungen:
 * - shift:  Achse verschieben, sodass sie die Figur schneidet
 * - rotate: Figur drehen
 * - angle:  Winkel der Achse einstellen
 * - flip:   auf die andere Seite spiegeln (Spiegel umdrehen)
 *
 * „Umdrehen“ ändert nur etwas, wenn die Achse die Figur schneidet; liegt die
 * ganze Figur neben der Achse, ergibt die andere Seite dieselbe Form.
 */
import {
  apply,
  createMirror,
  DEG,
  figureCenter,
  figureTransform,
  lineOf,
  sideOf,
  UNIT_RECT,
  type ComposeMode,
  type Scene,
  type Side,
  type Vec2,
} from '../geometry';
import { evaluateScene, rng } from './generate';

export type Move = 'shift' | 'rotate' | 'angle' | 'flip';

/** Alle sinnvollen Kombinationen, einfache zuerst. */
export const COMBOS: Move[][] = [
  ['shift'],
  ['rotate'],
  ['angle'],
  ['shift', 'flip'],
  ['shift', 'rotate'],
  ['shift', 'angle'],
  ['rotate', 'angle'],
  ['shift', 'rotate', 'flip'],
  ['shift', 'angle', 'flip'],
  ['shift', 'rotate', 'angle'],
  ['shift', 'rotate', 'angle', 'flip'],
];

/** Abstand der Achse zur Figur, wenn die ganze Figur daneben liegt. */
const BESIDE_GAP = 0.025;

export interface Suggestion {
  scene: Scene;
  moves: Move[];
}

/** Kennzeichen der Form, damit keine zwei Vorschläge gleich aussehen. */
function formKey(rotationDeg: number, lineDeg: number, flip: boolean, shift: number | null): string {
  const rel = (((rotationDeg - lineDeg) % 360) + 360) % 360;
  return `${rel}|${flip ? 1 : 0}|${shift === null ? 'b' : Math.round(shift / 0.04)}`;
}

/** Eine Szene zu einer Kombination würfeln (oder null, wenn sie nicht passt). */
function sceneFor(samples: Vec2[], moves: Move[], r: () => number, mode: ComposeMode, used: Set<string>): Scene | null {
  const has = (m: Move) => moves.includes(m);
  const rotationDeg = has('rotate') ? 15 * (1 + Math.floor(r() * 23)) : 0;
  const angles = [15, 30, 45, 60, 75, 105, 120, 135, 150, 165];
  const lineDeg = has('angle') ? angles[Math.floor(r() * angles.length)] : 90;
  const cut = has('shift');
  const flip = has('flip');
  // Normale der Achse; bei 90° zeigt sie nach rechts.
  const n = { x: Math.sin(lineDeg * DEG), y: -Math.cos(lineDeg * DEG) };
  const shift = cut ? (r() - 0.5) * 0.3 : null;
  const key = formKey(rotationDeg, lineDeg, flip, shift);
  if (used.has(key)) return null;

  // Figur bei Bedarf etwas verschieben, damit alles in die Fläche passt.
  const offsets = [{ x: 0, y: 0 }, ...Array.from({ length: 8 }, () => ({ x: (r() - 0.5) * 0.4, y: (r() - 0.5) * 0.4 }))];
  for (const offset of offsets) {
    const figure = { rotation: rotationDeg * DEG, offset };
    const c = figureCenter(figure, UNIT_RECT);
    const proj = (p: Vec2) => (p.x - c.x) * n.x + (p.y - c.y) * n.y;
    let t: number;
    if (shift !== null) t = shift;
    else {
      const place = figureTransform(figure, UNIT_RECT);
      t = Math.max(...samples.map((s) => proj(apply(place, s)))) + BESIDE_GAP;
    }
    const through = { x: c.x + n.x * t, y: c.y + n.y * t };
    let mirror;
    try {
      mirror = createMirror(UNIT_RECT, lineDeg, through, 1);
    } catch {
      continue;
    }
    // Ohne Umdrehen bleibt die Seite „links/hinten“ der Achse die Originalseite.
    const back = { x: through.x - n.x, y: through.y - n.y };
    const baseSide = sideOf(back, lineOf(mirror), 0) as Side;
    const originalSide = (flip ? -baseSide : baseSide) as Side;
    const scene: Scene = { figure, mirror: { ...mirror, originalSide } };
    const ev = evaluateScene(samples, scene, mode);
    if (!ev.fits) continue;
    if (cut ? ev.fraction < 0.3 || ev.fraction > 0.75 : ev.fraction < 0.99) continue;
    used.add(key);
    return scene;
  }
  return null;
}

/**
 * Liefert Vorschläge reihum über die Kombinationen, sodass möglichst viele
 * verschiedene Bewegungen vorkommen. `accept` kann einen Vorschlag noch
 * verwerfen (z. B. unlösbare, die doch wie ein Spiegelbild aussehen).
 */
export function suggestScenes(
  samples: Vec2[],
  count: number,
  seed: number,
  opts: { mode?: ComposeMode; used?: Set<string>; start?: number; accept?: (s: Scene) => boolean } = {},
): Suggestion[] {
  const r = rng(seed);
  const used = opts.used ?? new Set<string>();
  const mode = opts.mode ?? 'mirror';
  const out: Suggestion[] = [];
  // Stichproben ausdünnen, damit die Suche schnell bleibt.
  const step = Math.max(1, Math.floor(samples.length / 600));
  const pts = samples.filter((_s, i) => i % step === 0);
  let failures = 0;
  for (let i = opts.start ?? 0; out.length < count && failures < COMBOS.length * 3; i++) {
    const moves = COMBOS[i % COMBOS.length];
    let found: Scene | null = null;
    for (let attempt = 0; attempt < 40 && !found; attempt++) {
      const s = sceneFor(pts, moves, r, mode, used);
      if (s && (!opts.accept || opts.accept(s))) found = s;
    }
    if (found) {
      out.push({ scene: found, moves });
      failures = 0;
    } else failures++;
  }
  return out;
}
