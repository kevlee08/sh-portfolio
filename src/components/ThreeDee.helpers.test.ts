import { describe, it, expect } from 'vitest';
import { sphericalToCartesianUnit, cartesianToSphericalUnit, translateOnSphere } from './ThreeDee.helpers';

describe('translateOnSphere', () => {
  it('moves north from equator (bearing 0) by angular distance', () => {
    const r = 1;
    const delta = 0.1;
    const startTheta = Math.PI / 2;
    const startPhi = 0;
    const res = translateOnSphere(r, startTheta, startPhi, 0, delta, true);
    expect(res.theta).toBeCloseTo(startTheta - delta, 6);
    expect(res.phi).toBeCloseTo(startPhi, 6);
  });

  it('moves east from equator (bearing PI/2) by angular distance', () => {
    const r = 1;
    const delta = 0.2;
    const startTheta = Math.PI / 2;
    const startPhi = 0.5;
    const res = translateOnSphere(r, startTheta, startPhi, Math.PI / 2, delta, true);
    expect(res.theta).toBeCloseTo(startTheta, 6);
    // phi wraps into [0,2PI)
    const expectedPhi = (startPhi + delta) % (2 * Math.PI);
    expect(res.phi).toBeCloseTo(expectedPhi, 6);
  });
});

describe('spherical/cartesian conversions', () => {
  function normAngleDiff(a: number, b: number) {
    const diff = ((a - b + Math.PI) % (2 * Math.PI)) - Math.PI;
    return Math.abs(diff);
  }

  it('sphericalToCartesianUnit respects radius and axes', () => {
    const theta = Math.PI / 2; // equator
    const phi = 0;
    const r = 2;
    const v = sphericalToCartesianUnit(theta, phi, r);
    expect(v.x).toBeCloseTo(2, 6);
    expect(v.y).toBeCloseTo(0, 6);
    expect(v.z).toBeCloseTo(0, 6);
  });

  it('cartesianToSphericalUnit roundtrips sphericalToCartesianUnit', () => {
    const theta = 0.7;
    const phi = 2.2;
    const r = 3.5;

    const v = sphericalToCartesianUnit(theta, phi, r);
    const sph = cartesianToSphericalUnit(v);

    expect(sph.theta).toBeCloseTo(theta, 6);
    // phi may be returned in -PI..PI; compare modulo 2PI
    expect(normAngleDiff(sph.phi, phi)).toBeLessThan(1e-6);
  });
});
