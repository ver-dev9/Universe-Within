import { SIMPLEX_3D, BLACKBODY } from './phase5Noise';

/**
 * Procedural star photosphere. Colour follows a blackbody approximation of
 * `uTemp`; convection cells (hot granules, cool lanes) shift the local
 * temperature, and limb darkening dims the edge. `uTurbulence` scales cell size
 * so giants look boiling and main-sequence stars look finely granulated.
 */
export const StellarSurfaceShader = {
  uniforms: {
    uTime: { value: 0 },
    uTemp: { value: 5800 },
    uTurbulence: { value: 0.5 },
    uBrightness: { value: 1.6 },
  },
  vertexShader: /* glsl */ `
    varying vec3 vObjPos;
    varying vec3 vNormalV;
    varying vec3 vViewDir;
    void main() {
      vObjPos = normalize(position);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormalV = normalize(normalMatrix * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uTemp;
    uniform float uTurbulence;
    uniform float uBrightness;
    varying vec3 vObjPos;
    varying vec3 vNormalV;
    varying vec3 vViewDir;
    ${SIMPLEX_3D}
    ${BLACKBODY}
    void main() {
      float freq = mix(9.0, 3.0, uTurbulence);
      vec3 p = vObjPos * freq;
      float t = uTime * mix(0.05, 0.12, uTurbulence);
      float cells = snoise(p + vec3(0.0, t, 0.0)) * 0.6 + snoise(p * 2.3 - vec3(t)) * 0.3 + snoise(p * 5.1 + t) * 0.1;
      float spots = smoothstep(0.55, 0.9, snoise(vObjPos * 1.6 + vec3(t * 0.3)));
      float localTemp = uTemp * (1.0 + cells * 0.12 - spots * 0.18 * uTurbulence);
      vec3 col = blackbody(localTemp);
      float mu = clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0);
      float limb = 0.35 + 0.65 * pow(mu, 0.55);
      col *= limb * uBrightness * (0.9 + cells * 0.25);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/** Camera-facing halo; additive, coloured by the same blackbody temperature. */
export const StellarGlowShader = {
  uniforms: {
    uTemp: { value: 5800 },
    uIntensity: { value: 1.0 },
    uFalloff: { value: 2.2 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTemp;
    uniform float uIntensity;
    uniform float uFalloff;
    varying vec2 vUv;
    ${BLACKBODY}
    void main() {
      float d = length(vUv - 0.5) * 2.0;
      float a = pow(max(0.0, 1.0 - d), uFalloff) * uIntensity;
      gl_FragColor = vec4(blackbody(uTemp) * a, a);
    }
  `,
};
