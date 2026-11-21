import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32, randomUnitVector } from '../sun/random';

/* Compact 3D gradient noise for CPU-side displacement (asteroids, comet nuclei). */
function makeNoise(seed: number) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h: number, x: number, y: number, z: number) => {
    const g = h & 15;
    const u = g < 8 ? x : y;
    const v = g < 4 ? y : g === 12 || g === 14 ? x : z;
    return ((g & 1) === 0 ? u : -u) + ((g & 2) === 0 ? v : -v);
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u), lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v),
      w,
    );
  };
}

export interface RockOptions {
  seed: number;
  detail: number;
  /** Large-scale lumpiness (0..1). */
  lumpiness?: number;
  craters?: number;
  stretch?: [number, number, number];
}

/** Noise-displaced icosphere with carved craters. Returns an indexed geometry with smooth normals. */
export function createRockGeometry({ seed, detail, lumpiness = 0.35, craters = 10, stretch = [1, 1, 1] }: RockOptions) {
  const noise = makeNoise(seed);
  const rand = mulberry32(seed * 7 + 3);
  const base = new THREE.IcosahedronGeometry(1, detail);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geo = mergeVertices(base);
  base.dispose();

  const dents = Array.from({ length: craters }, () => ({
    c: randomUnitVector(rand),
    r: 0.12 + rand() * 0.35,
    depth: 0.04 + rand() * 0.08,
  }));

  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let d = 1;
    d += lumpiness * noise(v.x * 1.2 + seed, v.y * 1.2, v.z * 1.2) * 0.9;
    d += 0.12 * noise(v.x * 3.1, v.y * 3.1 + seed, v.z * 3.1);
    d += 0.04 * noise(v.x * 8.0, v.y * 8.0, v.z * 8.0 + seed);
    for (const dent of dents) {
      const ang = v.angleTo(dent.c);
      const x = ang / dent.r;
      if (x < 1.35) {
        // bowl + raised rim
        d -= x < 1 ? dent.depth * (1 - x * x) : 0;
        d += x > 0.8 ? dent.depth * 0.35 * Math.sin(((x - 0.8) / 0.55) * Math.PI) : 0;
      }
    }
    v.multiplyScalar(d);
    pos.setXYZ(i, v.x * stretch[0], v.y * stretch[1], v.z * stretch[2]);
  }
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}
