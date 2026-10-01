import { describe, expect, it } from 'vitest';
import { angleAround, snapAngleDeg, twoFingerRotation, wrapAngle } from './angle';

describe('Winkel', () => {
  it('rastet auf 15° ein', () => {
    expect(snapAngleDeg(7)).toBe(0);
    expect(snapAngleDeg(8)).toBe(15);
    expect(snapAngleDeg(44)).toBe(45);
    expect(snapAngleDeg(-97)).toBe(-90);
    expect(snapAngleDeg(-3)).toBe(0);
    expect(Object.is(snapAngleDeg(-3), -0)).toBe(false);
    expect(snapAngleDeg(31, 30)).toBe(30);
  });

  it('wrapAngle', () => {
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(wrapAngle(-3 * Math.PI / 2)).toBeCloseTo(Math.PI / 2);
    expect(wrapAngle(0.3)).toBeCloseTo(0.3);
  });

  it('angleAround', () => {
    expect(angleAround({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  });

  it('Zwei-Finger-Drehung, auch über ±180° hinweg', () => {
    const r = twoFingerRotation({ x: 0, y: 0 }, { x: -1, y: 0.01 }, { x: 0, y: 0 }, { x: -1, y: -0.01 });
    expect(r).toBeCloseTo(0.02, 3);
  });
});
