import * as THREE from 'three';
import {
  AU_M,
  C_M_S,
  G_SI,
  SOLAR_MASS_KG,
  SPECTRAL_CLASSES,
  SUN_TEFF_K,
  WIEN_B,
  type OrbitalElements,
} from '../../data/labData';

const DEG = Math.PI / 180;

/* ───────────── Kepler ───────────── */

/** Solve M = E − e·sin E for E (radians) with Newton iterations. */
export function solveKepler(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    const dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/** Julian date for a JS Date (UTC). */
export const toJulian = (date: Date) => date.getTime() / 86_400_000 + 2_440_587.5;
export const fromJulian = (jd: number) => new Date((jd - 2_440_587.5) * 86_400_000);
export const J2000 = 2_451_545.0;

/**
 * Heliocentric ecliptic position (au) at Julian date `jd`, following the JPL
 * "Approximate Positions of the Planets" recipe with the J2000 elements and a
 * constant mean motion of 360° per sidereal period.
 * Returns [x, y, z] in the J2000 ecliptic frame.
 */
export function keplerPosition(el: OrbitalElements, periodDays: number, jd: number, out: THREE.Vector3): THREE.Vector3 {
  const n = 360 / periodDays; // deg/day
  const L = el.L + n * (jd - J2000);
  const omega = (el.varpi - el.Omega) * DEG;
  let M = ((L - el.varpi) % 360) * DEG;
  if (M > Math.PI) M -= 2 * Math.PI;
  if (M < -Math.PI) M += 2 * Math.PI;
  const E = solveKepler(M, el.e);
  return orbitalToEcliptic(el, el.a * (Math.cos(E) - el.e), el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E), omega, out);
}

/** Point on the orbit at eccentric anomaly E (for drawing the ellipse). */
export function orbitPointAtE(el: OrbitalElements, E: number, out: THREE.Vector3): THREE.Vector3 {
  const omega = (el.varpi - el.Omega) * DEG;
  return orbitalToEcliptic(el, el.a * (Math.cos(E) - el.e), el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E), omega, out);
}

function orbitalToEcliptic(el: OrbitalElements, xp: number, yp: number, omega: number, out: THREE.Vector3) {
  const O = el.Omega * DEG;
  const I = el.I * DEG;
  const cw = Math.cos(omega), sw = Math.sin(omega), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  const x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp;
  const y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp;
  const z = sw * sI * xp + cw * sI * yp;
  // three.js: Y up. Ecliptic x → x, ecliptic y → −z, ecliptic z (north) → y.
  return out.set(x, z, -y);
}

/* ───────────── Stars ───────────── */

/** L/L☉ = (R/R☉)² (T/T☉)⁴ — Stefan–Boltzmann law in solar units. */
export const luminositySolar = (radiusSolar: number, temperatureK: number) =>
  radiusSolar * radiusSolar * Math.pow(temperatureK / SUN_TEFF_K, 4);

/** Wien peak wavelength in nanometres. */
export const wienPeakNm = (temperatureK: number) => (WIEN_B / temperatureK) * 1e9;

export function spectralClassFor(temperatureK: number) {
  return SPECTRAL_CLASSES.find((c) => temperatureK >= c.minK && temperatureK < c.maxK) ?? SPECTRAL_CLASSES[SPECTRAL_CLASSES.length - 1];
}

// CIE 1931 2° colour-matching functions, multi-lobe Gaussian fit (Wyman, Sloan & Shirley 2013, JCGT 2(2)).
const g = (x: number, mu: number, s1: number, s2: number) => {
  const t = (x - mu) / (x < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};
const cieX = (l: number) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
const cieY = (l: number) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
const cieZ = (l: number) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);

/** Planck spectral radiance (arbitrary scale) at wavelength λ in nm. */
const planck = (lambdaNm: number, T: number) => {
  const l = lambdaNm * 1e-9;
  return 1 / (Math.pow(l, 5) * (Math.exp(0.014387769 / (l * T)) - 1));
};

/**
 * Approximate perceived colour of a blackbody at temperature T: integrate
 * Planck × CIE CMFs over 380–780 nm, convert XYZ → linear sRGB and normalise
 * the brightest channel to 1. Linear RGB (three.js working space).
 */
export function blackbodyColor(T: number, out = new THREE.Color()): THREE.Color {
  let X = 0, Y = 0, Z = 0;
  for (let l = 380; l <= 780; l += 5) {
    const p = planck(l, T);
    X += p * cieX(l);
    Y += p * cieY(l);
    Z += p * cieZ(l);
  }
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  // Out-of-gamut: desaturate towards white instead of clipping hue.
  const m = Math.min(r, gg, b);
  if (m < 0) { r -= m; gg -= m; b -= m; }
  const max = Math.max(r, gg, b) || 1;
  return out.setRGB(r / max, gg / max, b / max);
}

/* ───────────── Black holes ───────────── */

/** Schwarzschild radius in metres: Rs = 2GM/c². */
export const schwarzschildRadiusM = (massSolar: number) => (2 * G_SI * massSolar * SOLAR_MASS_KG) / (C_M_S * C_M_S);

export const metersToAu = (m: number) => m / AU_M;
