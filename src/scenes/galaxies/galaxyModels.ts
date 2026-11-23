import * as THREE from 'three';
import { mulberry32 } from '../sun/random';
import type { GalaxyKind } from '../../data/galaxiesData';

/**
 * Procedural point models for Chapter 09. Units: the Milky Way disk radius is
 * 10 scene units (≈ 50,000 ly), so the Sun sits at ≈ 5.2 units from the centre
 * (≈ 26,000 ly). Other galaxies are drawn at a comfortable viewing size, not to
 * a shared scale. Shapes follow published descriptions; they are not survey data.
 */

export const MW_RADIUS = 10;
/** ≈ 26,000 ly / ≈ 50,000 ly disk radius. */
export const SUN_RADIUS = MW_RADIUS * (26000 / 50000);
export const SUN_ANGLE = 2.35;

export interface GalaxyModel {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  /** Per-point angular speed factor (differential rotation; 0 = static). */
  spin: Float32Array;
  count: number;
  /** Euler tilt applied to the whole model (radians). */
  tilt: [number, number, number];
}

// Palette (linear-ish multipliers applied to point colours)
const C = {
  core: new THREE.Color('#ffd9a0'),
  gold: new THREE.Color('#E7B86B'),
  oldRed: new THREE.Color('#ffb27a'),
  white: new THREE.Color('#EEF2FA'),
  young: new THREE.Color('#9cc4ff'),
  blue: new THREE.Color('#3478D4'),
  cyan: new THREE.Color('#69D9EF'),
  hii: new THREE.Color('#ff6fa8'),
  violet: new THREE.Color('#8A5BCA'),
};

type Rand = () => number;

