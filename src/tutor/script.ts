/**
 * Tutor: kurze Befehle für die ersten sechs Zielfiguren der Herausforderung
 * „Haus“. Ein blinkender Finger zeigt, wo das Kind anfassen soll. Der nächste
 * Befehl kommt, sobald das Kind den vorigen ausgeführt hat.
 */
import { figureCenter, lineOf, normal, signedDistance, UNIT_RECT, type Scene, type Vec2 } from '../geometry';

export type Step = 'axis' | 'lower' | 'upper' | 'rotate' | 'move' | 'snap' | 'flip';
/** Abschluss, wenn das Bild zur Zielfigur passt. */
export type FinalStep = 'photo' | 'fits';

export const TUTOR_CHALLENGE = 'haus-1';
export const INTRO = 'Ich helfe dir.';

/** Befehle je Zielfigur (Index 0–5). */
export const HAUS_SCRIPT: Step[][] = [
  ['axis'],
  ['lower'],
  ['rotate', 'axis'],
  ['snap', 'upper', 'move'],
  ['flip', 'axis'],
  ['rotate', 'upper', 'axis'],
];

export const COMMANDS: Record<Step | FinalStep, string> = {
  axis: 'Verschiebe die Spiegelachse.',
  lower: 'Ziehe den unteren Punkt.',
  upper: 'Ziehe den oberen Punkt.',
  rotate: 'Drehe das Haus.',
  move: 'Verschiebe das Haus.',
  snap: 'Schalte das Einrasten ein.',
  flip: 'Drehe den Spiegel um.',
  photo: 'Mach ein Foto.',
  fits: 'Tippe auf Passt.',
};

/** Befehle zu einer Zielfigur der Herausforderung (oder null, wenn der Tutor dort nichts sagt). */
export function scriptFor(challengeId: string, targetIndex: number): Step[] | null {
  return challengeId === TUTOR_CHALLENGE ? (HAUS_SCRIPT[targetIndex] ?? null) : null;
}

const moved = (a: Vec2, b: Vec2, eps = 0.01) => Math.hypot(a.x - b.x, a.y - b.y) > eps;

/** Unterer bzw. oberer Anfasspunkt des Spiegels. */
export function handlePoint(scene: Scene, which: 'lower' | 'upper'): Vec2 {
  const { a, b } = scene.mirror;
  const lowerIsA = a.y > b.y;
  return which === 'lower' ? (lowerIsA ? a : b) : lowerIsA ? b : a;
}

/** Hat das Kind den Befehl ausgeführt (verglichen mit der Lage beim Erteilen)? */
export function stepDone(step: Step, start: Scene, now: Scene, snapOn: boolean): boolean {
  const ms = start.mirror;
  const mn = now.mirror;
  const mid = (m: Scene['mirror']) => ({ x: (m.a.x + m.b.x) / 2, y: (m.a.y + m.b.y) / 2 });
  switch (step) {
    case 'axis':
      return moved(mid(ms), mid(mn));
    case 'lower':
    case 'upper':
      return moved(handlePoint(start, step), handlePoint(now, step)) || moved(ms.a, mn.a) || moved(ms.b, mn.b);
    case 'rotate':
      return Math.abs(start.figure.rotation - now.figure.rotation) > 0.01;
    case 'move':
      return moved(start.figure.offset, now.figure.offset);
    case 'snap':
      return snapOn;
    case 'flip':
      return ms.originalSide !== mn.originalSide;
  }
}

/** Wohin der Finger auf der Arbeitsfläche zeigt (normierte Koordinaten), sonst null (Knopf). */
export function pointerFor(step: Step, scene: Scene): { p: Vec2; kind: 'tap' | 'rotate' } | null {
  switch (step) {
    case 'axis': {
      const { a, b } = scene.mirror;
      return { p: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, kind: 'tap' };
    }
    case 'lower':
    case 'upper':
      return { p: handlePoint(scene, step), kind: 'tap' };
    case 'rotate':
      return { p: figureCenter(scene.figure, UNIT_RECT), kind: 'rotate' };
    case 'move':
      return { p: figureCenter(scene.figure, UNIT_RECT), kind: 'tap' };
    default:
      return null;
  }
}

/**
 * Erzeugen zwei Szenen dasselbe Bild (bis auf Verschiebung)? Verglichen
 * werden Drehung der Figur, Richtung der Achse samt Originalseite und der
 * Abstand der Figur zur Achse – mit Toleranz für Kinderhände.
 */
export function sceneClose(a: Scene, b: Scene, tolDeg = 4, tolDist = 0.025): boolean {
  const shape = (s: Scene) => {
    const line = lineOf(s.mirror);
    const n = normal(line);
    const side = s.mirror.originalSide;
    return {
      rot: s.figure.rotation,
      dir: Math.atan2(n.y * side, n.x * side),
      dist: signedDistance(figureCenter(s.figure, UNIT_RECT), line) * side,
    };
  };
  const angle = (x: number, y: number) => {
    const d = Math.abs((((x - y) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    return (d * 180) / Math.PI;
  };
  const p = shape(a);
  const q = shape(b);
  return angle(p.rot, q.rot) <= tolDeg && angle(p.dir, q.dir) <= tolDeg && Math.abs(p.dist - q.dist) <= tolDist;
}
