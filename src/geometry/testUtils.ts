import { expect } from 'vitest';
import type { Vec2 } from './vec';

export function expectVec(actual: Vec2, expected: Vec2, digits = 9): void {
  expect(actual.x).toBeCloseTo(expected.x, digits);
  expect(actual.y).toBeCloseTo(expected.y, digits);
}

export function onBoundary(p: Vec2, eps = 1e-9): boolean {
  const inside = p.x >= -eps && p.x <= 1 + eps && p.y >= -eps && p.y <= 1 + eps;
  const onEdge =
    Math.abs(p.x) <= eps || Math.abs(p.x - 1) <= eps || Math.abs(p.y) <= eps || Math.abs(p.y - 1) <= eps;
  return inside && onEdge;
}
