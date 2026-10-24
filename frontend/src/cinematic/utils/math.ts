/**
 * Math, Damping, and Interpolation Utilities
 * Follows exact frame-rate independent exponential damping specifications.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Frame-rate independent exponential damping.
 * v += (target - v) * (1 - exp(-k * dt))
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  const safeDt = clamp(dt, 0.0001, 0.05); // clamp dt to 1/20s max
  return current + (target - current) * (1 - Math.exp(-lambda * safeDt));
}

/**
 * 3D Vector exponential damping in-place.
 */
export function dampVector3(
  current: [number, number, number],
  target: [number, number, number],
  lambda: number,
  dt: number
): [number, number, number] {
  current[0] = damp(current[0], target[0], lambda, dt);
  current[1] = damp(current[1], target[1], lambda, dt);
  current[2] = damp(current[2], target[2], lambda, dt);
  return current;
}

export function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Converts spherical coordinates (radius, lat, lon in degrees) to Cartesian coordinates [x, y, z].
 */
export function latLonToVector3(latDeg: number, lonDeg: number, radius: number): [number, number, number] {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}
