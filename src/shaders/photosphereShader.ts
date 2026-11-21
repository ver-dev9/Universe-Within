import { NOISE_GLSL } from './phase4Noise';

/**
 * Chapter 03 Sun shaders. All procedural, all artistic:
 *  - photosphere: granulation (cellular convection cells), supergranular flow,
 *    sunspots with umbra/penumbra, faculae, and linear limb darkening
 *    I(mu) = 1 - u(1 - mu) with u ≈ 0.6 (a common visible-light approximation).
 *  - corona: camera-facing radial glow with streamers.
 *  - prominence: flowing emission along tube loops.
 *  - emission: GPU-animated particles leaving the surface.
 */

export const photosphereVertex = /* glsl */ `
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

export const photosphereFragment = /* glsl */ `
uniform float uTime;
uniform float uGranScale;
uniform float uSpotAmount;
uniform float uDetail; // 0..1 quality
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
${NOISE_GLSL}

void main() {
  vec3 p = normalize(vObjPos);
  float t = uTime;

  // Granulation: bright convection cells separated by dark intergranular lanes.
  vec3 gp = p * uGranScale + vec3(0.0, t * 0.035, t * 0.02);
  vec2 w = worley(gp + 0.35 * vec3(snoise(gp * 0.5 + t * 0.05)));
  float lanes = smoothstep(0.0, 0.32, w.y - w.x);
  float cell = 1.0 - w.x * 0.9;
  float gran = mix(0.35, 1.0, lanes) * mix(0.75, 1.0, cell);

  // Second, finer granulation octave on higher quality.
  if (uDetail > 0.5) {
    vec2 w2 = worley(gp * 2.3 - vec3(t * 0.05));
    gran *= mix(0.86, 1.0, smoothstep(0.0, 0.25, w2.y - w2.x));
  }

  // Supergranular flow / plasma turbulence.
  float flow = fbm3(p * 3.0 + vec3(t * 0.04, -t * 0.03, t * 0.02));

  // Sunspots: confined to two active belts either side of the equator.
  float lat = abs(p.y);
  float belt = smoothstep(0.08, 0.2, lat) * (1.0 - smoothstep(0.45, 0.6, lat));
  float spotField = snoise(p * 2.2 + vec3(11.0, 0.0, t * 0.01)) * 0.7 + snoise(p * 5.0 + 3.0) * 0.3;
  spotField *= belt;
  float thr = mix(0.75, 0.48, uSpotAmount);
  float penumbra = smoothstep(thr, thr + 0.06, spotField);
  float umbra = smoothstep(thr + 0.09, thr + 0.14, spotField);
  // Faculae: bright magnetic network around active regions.
  float faculae = smoothstep(thr - 0.18, thr - 0.02, spotField) * (1.0 - penumbra);

  float intensity = gran * (0.85 + 0.25 * flow);
  vec3 hot = vec3(1.0, 0.93, 0.68);
  vec3 warm = vec3(1.0, 0.62, 0.16);
  vec3 deep = vec3(0.72, 0.22, 0.03);
  vec3 col = mix(deep, warm, smoothstep(0.25, 0.7, intensity));
  col = mix(col, hot, smoothstep(0.7, 1.05, intensity));

  // Penumbral filaments: streaks radiating in spot regions.
  float fil = 0.75 + 0.25 * ridge(p * 40.0);
  col = mix(col, vec3(0.55, 0.2, 0.04) * fil, penumbra * 0.75);
  col = mix(col, vec3(0.18, 0.05, 0.01), umbra * 0.9);

  // Limb darkening + reddening towards the edge.
  vec3 V = normalize(cameraPosition - vWorldPos);
  float mu = clamp(dot(normalize(vWorldNormal), V), 0.0, 1.0);
  float limb = 1.0 - 0.6 * (1.0 - mu);
  col *= limb;
  col = mix(col * vec3(1.0, 0.7, 0.45), col, smoothstep(0.0, 0.5, mu));
  col += faculae * (1.0 - mu) * vec3(0.35, 0.22, 0.08);

  gl_FragColor = vec4(col * 1.25, 1.0);
}
`;

/** Camera-facing corona billboard. uv in [0,1]; sun radius in uv units = uInner. */
export const coronaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const coronaFragment = /* glsl */ `
uniform float uTime;
uniform float uInner;
uniform float uStrength;
varying vec2 vUv;
${NOISE_GLSL}
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;          // 0 at centre, 1 at billboard edge
  float a = atan(c.y, c.x);
  float h = (r - uInner) / (1.0 - uInner); // 0 at limb, 1 at edge
  if (h < -0.02) discard;
  float streak = snoise(vec3(cos(a) * 2.2, sin(a) * 2.2, uTime * 0.05)) * 0.5 + 0.5;
  float fine = snoise(vec3(cos(a) * 9.0, sin(a) * 9.0, uTime * 0.08 + h * 2.0)) * 0.5 + 0.5;
  float falloff = exp(-h * mix(6.5, 3.2, streak));
  float glow = falloff * (0.55 + 0.45 * fine) + exp(-h * 22.0) * 0.9;
  glow *= smoothstep(1.0, 0.75, r);
  // Chromosphere: thin red rim just above the limb.
  float chromo = exp(-abs(h) * 70.0);
  vec3 col = mix(vec3(1.0, 0.55, 0.18), vec3(1.0, 0.85, 0.6), falloff) * glow;
  col += vec3(1.0, 0.25, 0.12) * chromo * 0.9;
  gl_FragColor = vec4(col * uStrength, clamp(glow + chromo, 0.0, 1.0));
}
`;

export const prominenceVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const prominenceFragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uIntensity;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
${NOISE_GLSL}
void main() {
  // u runs along the loop, v around the tube.
  float along = vUv.x;
  float flowN = snoise(vec3(along * 9.0 - uTime * 0.45, vUv.y * 3.0, uSeed));
  float strands = 0.55 + 0.45 * ridge(vec3(along * 3.0, vUv.y * 6.283, uSeed + uTime * 0.05));
  float feet = smoothstep(0.0, 0.08, along) * smoothstep(1.0, 0.92, along);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float edge = 1.0 - abs(dot(normalize(vWorldNormal), V));
  float a = (0.35 + 0.65 * (flowN * 0.5 + 0.5)) * strands * (0.4 + 0.6 * edge) * feet;
  vec3 col = mix(vec3(1.0, 0.28, 0.08), vec3(1.0, 0.7, 0.35), flowN * 0.5 + 0.5);
  gl_FragColor = vec4(col * uIntensity * a, a);
}
`;

export const emissionVertex = /* glsl */ `
attribute vec3 aDir;
attribute float aSeed;
attribute float aSpeed;
uniform float uTime;
uniform float uRadius;
uniform float uRange;
uniform float uPixelRatio;
varying float vLife;
void main() {
  float life = fract(uTime * aSpeed * 0.08 + aSeed);
  vLife = life;
  vec3 dir = normalize(aDir);
  // Drift sideways as if guided by field lines.
  vec3 side = normalize(cross(dir, vec3(0.0, 1.0, 0.0)) + 1e-4);
  float h = life * life * uRange;
  vec3 pos = dir * (uRadius + h) + side * sin(aSeed * 40.0 + life * 3.0) * h * 0.35;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(9.0, 2.0, life) * (0.6 + fract(aSeed * 13.7));
  gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
}
`;

export const emissionFragment = /* glsl */ `
varying float vLife;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float fade = smoothstep(0.0, 0.08, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
  vec3 col = mix(vec3(1.0, 0.85, 0.5), vec3(1.0, 0.3, 0.08), vLife);
  gl_FragColor = vec4(col * soft * fade, soft * fade);
}
`;
