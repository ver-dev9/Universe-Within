import * as THREE from 'three';
import { PLANETS_DATA, SUN_DATA, EARTH_DIAMETER_KM, AU_MILLION_KM, PlanetData } from '../data/planetsData';

/**
 * Mutable, non-React state shared between GSAP timelines (writers) and
 * `useFrame` loops (readers). Nothing here triggers a React render.
 */

/** Where the Chapter 01 hero Earth lives in world space (away from the solar system). */
export const INTRO_ORIGIN = new THREE.Vector3(0, 40, 420);
/** Radius of the hero Earth in scene units. */
export const INTRO_EARTH_RADIUS = 5;

/**
 * Chapter 01 rig, scrubbed by the intro ScrollTrigger timeline.
 * Camera and look-at are offsets from INTRO_ORIGIN. The camera sits on the
 * Sun-ward side of Earth looking outward, so the solar system is behind it.
 */
export const INTRO_START = {
  camX: 0, camY: 0, camZ: -190,
  // Looking slightly above the point places it below the title.
  lookX: 0, lookY: 30, lookZ: 0,
  pointGlow: 1,
  starReveal: 0.04,
  earthReveal: 0,
};
export const introRig = { ...INTRO_START };

/** Static composition used when the visitor prefers reduced motion. */
export const INTRO_STATIC = {
  camX: -8, camY: 2, camZ: -21,
  lookX: 7.5, lookY: 7.5, lookZ: 0,
  pointGlow: 0,
  starReveal: 1,
  earthReveal: 1,
};

/** Chapter 02 runtime state. */
export const solarState = {
  /** 0 = cinematic layout, 1 = relative-size layout (animated in useFrame). */
  scaleBlend: 0,
  /** Multiplier on orbital motion; eases toward 0 while a planet is focused. */
  orbitTimeScale: 1,
};

/** Live planet groups (world position is read for camera fly-to). */
export const planetRegistry = new Map<string, THREE.Object3D>();

// ---------------------------------------------------------------------------
// Scale models
// ---------------------------------------------------------------------------

/** Cinematic sun radius (v1 value). */
export const CINEMATIC_SUN_RADIUS = 5.5;

/** Earth radius in scene units in relative-size mode; every body scales from it. */
const REL_EARTH_RADIUS = 0.45;
export const RELATIVE_SUN_RADIUS = (SUN_DATA.actualDiameterKm / EARTH_DIAMETER_KM) * REL_EARTH_RADIUS;

/** True-ratio radius: diameter / Earth diameter × REL_EARTH_RADIUS. */
export const relativeRadius = (p: PlanetData) => (p.actualDiameterKm / EARTH_DIAMETER_KM) * REL_EARTH_RADIUS;

/**
 * Distances in relative-size mode are compressed logarithmically from the true
 * semimajor axis (in AU) so the order and spacing trend survive while every
 * world still fits on screen. They are NOT to scale.
 */
export const relativeOrbit = (p: PlanetData) => {
  const au = p.distanceFromSunMillionKm / AU_MILLION_KM;
  return RELATIVE_SUN_RADIUS + 10 + 31 * Math.log2(1 + au);
};

export const cinematicRadius = (p: PlanetData) => p.relativeSize;
export const cinematicOrbit = (p: PlanetData) => p.orbitRadius;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const blendedRadius = (p: PlanetData) => lerp(cinematicRadius(p), relativeRadius(p), solarState.scaleBlend);
export const blendedOrbit = (p: PlanetData) => lerp(cinematicOrbit(p), relativeOrbit(p), solarState.scaleBlend);
export const blendedSunRadius = () => lerp(CINEMATIC_SUN_RADIUS, RELATIVE_SUN_RADIUS, solarState.scaleBlend);

export const planetById = (id: string | null) => PLANETS_DATA.find((p) => p.id === id) ?? null;
