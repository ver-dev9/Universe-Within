import { NOISE_GLSL } from './phase4Noise';

/**
 * Chapter 05 — one procedural moon shader with a mode switch:
 * 0 Moon · 1 Io · 2 Europa · 3 Ganymede · 4 Callisto · 5 Titan · 6 Enceladus · 7 Triton
 * Colours are artistic approximations; features (cracks, hotspots, stripes)
 * are procedural illustrations, not maps.
 */

export const MOON_MODES = { moon: 0, io: 1, europa: 2, ganymede: 3, callisto: 4, titan: 5, enceladus: 6, triton: 7 } as const;

export const moonVertex = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vObjPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const moonFragment = /* glsl */ `
uniform int uMode;
uniform float uTime;
uniform vec3 uSunDir;
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
${NOISE_GLSL}

vec3 moonSurface(vec3 p) {
  float maria = smoothstep(0.05, 0.35, fbm(p * 1.3 + 2.0));
  vec3 col = mix(vec3(0.62, 0.61, 0.6), vec3(0.28, 0.28, 0.3), maria);
  col *= 0.9 + 0.1 * fbm3(p * 8.0);
  vec2 c = craters(p, 5.0, 0.55);
  vec2 c2 = craters(p + 4.0, 12.0, 0.5);
  col *= 1.0 - max(c.x, c2.x * 0.7) * 0.25;
  col += max(c.y, c2.y * 0.6) * 0.12;
  return col;
}

vec3 ioSurface(vec3 p, out float hot) {
  float n = fbm(p * 2.2);
  vec3 col = mix(vec3(0.85, 0.72, 0.25), vec3(0.95, 0.9, 0.62), smoothstep(-0.3, 0.4, n));
  col = mix(col, vec3(0.75, 0.38, 0.12), smoothstep(0.25, 0.6, fbm3(p * 3.5 + 7.0)) * 0.7);
  col = mix(col, vec3(0.95, 0.95, 0.88), smoothstep(0.45, 0.7, fbm3(p * 5.0 + 1.0)) * 0.6);
  // Volcanic centres: dark calderas ringed by red deposits; emissive cores.
  vec2 w = worley(p * 4.5);
  float caldera = 1.0 - smoothstep(0.05, 0.13, w.x);
  float ring = (1.0 - smoothstep(0.12, 0.32, w.x)) * (1.0 - caldera);
  col = mix(col, vec3(0.62, 0.2, 0.08), ring * 0.55);
  col = mix(col, vec3(0.08, 0.05, 0.04), caldera);
  hot = caldera * (0.75 + 0.25 * sin(uTime * 2.0 + w.y * 30.0));
  return col;
}

vec3 europaSurface(vec3 p) {
  vec3 col = mix(vec3(0.86, 0.82, 0.74), vec3(0.97, 0.95, 0.9), smoothstep(-0.4, 0.4, fbm3(p * 3.0)));
  // Chaos terrain: mottled brownish patches.
  col = mix(col, vec3(0.62, 0.45, 0.32), smoothstep(0.3, 0.6, fbm(p * 2.5 + 9.0)) * 0.6);
  // Lineae: long reddish-brown cracks along several orientations.
  float l1 = pow(ridge(vec3(p.x * 3.0, p.y * 9.0 + p.z * 2.0, p.z * 3.0)), 18.0);
  float l2 = pow(ridge(p * 5.5 + vec3(3.0)), 22.0);
  float l3 = pow(ridge(vec3(p.y * 7.0 + p.x, p.z * 4.0, p.x * 2.0) + 11.0), 26.0);
  float cracks = clamp(l1 + l2 * 0.8 + l3 * 0.7, 0.0, 1.0);
  // Double ridges: thin bright edges beside the dark crack line.
  col = mix(col, vec3(0.55, 0.3, 0.18), cracks * 0.85);
  return col;
}

vec3 ganymedeSurface(vec3 p) {
  float dark = smoothstep(-0.05, 0.2, fbm(p * 1.6 + 3.0));
  vec3 bright = vec3(0.72, 0.68, 0.62);
  float grooves = 0.85 + 0.15 * sin(dot(p, normalize(vec3(0.3, 1.0, 0.2))) * 120.0 + fbm3(p * 6.0) * 4.0);
  bright *= grooves;
  vec3 col = mix(bright, vec3(0.32, 0.28, 0.24), dark);
  vec2 c = craters(p, 8.0, 0.45);
  col += c.y * 0.18;
  col = mix(col, vec3(0.9, 0.9, 0.92), smoothstep(0.82, 0.92, abs(p.y)) * 0.6);
  return col;
}

vec3 callistoSurface(vec3 p) {
  vec3 col = mix(vec3(0.18, 0.16, 0.14), vec3(0.36, 0.32, 0.28), smoothstep(-0.4, 0.5, fbm(p * 2.0)));
  vec2 c = craters(p, 9.0, 0.85);
  vec2 c2 = craters(p + 2.0, 20.0, 0.8);
  // Callisto's crater rims and ejecta are bright ice on a dark crust.
  col += max(c.y, c2.y) * vec3(0.5, 0.48, 0.45);
  col = mix(col, vec3(0.75, 0.73, 0.7), (1.0 - smoothstep(0.0, 0.05, worley(p * 14.0).x)) * 0.8);
  return col;
}

vec3 titanSurface(vec3 p) {
  return mix(vec3(0.25, 0.18, 0.1), vec3(0.45, 0.33, 0.18), smoothstep(-0.3, 0.4, fbm(p * 2.0)));
}

vec3 enceladusSurface(vec3 p) {
  vec3 col = vec3(0.95, 0.97, 1.0) * (0.92 + 0.08 * fbm3(p * 6.0));
  vec2 c = craters(p, 7.0, 0.35);
  col *= 1.0 - c.x * 0.12 * smoothstep(-0.2, 0.4, p.y); // craters fade towards the smooth south
  // "Tiger stripes": four parallel fractures near the south pole.
  float south = smoothstep(-0.62, -0.8, p.y);
  float stripes = pow(abs(sin(p.x * 18.0 + snoise(p * 4.0) * 0.6)), 30.0);
  col = mix(col, vec3(0.45, 0.68, 0.85), stripes * south * 0.9);
  return col;
}

vec3 tritonSurface(vec3 p) {
  // Cantaloupe terrain (dimpled) with a pinkish nitrogen-frost polar cap and dark plume streaks.
  vec2 w = worley(p * 9.0);
  vec3 col = mix(vec3(0.62, 0.58, 0.55), vec3(0.78, 0.74, 0.7), smoothstep(0.1, 0.5, w.y - w.x));
  float cap = smoothstep(-0.05, -0.3, p.y + 0.08 * snoise(p * 5.0));
  col = mix(col, vec3(0.93, 0.82, 0.78), cap);
  float streak = smoothstep(0.55, 0.85, snoise(vec3(p.x * 2.0, p.y * 14.0, p.z * 2.0))) * cap;
  col = mix(col, vec3(0.35, 0.3, 0.28), streak * 0.7);
  return col;
}

void main() {
  vec3 p = normalize(vObjPos);
  vec3 col;
  float hot = 0.0;
  if (uMode == 0) col = moonSurface(p);
  else if (uMode == 1) col = ioSurface(p, hot);
  else if (uMode == 2) col = europaSurface(p);
  else if (uMode == 3) col = ganymedeSurface(p);
  else if (uMode == 4) col = callistoSurface(p);
  else if (uMode == 5) col = titanSurface(p);
  else if (uMode == 6) col = enceladusSurface(p);
  else col = tritonSurface(p);

  vec3 N = normalize(vWorldNormal);
  float ndl = dot(N, normalize(uSunDir));
  float diff = max(ndl, 0.0);
  vec3 lit = col * (0.035 + 1.05 * diff);
  // Io's hotspots glow even on the night side.
  lit += hot * vec3(1.0, 0.35, 0.08) * 1.6;
  gl_FragColor = vec4(lit, 1.0);
}
`;

