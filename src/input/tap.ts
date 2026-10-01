export interface PointerSample {
  x: number;
  y: number;
  /** Zeitstempel in ms. */
  t: number;
}

/** Maximale Bewegung (CSS-Pixel), die noch als Tippen gilt. */
export const TAP_MAX_MOVE_PX = 12;
/** Maximale Dauer (ms), die noch als Tippen gilt. */
export const TAP_MAX_DURATION_MS = 500;

/** Bewegung seit dem Aufsetzen (CSS-Pixel). */
export function movedDistance(down: PointerSample, now: { x: number; y: number }): number {
  return Math.hypot(now.x - down.x, now.y - down.y);
}

/**
 * Kurzes Tippen ohne Ziehen. `maxMoveSoFar` ist die größte Entfernung vom
 * Aufsetzpunkt während der Berührung (hin und zurück zählt als Ziehen).
 */
export function isTap(down: PointerSample, up: PointerSample, maxMoveSoFar = 0): boolean {
  const moved = Math.max(maxMoveSoFar, movedDistance(down, up));
  return moved <= TAP_MAX_MOVE_PX && up.t - down.t <= TAP_MAX_DURATION_MS;
}