function gauss(rand: Rand) {
  // Box–Muller
  const u = Math.max(1e-6, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

class Builder {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  spin: Float32Array;
  i = 0;
  private tmp = new THREE.Color();
  constructor(public capacity: number) {
    this.positions = new Float32Array(capacity * 3);
    this.colors = new Float32Array(capacity * 3);
    this.sizes = new Float32Array(capacity);
    this.spin = new Float32Array(capacity);
  }
  push(x: number, y: number, z: number, col: THREE.Color, brightness: number, size: number, spin = 1) {
    if (this.i >= this.capacity) return;
    const k = this.i;
    this.positions[k * 3] = x;
    this.positions[k * 3 + 1] = y;
    this.positions[k * 3 + 2] = z;
    this.tmp.copy(col).multiplyScalar(brightness);
    this.colors[k * 3] = this.tmp.r;
    this.colors[k * 3 + 1] = this.tmp.g;
    this.colors[k * 3 + 2] = this.tmp.b;
    this.sizes[k] = size;
    this.spin[k] = spin;
    this.i++;
  }
  mix(a: THREE.Color, b: THREE.Color, t: number) {
    return this.tmp.copy(a).lerp(b, THREE.MathUtils.clamp(t, 0, 1)).clone();
  }
  done(tilt: [number, number, number]): GalaxyModel {
    return { positions: this.positions, colors: this.colors, sizes: this.sizes, spin: this.spin, count: this.i, tilt };
  }
}

/** Logarithmic-spiral disk with optional bar. */
function spiralDisk(
  b: Builder,
  rand: Rand,
  n: number,
  opts: {
    radius: number;
    arms: { offset: number; weight: number }[];
    pitch: number; // tan of pitch angle
    armWidth: number;
    barLength: number;
    bulge: number;
    thickness: number;
    hiiRate: number;
  },
) {
  const { radius, arms, pitch, armWidth, barLength, bulge, thickness, hiiRate } = opts;
  const totalW = arms.reduce((s, a) => s + a.weight, 0);
  const nBulge = Math.floor(n * bulge);
  const nBar = barLength > 0 ? Math.floor(n * 0.1) : 0;
  const nDiskHaze = Math.floor(n * 0.18);
  const nArms = n - nBulge - nBar - nDiskHaze;

  // Bulge: dense, warm, slightly flattened.
  for (let k = 0; k < nBulge; k++) {
    const r = Math.abs(gauss(rand)) * radius * 0.11;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const x = r * Math.sin(ph) * Math.cos(th);
    const z = r * Math.sin(ph) * Math.sin(th);
    const y = r * Math.cos(ph) * 0.55;
    const t = r / (radius * 0.2);
    b.push(x, y, z, b.mix(C.core, C.gold, t), 0.55 + rand() * 0.5, 0.9 + rand() * 1.4, 1);
  }

  // Bar: elongated along x before rotation.
  for (let k = 0; k < nBar; k++) {
    const x = gauss(rand) * barLength * 0.45;
    const z = gauss(rand) * barLength * 0.12;
    const y = gauss(rand) * thickness * 0.6;
    b.push(x, y, z, b.mix(C.gold, C.oldRed, rand()), 0.45 + rand() * 0.4, 0.8 + rand() * 1.1, 1);
  }

  // Smooth disk haze of older stars between the arms.
  for (let k = 0; k < nDiskHaze; k++) {
    const r = radius * Math.sqrt(rand()) * 1.02;
    const th = rand() * Math.PI * 2;
    b.push(r * Math.cos(th), gauss(rand) * thickness, r * Math.sin(th), b.mix(C.gold, C.white, r / radius), 0.16 + rand() * 0.18, 0.7 + rand() * 0.8, 1);
  }

  // Arms.
  const r0 = Math.max(barLength * 0.9, radius * 0.12);
  for (let k = 0; k < nArms; k++) {
    // pick arm by weight
    let pick = rand() * totalW;
    let arm = arms[0];
    for (const a of arms) {
      pick -= a.weight;
      if (pick <= 0) {
        arm = a;
        break;
      }
    }
    // radius distribution: exponential-ish falloff
    const u = rand();
    const r = r0 + (radius - r0) * (1 - Math.exp(-u * 2.6)) / (1 - Math.exp(-2.6));
    const th = arm.offset + Math.log(r / r0) / pitch;
    const spread = armWidth * (0.35 + r / radius) * (arm.weight < 0.8 ? 0.8 : 1);
    const dx = gauss(rand) * spread;
    const dz = gauss(rand) * spread;
    const x = r * Math.cos(th) + dx;
    const z = r * Math.sin(th) + dz;
    const y = gauss(rand) * thickness * (0.6 + 0.4 * (1 - r / radius));
    const dist = Math.hypot(dx, dz) / spread; // 0 on the arm spine
    const onSpine = Math.exp(-dist * dist);
    if (rand() < hiiRate * onSpine) {
      // pink star-forming knot
      b.push(x, y, z, C.hii, 0.55 + rand() * 0.5, 1.8 + rand() * 2.2, 1);
    } else {
      const young = onSpine * (0.4 + 0.6 * (r / radius));
      const col = b.mix(C.white, rand() < 0.5 ? C.young : C.cyan, young);
      b.push(x, y, z, col, (0.28 + 0.5 * onSpine) * (0.6 + rand() * 0.6) * arm.weight, 0.8 + rand() * 1.4 * onSpine, 1);
    }
  }
}

function milkyWay(n: number, seed: number) {
  const rand = mulberry32(seed);
  const b = new Builder(n);
  spiralDisk(b, rand, n, {
    radius: MW_RADIUS,
    // Two major arms (Scutum–Centaurus, Perseus) off the bar ends; two fainter (Norma, Sagittarius).
    arms: [
      { offset: 0, weight: 1 },
      { offset: Math.PI, weight: 1 },
      { offset: Math.PI / 2, weight: 0.55 },
      { offset: (3 * Math.PI) / 2, weight: 0.55 },
    ],
    pitch: 0.24,
    armWidth: 0.55,
    barLength: 2.6,
    bulge: 0.12,
    thickness: 0.18,
    hiiRate: 0.05,
  });
  return b.done([0, 0, 0]);
}

function andromeda(n: number, seed: number) {
  const rand = mulberry32(seed);
  const b = new Builder(n);
  spiralDisk(b, rand, n, {
    radius: 11,
    arms: [
      { offset: 0.4, weight: 1 },
      { offset: 0.4 + Math.PI, weight: 1 },
    ],
    pitch: 0.12, // tightly wound, ring-like
    armWidth: 0.6,
    barLength: 1.2,
    bulge: 0.2,
    thickness: 0.16,
    hiiRate: 0.035,
  });
  // Seen at a steep inclination, as from Earth (cigar-shaped glow).
  return b.done([1.32, 0, 0.62]);
}

function elliptical(n: number, seed: number) {
  const rand = mulberry32(seed);
  const b = new Builder(n);
  const nGc = Math.min(1200, Math.floor(n * 0.03));
  for (let k = 0; k < n - nGc; k++) {
    // de Vaucouleurs-like: many stars concentrated in the centre, long halo.
    const r = Math.pow(rand(), 2.6) * 9.5 + Math.abs(gauss(rand)) * 0.25;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const x = r * Math.sin(ph) * Math.cos(th) * 1.0;
    const y = r * Math.cos(ph) * 0.78;
    const z = r * Math.sin(ph) * Math.sin(th) * 0.9;
    const t = r / 9.5;
    b.push(x, y, z, b.mix(C.core, C.oldRed, t * 1.2), (0.5 - 0.3 * t) * (0.6 + rand() * 0.6), 0.8 + rand() * 1.2, 0.15);
  }
  // Globular-cluster swarm: bright compact points out in the halo.
  for (let k = 0; k < nGc; k++) {
    const r = 3 + Math.pow(rand(), 0.8) * 12;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    b.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.85, r * Math.sin(ph) * Math.sin(th), C.gold, 0.8 + rand() * 0.4, 1.6 + rand() * 0.8, 0.1);
  }
  return b.done([0.3, 0, 0.25]);
}

function irregular(n: number, seed: number) {
  const rand = mulberry32(seed);
  const b = new Builder(n);
  // Off-centre stellar bar plus a handful of star-forming clumps (Tarantula-like knot included).
  const clumps = Array.from({ length: 9 }, (_, i) => ({
    x: (rand() - 0.5) * 11 + (i === 0 ? 3 : 0),
    z: (rand() - 0.5) * 8,
    s: 0.6 + rand() * 1.4,
    w: i === 0 ? 2.2 : 0.6 + rand(),
  }));
  const totalW = clumps.reduce((s, c) => s + c.w, 0);
  const nBar = Math.floor(n * 0.35);
  const nHaze = Math.floor(n * 0.25);
  for (let k = 0; k < nBar; k++) {
    const x = gauss(rand) * 3.2 - 0.8;
    const z = gauss(rand) * 0.9 + x * 0.12;
    b.push(x, gauss(rand) * 0.35, z, b.mix(C.gold, C.white, rand()), 0.35 + rand() * 0.35, 0.8 + rand() * 1.0, 0.5);
  }
  for (let k = 0; k < nHaze; k++) {
    const x = gauss(rand) * 4.5;
    const z = gauss(rand) * 3.5;
    b.push(x, gauss(rand) * 0.6, z, b.mix(C.white, C.young, rand()), 0.15 + rand() * 0.2, 0.7 + rand() * 0.8, 0.5);
  }
  for (let k = nBar + nHaze; k < n; k++) {
    let pick = rand() * totalW;
    let c = clumps[0];
    for (const cc of clumps) {
      pick -= cc.w;
      if (pick <= 0) {
        c = cc;
        break;
      }
    }
    const x = c.x + gauss(rand) * c.s;
    const z = c.z + gauss(rand) * c.s;
    const hot = rand();
    const col = hot < 0.22 ? C.hii : hot < 0.6 ? C.young : C.cyan;
    b.push(x, gauss(rand) * 0.4, z, col, 0.35 + rand() * 0.55, 1 + rand() * 1.8, 0.5);
  }
  return b.done([0.75, 0.2, 0.1]);
}

function interacting(n: number, seed: number) {
  const rand = mulberry32(seed);
  const b = new Builder(n);
  const nodes = [
    { cx: -2.2, cz: 0.6, rot: 0.4, sign: 1 },
    { cx: 2.4, cz: -0.5, rot: 2.6, sign: -1 },
  ];
  const nTail = Math.floor(n * 0.32);
  const perGal = Math.floor((n - nTail) / 2);
  for (const g of nodes) {
    for (let k = 0; k < perGal; k++) {
      const r = Math.pow(rand(), 0.9) * 4.2;
      const th = rand() * Math.PI * 2 + (r * 0.9) * g.sign;
      const warp = Math.sin(th * 2 + g.rot) * 0.35;
      const x = g.cx + r * Math.cos(th) * 1.15 + gauss(rand) * 0.25;
      const z = g.cz + r * Math.sin(th) * 0.8 + warp;
      const y = gauss(rand) * 0.3;
      const knot = rand() < 0.1 * (1 - r / 4.2);
      const col = knot ? C.hii : b.mix(C.gold, C.young, r / 4.2 + rand() * 0.3);
      b.push(x, y, z, col, (knot ? 0.7 : 0.35) + rand() * 0.4, knot ? 2 + rand() * 1.6 : 0.8 + rand() * 1.2, 0.3);
    }
  }
  // Two long curving tidal streamers ("antennae").
  for (let k = 0; k < nTail; k++) {
    const which = k % 2 === 0 ? 0 : 1;
    const t = rand();
    const g = nodes[which];
    const s = which === 0 ? -1 : 1;
    const ang = g.rot + s * t * 2.4;
    const R = 3 + t * 9;
    const x = g.cx + Math.cos(ang) * R * 0.9 * s + gauss(rand) * (0.25 + t * 0.5);
    const z = g.cz + Math.sin(ang) * R * 0.55 + gauss(rand) * (0.25 + t * 0.5);
    b.push(x, gauss(rand) * 0.3, z, b.mix(C.white, C.young, rand()), (0.3 - t * 0.18) * (0.6 + rand() * 0.6), 0.7 + rand() * 0.9, 0.15);
  }
  return b.done([0.9, 0, 0.2]);
}

export function buildGalaxy(kind: GalaxyKind, count: number, seed = 1977): GalaxyModel {
  switch (kind) {
    case 'milky-way':
      return milkyWay(count, seed);
    case 'andromeda':
      return andromeda(count, seed + 31);
    case 'elliptical':
      return elliptical(count, seed + 87);
    case 'irregular':
      return irregular(count, seed + 160);
    case 'interacting':
      return interacting(count, seed + 4038);
  }
}
