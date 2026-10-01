import type { Vec2 } from './vec';

export interface Rect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Die normierte Arbeitsfläche: Einheitsquadrat. */
export const UNIT_RECT: Rect = { minX: 0, minY: 0, maxX: 1, maxY: 1 };

export function clampToRect(p: Vec2, r: Rect): Vec2 {
  return {
    x: Math.min(r.maxX, Math.max(r.minX, p.x)),
    y: Math.min(r.maxY, Math.max(r.minY, p.y)),
  };
}

export function rectCorners(r: Rect): Vec2[] {
  return [
    { x: r.minX, y: r.minY },
    { x: r.maxX, y: r.minY },
    { x: r.maxX, y: r.maxY },
    { x: r.minX, y: r.maxY },
  ];
}

export function rectCenter(r: Rect): Vec2 {
  return { x: (r.minX + r.maxX) / 2, y: (r.minY + r.maxY) / 2 };
}
