/**
 * Geometry of a transit: a dark disc of radius k (in stellar radii) crossing a
 * uniform stellar disc of radius 1. The fraction of light blocked at full
 * overlap is k² — the "depth ≈ (Rp/R★)²" relation.
 */

/** Star radius in scene units. The planet is drawn at the true Rp/R★ ratio. */
export const STAR_R = 1.6;
/** Orbit radius in stellar radii (illustrative, shared by the 3D scene and the light curve). */
export const ORBIT_A = 3.4;
const CAM_H = 1.25;
const CAM_D = 12;
/** Orbit plane lift so the front of the orbit crosses the star's centre on the line of sight (central transit). */
export const ORBIT_Y = (CAM_H * ORBIT_A * STAR_R) / CAM_D;
export const TRANSIT_CAMERA = { position: [0, CAM_H, CAM_D] as [number, number, number], fov: 38 };

/** Overlap area of a unit circle and a circle of radius k whose centres are d apart. */
export function overlapArea(d: number, k: number): number {
  if (k <= 0) return 0;
  if (d >= 1 + k) return 0;
  if (d <= Math.abs(1 - k)) return Math.PI * Math.min(1, k) ** 2;
  const k2 = k * k;
  const d2 = d * d;
  const a1 = k2 * Math.acos(Math.min(1, Math.max(-1, (d2 + k2 - 1) / (2 * d * k))));
  const a2 = Math.acos(Math.min(1, Math.max(-1, (d2 + 1 - k2) / (2 * d))));
  const a3 = 0.5 * Math.sqrt(Math.max(0, (-d + k + 1) * (d + k - 1) * (d - k + 1) * (d + k + 1)));
  return a1 + a2 - a3;
}

/** Wrap a phase into [-0.5, 0.5). */
export const wrapPhase = (p: number) => ((((p + 0.5) % 1) + 1) % 1) - 0.5;

/**
 * Relative flux (1 = unobstructed) at orbital phase p for a circular, central
 * (impact parameter 0) orbit of radius a stellar radii.
 */
export function fluxAt(p: number, k: number, a: number): number {
  const th = wrapPhase(p) * Math.PI * 2;
  if (Math.cos(th) <= 0) return 1; // planet behind the star (secondary eclipse ignored)
  const d = Math.abs(a * Math.sin(th));
  return 1 - overlapArea(d, k) / Math.PI;
}

/** Half-width of the transit in phase units (first to last contact). */
export function transitHalfWidth(k: number, a: number): number {
  const s = Math.min(1, (1 + k) / a);
  return Math.asin(s) / (Math.PI * 2);
}

/** Stepped y-axis ranges for the light curve so the dip visibly grows with the planet. */
export const DEPTH_AXIS_STEPS = [0.0002, 0.001, 0.005, 0.02, 0.1, 0.5, 1];
export const axisFor = (depth: number) => DEPTH_AXIS_STEPS.find((s) => s >= depth * 1.25) ?? 1;

export const formatAxis = (v: number) => {
  const pct = v * 100;
  return pct >= 1 ? `${pct.toFixed(0)}%` : pct >= 0.1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(2)}%`;
};
