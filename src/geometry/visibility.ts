/**
 * Wie viel der Ausgangsfigur ist auf der Originalseite noch zu sehen?
 * Grundlage für den blassen Umriss, wenn die Figur sonst fast ganz verschwände.
 */
import { apply } from './affine';
import { figureTransform, type FigureState } from './figure';
import { sideOf } from './line';
import { lineOf, type MirrorState } from './mirror';
import type { Rect } from './rect';
import type { Vec2 } from './vec';

/**
 * Anteil (0…1) der Stichproben, die nach Verschieben/Drehen auf der
 * Originalseite und innerhalb der Arbeitsfläche liegen. `samples` sind Punkte
 * der Figur in Koordinaten der ungedrehten, mittigen Figur.
 */
export function visibleFraction(samples: Vec2[], figure: FigureState, mirror: MirrorState, rect: Rect): number {
  if (samples.length === 0) return 1;
  const m = figureTransform(figure, rect);
  const line = lineOf(mirror);
  let visible = 0;
  for (const s of samples) {
    const p = apply(m, s);
    const inside = p.x >= rect.minX && p.x <= rect.maxX && p.y >= rect.minY && p.y <= rect.maxY;
    if (inside && sideOf(p, line, 0) === mirror.originalSide) visible++;
  }
  return visible / samples.length;
}

/** Ab diesem sichtbaren Anteil (und darunter) ist der Umriss voll zu sehen. */
export const GHOST_FULL_BELOW = 0.12;
/** Ab diesem sichtbaren Anteil ist der Umriss ganz ausgeblendet. */
export const GHOST_HIDDEN_ABOVE = 0.22;

/** Deckkraft (0…1) des Umrisses, weich ein- und ausgeblendet. */
export function ghostOpacity(fraction: number): number {
  if (fraction <= GHOST_FULL_BELOW) return 1;
  if (fraction >= GHOST_HIDDEN_ABOVE) return 0;
  return (GHOST_HIDDEN_ABOVE - fraction) / (GHOST_HIDDEN_ABOVE - GHOST_FULL_BELOW);
}
