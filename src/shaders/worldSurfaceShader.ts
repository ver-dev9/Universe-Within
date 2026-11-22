import { NOISE_GLSL } from './phase4Noise';

/**
 * Chapter 04 — procedural surfaces for rocky worlds and small bodies.
 * One parametric shader, configured per world (palette, craters, caps, clouds).
 * Lighting is a simple Lambert term from uSunDir plus a dim fill, so worlds
 * read as lit spheres without any texture downloads.
 */

export const worldVertex = /* glsl */ `
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

export const worldFragment = /* glsl */ `
uniform vec3 uColorLow;
uniform vec3 uColorHigh;
uniform vec3 uColorAccent;
uniform float uNoiseScale;
uniform float uCraterScale;
uniform float uCraterDensity;
uniform float uCraterStrength;
uniform float uIceCap;      // 0 = none, else latitude threshold (e.g. 0.86)
uniform float uClouds;      // 1 = Venus-style banded cloud deck
uniform float uHeart;       // 1 = Pluto-style bright nitrogen-ice plain
uniform float uBrightSpots; // Ceres-style salt deposits
uniform float uSeed;
uniform float uTime;
uniform vec3 uSunDir;
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
${NOISE_GLSL}

void main() {
  vec3 p = normalize(vObjPos);
  vec3 sp = p + vec3(uSeed);
  float n = fbm(sp * uNoiseScale);
  vec3 col = mix(uColorLow, uColorHigh, smoothstep(-0.35, 0.45, n));
  col = mix(col, uColorAccent, smoothstep(0.25, 0.7, fbm3(sp * uNoiseScale * 2.3 + 5.0)) * 0.45);

  // Craters (bowl darkening, rim brightening).
  if (uCraterStrength > 0.0) {
    vec2 c1 = craters(p + uSeed, uCraterScale, uCraterDensity);
    vec2 c2 = craters(p * 1.7 + uSeed + 3.0, uCraterScale * 2.4, uCraterDensity);
    float bowl = max(c1.x, c2.x * 0.7);
    float rim = max(c1.y, c2.y * 0.7);
    col *= 1.0 - bowl * 0.32 * uCraterStrength;
    col += rim * 0.12 * uCraterStrength;
  }

  // Polar ice caps (Mars).
  if (uIceCap > 0.0) {
    float edge = uIceCap + 0.04 * snoise(p * 9.0);
    float cap = smoothstep(edge, edge + 0.025, abs(p.y));
    col = mix(col, vec3(0.93, 0.94, 0.96), cap);
  }

  // Pluto's heart: a bright, smooth plain on one hemisphere.
  if (uHeart > 0.5) {
    vec3 hc = normalize(vec3(0.55, 0.1, 0.83));
    float d = distance(p, hc) + 0.08 * snoise(p * 6.0);
    float heart = 1.0 - smoothstep(0.42, 0.5, d);
    float left = 1.0 - smoothstep(0.24, 0.3, distance(p, normalize(vec3(0.25, 0.18, 0.95))) + 0.06 * snoise(p * 7.0));
    float plain = max(heart, left);
    col = mix(col, vec3(0.95, 0.9, 0.82), plain * 0.9);
  }

  // Ceres: scattered bright salt deposits inside young craters.
  if (uBrightSpots > 0.0) {
    vec2 w = worley(p * 7.0 + uSeed);
    float spot = 1.0 - smoothstep(0.03, 0.09, w.x);
    float mask = step(0.82, fract(sin(dot(floor(p * 7.0 + uSeed), vec3(12.9, 78.2, 37.7))) * 43758.5));
    col = mix(col, vec3(0.95, 0.95, 0.92), spot * mask * uBrightSpots);
  }

  // Venus: thick, banded sulfuric-acid cloud deck hides the surface.
  if (uClouds > 0.5) {
    vec3 q = p;
    float warp = fbm3(q * 2.0 + vec3(uTime * 0.01, 0.0, 0.0));
    float bands = sin((q.y + warp * 0.35) * 9.0 + fbm3(q * 4.0) * 2.0) * 0.5 + 0.5;
    float swirl = fbm(vec3(atan(q.z, q.x) * 1.5 + uTime * 0.02, q.y * 4.0 + warp, warp));
    col = mix(uColorLow, uColorHigh, bands * 0.6 + swirl * 0.4 + 0.2);
  }

  vec3 N = normalize(vWorldNormal);
  float diff = max(dot(N, normalize(uSunDir)), 0.0);
  float wrap = smoothstep(-0.15, 0.25, dot(N, normalize(uSunDir)));
  vec3 lit = col * (0.04 + 1.05 * diff * wrap);
  gl_FragColor = vec4(lit, 1.0);
}
`;

/** Back-face atmosphere rim (fresnel), lit from the sun side. */
export const atmosphereRimVertex = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const atmosphereRimFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uPower;
uniform float uStrength;
uniform vec3 uSunDir;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vWorldNormal);
  float rim = pow(1.0 - abs(dot(N, V)), uPower);
  float sun = smoothstep(-0.35, 0.6, dot(N, normalize(uSunDir)));
  float a = rim * sun * uStrength;
  gl_FragColor = vec4(uColor * a, a);
}
`;

/** Soft radial glow billboard (comet coma, highlights). */
export const glowVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
uniform float uTime;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float g = exp(-d * d * 5.0) * (1.0 - smoothstep(0.85, 1.0, d));
  g *= 0.92 + 0.08 * sin(uTime * 1.3);
  gl_FragColor = vec4(uColor * g * uStrength, g * uStrength);
}
`;

/**
 * Comet tail particles. Each particle loops along the tail on the GPU.
 * uTailDir points away from the Sun; uCurveDir bends the dust tail (artistic).
 */
export const tailVertex = /* glsl */ `
attribute float aSeed;
attribute vec3 aJitter;
uniform float uTime;
uniform vec3 uTailDir;
uniform vec3 uCurveDir;
uniform float uLength;
uniform float uSpread;
uniform float uCurve;
uniform float uSpeed;
uniform float uPixelRatio;
uniform float uSize;
varying float vLife;
void main() {
  float life = fract(uTime * uSpeed + aSeed);
  vLife = life;
  float along = life * uLength;
  vec3 pos = uTailDir * along + uCurveDir * along * along * uCurve / uLength + aJitter * (0.04 + along * uSpread);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 + life * 1.5) * uPixelRatio * (6.0 / -mv.z);
}
`;

export const tailFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vLife;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float fade = smoothstep(0.0, 0.05, vLife) * (1.0 - vLife);
  float a = soft * fade * uOpacity;
  gl_FragColor = vec4(uColor * a, a);
}
`;