/** Titan's opaque orange haze shell. */
export const hazeVertex = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vObjPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const hazeFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uSunDir;
uniform float uOpacity;
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
${NOISE_GLSL}
void main() {
  vec3 p = normalize(vObjPos);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vWorldNormal);
  float mu = abs(dot(N, V));
  float bands = fbm3(vec3(p.x * 1.5, p.y * 6.0 + uTime * 0.01, p.z * 1.5)) * 0.5 + 0.5;
  vec3 haze = mix(vec3(0.78, 0.48, 0.16), vec3(0.95, 0.68, 0.3), bands);
  // Darker northern polar hood, brighter limb (forward scattering).
  haze = mix(haze, vec3(0.55, 0.32, 0.12), smoothstep(0.6, 0.95, p.y) * 0.5);
  float ndl = dot(N, normalize(uSunDir));
  float light = smoothstep(-0.25, 0.6, ndl);
  float limb = pow(1.0 - mu, 2.5);
  vec3 col = haze * (0.06 + light) + vec3(1.0, 0.7, 0.35) * limb * smoothstep(-0.5, 0.3, ndl) * 0.8;
  float a = mix(0.92, 1.0, limb) * uOpacity;
  gl_FragColor = vec4(col * uOpacity, a);
}
`;

/** Parent planet backdrop: simple banded / oceanic sphere. 0 Earth · 1 Jupiter · 2 Saturn · 3 Neptune */
export const parentFragment = /* glsl */ `
uniform int uKind;
uniform float uOpacity;
uniform vec3 uSunDir;
uniform float uTime;
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
${NOISE_GLSL}
void main() {
  vec3 p = normalize(vObjPos);
  vec3 col;
  float warp = fbm3(p * 3.0 + vec3(uTime * 0.005)) * 0.12;
  if (uKind == 0) {
    float land = smoothstep(0.12, 0.2, fbm(p * 1.8 + 4.0));
    col = mix(vec3(0.05, 0.16, 0.38), vec3(0.24, 0.32, 0.17), land);
    col = mix(col, vec3(0.95), smoothstep(0.25, 0.6, fbm(p * 3.0 + 1.0)) * 0.7);
  } else if (uKind == 1) {
    float b = sin((p.y + warp) * 22.0) * 0.5 + 0.5;
    col = mix(vec3(0.66, 0.5, 0.36), vec3(0.93, 0.87, 0.76), b);
    col = mix(col, vec3(0.75, 0.38, 0.25), (1.0 - smoothstep(0.0, 0.08, length(vec2(p.x - 0.55, (p.y + 0.35) * 1.8)))) * 0.8);
  } else if (uKind == 2) {
    float b = sin((p.y + warp * 0.5) * 16.0) * 0.5 + 0.5;
    col = mix(vec3(0.78, 0.68, 0.48), vec3(0.93, 0.86, 0.66), b);
  } else {
    float b = sin((p.y + warp) * 10.0) * 0.5 + 0.5;
    col = mix(vec3(0.16, 0.3, 0.75), vec3(0.3, 0.48, 0.9), b);
  }
  vec3 N = normalize(vWorldNormal);
  float diff = max(dot(N, normalize(uSunDir)), 0.0);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * smoothstep(-0.2, 0.5, dot(N, normalize(uSunDir)));
  vec3 lit = col * (0.02 + 0.9 * diff) + rim * col * 0.6;
  gl_FragColor = vec4(lit * uOpacity, uOpacity);
}
`;

/** Plume particles (Enceladus jets, Io umbrella plumes). Artistic, GPU-animated. */
export const plumeVertex = /* glsl */ `
attribute vec3 aOrigin;   // surface point (unit sphere)
attribute float aSeed;
attribute vec3 aJitter;
uniform float uTime;
uniform float uRadius;
uniform float uHeight;
uniform float uSpread;
uniform float uSpeed;
uniform float uUmbrella;  // 1 = ballistic umbrella (Io), 0 = jet (Enceladus)
uniform float uPixelRatio;
uniform float uSize;
varying float vLife;
void main() {
  float life = fract(uTime * uSpeed + aSeed);
  vLife = life;
  vec3 up = normalize(aOrigin);
  float h;
  float side;
  if (uUmbrella > 0.5) {
    // Rise and fall back: parabolic arc spreading outward.
    h = 4.0 * life * (1.0 - life) * uHeight;
    side = life * uSpread;
  } else {
    h = life * uHeight;
    side = life * uSpread;
  }
  vec3 pos = up * (uRadius + h) + aJitter * side;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.6 + life) * uPixelRatio * (6.0 / -mv.z);
}
`;

export const plumeFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vLife;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float fade = smoothstep(0.0, 0.06, vLife) * (1.0 - smoothstep(0.6, 1.0, vLife));
  float a = soft * fade * uOpacity;
  gl_FragColor = vec4(uColor * a, a);
}
`;
