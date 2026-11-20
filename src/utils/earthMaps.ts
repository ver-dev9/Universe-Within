import * as THREE from 'three';

/**
 * Procedural Earth maps (day colour, clouds, city lights, roughness) built from
 * seeded 3D value noise sampled on the unit sphere, so the equirectangular
 * maps wrap seamlessly at the date line and do not pinch at the poles.
 * Generated once on first use and cached for the lifetime of the page.
 */

export interface EarthMaps {
  day: THREE.CanvasTexture;
  clouds: THREE.CanvasTexture;
  night: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
}

let cache: EarthMaps | null = null;

// --- seeded value noise -----------------------------------------------------
const PERM = new Uint8Array(512);
(() => {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const hash = (x: number, y: number, z: number) => PERM[PERM[PERM[x & 255] + (y & 255)] + (z & 255)] / 255;

function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), l(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
    l(l(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), l(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
}

function fbm(x: number, y: number, z: number, octaves: number) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function makeTexture(canvas: HTMLCanvasElement, srgb: boolean) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export function getEarthMaps(): EarthMaps {
  if (cache) return cache;

  const W = 1024, H = 512;
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  };
  const dayC = mk(), cloudC = mk(), nightC = mk(), roughC = mk();
  const dayCtx = dayC.getContext('2d')!, cloudCtx = cloudC.getContext('2d')!;
  const nightCtx = nightC.getContext('2d')!, roughCtx = roughC.getContext('2d')!;
  const day = dayCtx.createImageData(W, H), clouds = cloudCtx.createImageData(W, H);
  const night = nightCtx.createImageData(W, H), rough = roughCtx.createImageData(W, H);

  for (let j = 0; j < H; j++) {
    const lat = (0.5 - j / H) * Math.PI; // +pi/2 north .. -pi/2 south
    const cosLat = Math.cos(lat), sinLat = Math.sin(lat);
    const absLatDeg = Math.abs(lat) * (180 / Math.PI);
    for (let i = 0; i < W; i++) {
      const lon = (i / W) * Math.PI * 2;
      const x = cosLat * Math.cos(lon), y = sinLat, z = cosLat * Math.sin(lon);
      const idx = (j * W + i) * 4;

      // Domain-warped continents.
      const wx = fbm(x * 1.4 + 7.1, y * 1.4, z * 1.4, 3) - 0.5;
      const wz = fbm(x * 1.4, y * 1.4 + 3.3, z * 1.4 - 2.2, 3) - 0.5;
      const e = fbm(x * 1.6 + wx * 1.2, y * 1.6, z * 1.6 + wz * 1.2, 6);
      const sea = 0.566; // ≈29% of the sphere is land, like Earth
      const land = smoothstep(sea - 0.004, sea + 0.004, e);
      const height = Math.max(0, (e - sea) / (1 - sea));

      // Climate: deserts near ±25°, forests elsewhere, ice at the poles.
      const moist = fbm(x * 3 + 11, y * 3, z * 3, 4);
      const desertBelt = Math.exp(-Math.pow((absLatDeg - 24) / 11, 2));
      const aridity = smoothstep(0.35, 0.75, desertBelt * 0.9 + (0.5 - moist) * 0.9);

      let r = mix(52, 92, smoothstep(0, 0.12, height)); // forest green -> olive
      let g = mix(98, 116, smoothstep(0, 0.12, height));
      let b = mix(48, 62, smoothstep(0, 0.12, height));
      r = mix(r, 196, aridity); g = mix(g, 160, aridity); b = mix(b, 108, aridity);
      const mountain = smoothstep(0.22, 0.42, height);
      r = mix(r, 122, mountain); g = mix(g, 110, mountain); b = mix(b, 98, mountain);

      // Ocean: deep navy to shallow teal near coasts.
      const shallow = smoothstep(sea - 0.05, sea, e);
      const or = mix(12, 28, shallow), og = mix(42, 104, shallow), ob = mix(98, 150, shallow);

      let cr = mix(or, r, land), cg = mix(og, g, land), cb = mix(ob, b, land);

      // Ice caps (land and sea ice), ragged edge.
      const iceEdge = 68 + (fbm(x * 5, y * 5, z * 5, 3) - 0.5) * 14 - land * 6;
      const ice = smoothstep(iceEdge - 2, iceEdge + 2, absLatDeg);
      cr = mix(cr, 236, ice); cg = mix(cg, 242, ice); cb = mix(cb, 248, ice);

      day.data[idx] = cr; day.data[idx + 1] = cg; day.data[idx + 2] = cb; day.data[idx + 3] = 255;

      // Roughness: glossy ocean, matte land and ice.
      const ro = Math.round(mix(150, 240, Math.max(land, ice)));
      rough.data[idx] = ro; rough.data[idx + 1] = ro; rough.data[idx + 2] = ro; rough.data[idx + 3] = 255;

      // City lights: clustered on non-polar, non-desert land, denser near coasts.
      const cluster = fbm(x * 18 + 5, y * 18, z * 18 - 9, 3);
      const coast = 1 - smoothstep(0, 0.1, height);
      const habitable = land * (1 - ice) * (1 - aridity * 0.8) * (1 - smoothstep(55, 65, absLatDeg));
      const lights = habitable * smoothstep(0.55, 0.78, cluster + coast * 0.12);
      night.data[idx] = 255 * lights; night.data[idx + 1] = 196 * lights; night.data[idx + 2] = 110 * lights;
      night.data[idx + 3] = 255;

      // Clouds: banded, stretched along latitude, sparse in the subtropics.
      const cl = fbm(x * 2.6 + 4, y * 5.2, z * 2.6 - 3, 5);
      const band = 0.8 + 0.25 * Math.cos(lat * 6) - 0.3 * desertBelt;
      const cover = smoothstep(0.5, 0.75, cl * band + 0.08);
      clouds.data[idx] = 255; clouds.data[idx + 1] = 255; clouds.data[idx + 2] = 255;
      clouds.data[idx + 3] = 255 * cover * 0.92;
    }
  }

  dayCtx.putImageData(day, 0, 0);
  cloudCtx.putImageData(clouds, 0, 0);
  nightCtx.putImageData(night, 0, 0);
  roughCtx.putImageData(rough, 0, 0);

  cache = {
    day: makeTexture(dayC, true),
    clouds: makeTexture(cloudC, true),
    night: makeTexture(nightC, true),
    roughness: makeTexture(roughC, false),
  };
  return cache;
}
