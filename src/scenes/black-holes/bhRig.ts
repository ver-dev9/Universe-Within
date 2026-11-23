/**
 * Mutable camera rig for Chapter 08. GSAP (scroll) writes the base pose; the
 * drag handler writes `dragAz` / `dragIncl`. The scene reads both in useFrame,
 * so neither scrolling nor dragging re-renders React.
 *
 * Angles in radians. `incl` is measured from the disk's rotation axis
 * (0 = looking straight down on the disk, π/2 = exactly edge-on).
 */
export interface BlackHoleRig {
  az: number;
  incl: number;
  /** Camera distance in Schwarzschild radii. */
  dist: number;
  /** Horizontal field of view scale (tan of half the vertical FOV). */
  tanHalfFov: number;
  /** User drag offsets, eased toward their targets. */
  dragAz: number;
  dragIncl: number;
  dragAzTarget: number;
  dragInclTarget: number;
  /** 0..1 fade-in of the whole frame. */
  fade: number;
}

export const BH_RIG_START: Pick<BlackHoleRig, 'az' | 'incl' | 'dist' | 'tanHalfFov' | 'fade'> = {
  az: -0.35,
  incl: 1.48,
  dist: 26,
  tanHalfFov: 0.42,
  fade: 0,
};

/** Pose used under reduced motion (classic slightly-above-the-disk view). */
export const BH_RIG_STATIC: Pick<BlackHoleRig, 'az' | 'incl' | 'dist' | 'tanHalfFov' | 'fade'> = {
  az: -0.35,
  incl: 1.42,
  dist: 21,
  tanHalfFov: 0.42,
  fade: 1,
};

export const bhRig: BlackHoleRig = {
  ...BH_RIG_START,
  dragAz: 0,
  dragIncl: 0,
  dragAzTarget: 0,
  dragInclTarget: 0,
};

export function resetBlackHoleRig(pose: typeof BH_RIG_START) {
  Object.assign(bhRig, pose, { dragAz: 0, dragIncl: 0, dragAzTarget: 0, dragInclTarget: 0 });
}
