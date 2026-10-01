import { describe, expect, it } from 'vitest';
import {
  IDENTITY,
  apply,
  compose,
  pointReflection,
  reflectPoint,
  reflectionAcross,
  rotationAbout,
  translationAcrossLine,
} from './affine';
import { signedDistance } from './line';
import { expectVec } from './testUtils';

const vertical = { p: { x: 0.5, y: 0 }, q: { x: 0.5, y: 1 } };
const diagonal = { p: { x: 0, y: 0 }, q: { x: 1, y: 1 } };

describe('Achsenspiegelung', () => {
  it('an senkrechter Gerade', () => {
    expectVec(reflectPoint({ x: 0.2, y: 0.7 }, vertical), { x: 0.8, y: 0.7 });
  });

  it('an der Diagonalen vertauscht x und y', () => {
    expectVec(reflectPoint({ x: 0.2, y: 0.7 }, diagonal), { x: 0.7, y: 0.2 });
  });

  it('an waagerechter Gerade', () => {
    const l = { p: { x: 0, y: 0.25 }, q: { x: 1, y: 0.25 } };
    expectVec(reflectPoint({ x: 0.3, y: 0.1 }, l), { x: 0.3, y: 0.4 });
  });

  it('Punkte auf der Geraden bleiben fest', () => {
    const l = { p: { x: 0.1, y: 0.3 }, q: { x: 0.8, y: 0.55 } };
    expectVec(reflectPoint(l.p, l), l.p);
    expectVec(reflectPoint(l.q, l), l.q);
  });

  it('zweimal spiegeln ergibt die Identität', () => {
    const l = { p: { x: 0.13, y: 0.7 }, q: { x: 0.9, y: 0.05 } };
    const m = reflectionAcross(l);
    const mm = compose(m, m);
    mm.forEach((v, i) => expect(v).toBeCloseTo(IDENTITY[i]));
  });

  it('Abstand bleibt gleich, Seite wechselt', () => {
    const l = { p: { x: 0.13, y: 0.7 }, q: { x: 0.9, y: 0.05 } };
    const pt = { x: 0.4, y: 0.9 };
    expect(signedDistance(reflectPoint(pt, l), l)).toBeCloseTo(-signedDistance(pt, l));
  });

  it('Richtung der Geraden ist egal', () => {
    const l = { p: { x: 0.13, y: 0.7 }, q: { x: 0.9, y: 0.05 } };
    const r = { p: l.q, q: l.p };
    expectVec(reflectPoint({ x: 0.3, y: 0.3 }, l), reflectPoint({ x: 0.3, y: 0.3 }, r));
  });
});

describe('weitere Abbildungen', () => {
  it('Drehung um einen Punkt', () => {
    const m = rotationAbout({ x: 0.5, y: 0.5 }, Math.PI / 2);
    expectVec(apply(m, { x: 1, y: 0.5 }), { x: 0.5, y: 1 });
    expectVec(apply(m, { x: 0.5, y: 0.5 }), { x: 0.5, y: 0.5 });
  });

  it('Punktspiegelung', () => {
    expectVec(apply(pointReflection({ x: 0.5, y: 0.5 }), { x: 0.2, y: 0.1 }), { x: 0.8, y: 0.9 });
  });

  it('compose wendet erst das zweite Argument an', () => {
    const rot = rotationAbout({ x: 0, y: 0 }, Math.PI / 2);
    const mirror = reflectionAcross(vertical);
    // erst spiegeln, dann drehen
    expectVec(apply(compose(rot, mirror), { x: 0.2, y: 0 }), apply(rot, apply(mirror, { x: 0.2, y: 0 })));
  });

  it('Verschiebung über die Gerade auf die Spiegelseite', () => {
    // Originalseite 1 = links der senkrechten Geraden; Verschiebung nach rechts
    const m = translationAcrossLine(vertical, 1, 0.5);
    expectVec(apply(m, { x: 0.2, y: 0.3 }), { x: 0.7, y: 0.3 });
    const m2 = translationAcrossLine(vertical, -1, 0.5, 0.1);
    expectVec(apply(m2, { x: 0.7, y: 0.3 }), { x: 0.2, y: 0.4 });
  });
});
