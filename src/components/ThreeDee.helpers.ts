
export function sphericalToCartesianUnit(theta: number, phi: number, r = 1) {
  const sinT = Math.sin(theta);
  return { x: r * sinT * Math.cos(phi), y: r * sinT * Math.sin(phi), z: r * Math.cos(theta) };
}

export function cartesianToSphericalUnit(v: { x: number; y: number; z: number }) {
  const r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  const theta = Math.acos(v.z / r);
  const phi = Math.atan2(v.y, v.x);
  return { theta, phi };
}

type SphericalCoordinates = { r: number; theta: number; phi: number; bearing?: number };

function normalize(v: { x: number; y: number; z: number }) {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Move a point on a sphere along a great-circle.
 *
 * - `theta` is polar angle (0..PI), `phi` is azimuth (radians).
 * - `bearing` is heading angle in radians measured from local north towards local east (0 = north).
 * - `distance` may be a linear distance along the surface; set `distanceIsAngular=true` if it's already in radians.
 */
export function translateOnSphere(r: number, theta: number, phi: number, bearing: number, distance: number, distanceIsAngular = false): SphericalCoordinates {
  const delta = distanceIsAngular ? distance : (distance / r); // angular distance in radians

  // unit vector for start point
  const v0 = sphericalToCartesianUnit(theta, phi);

  // local tangent basis: east (e) and north (n)
  const up = { x: 0, y: 0, z: 1 };
  let e = normalize(cross(up, v0));
  // handle poles where cross is near zero
  if (Math.abs(e.x) < 1e-9 && Math.abs(e.y) < 1e-9 && Math.abs(e.z) < 1e-9) {
    e = { x: 1, y: 0, z: 0 };
  }
  const n = normalize(cross(v0, e));

  // tangent direction for the given bearing: 0 => north, +pi/2 => east
  const tUn = { x: Math.cos(bearing) * n.x + Math.sin(bearing) * e.x, y: Math.cos(bearing) * n.y + Math.sin(bearing) * e.y, z: Math.cos(bearing) * n.z + Math.sin(bearing) * e.z };
  const t = normalize(tUn);

  // Move along great circle: new = v0*cos(delta) + t*sin(delta)
  const newUnit = {
    x: v0.x * Math.cos(delta) + t.x * Math.sin(delta),
    y: v0.y * Math.cos(delta) + t.y * Math.sin(delta),
    z: v0.z * Math.cos(delta) + t.z * Math.sin(delta),
  };

  // compute spherical coordinates at new point
  const sph = cartesianToSphericalUnit(newUnit);
  const newPhi = sph.phi < 0 ? sph.phi + Math.PI * 2 : sph.phi;

  // derivative along great circle (direction of increasing delta): d/d(delta) of (v0*cos + t*sin)
  const d = {
    x: -v0.x * Math.sin(delta) + t.x * Math.cos(delta),
    y: -v0.y * Math.sin(delta) + t.y * Math.cos(delta),
    z: -v0.z * Math.sin(delta) + t.z * Math.cos(delta),
  };

  // local east and north at the new point
  let ePrime = normalize(cross(up, newUnit));
  if (Math.abs(ePrime.x) < 1e-9 && Math.abs(ePrime.y) < 1e-9 && Math.abs(ePrime.z) < 1e-9) {
    ePrime = { x: 1, y: 0, z: 0 };
  }
  const nPrime = normalize(cross(newUnit, ePrime));

  // components of derivative in local north/east basis
  const compN = d.x * nPrime.x + d.y * nPrime.y + d.z * nPrime.z;
  const compE = d.x * ePrime.x + d.y * ePrime.y + d.z * ePrime.z;

  let newBearing = Math.atan2(compE, compN);
  if (newBearing < 0) newBearing += Math.PI * 2;

  return { r, theta: sph.theta, phi: newPhi, bearing: newBearing };
}
