/**
 * GPU particle shaders for Chapter 06. All motion is computed in the vertex
 * shader from static attributes + a few uniforms, so a whole particle system
 * is one draw call and costs no per-frame CPU work.
 */

const SOFT_POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;
    float a = pow(1.0 - d, 1.8) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

/** Molecular cloud that collapses into a spinning protostellar disk. */
export const CollapseCloudShader = {
  uniforms: {
    uTime: { value: 0 },
    uCollapse: { value: 0 },
    uDisk: { value: 0 },
    uOpacity: { value: 1 },
    uSize: { value: 26 },
    uPixelRatio: { value: 1 },
    uColorA: { value: null as unknown },
    uColorB: { value: null as unknown },
  },
  vertexShader: /* glsl */ `
    attribute vec4 aSeed;
    uniform float uTime;
    uniform float uCollapse;
    uniform float uDisk;
    uniform float uOpacity;
    uniform float uSize;
    uniform float uPixelRatio;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec3 vColor;
    varying float vAlpha;
    mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
    void main() {
      vec3 p = position;
      // Gravity pulls clumps inward; inner material falls first.
      float k = smoothstep(0.0, 1.0, clamp(uCollapse * (1.3 - aSeed.x * 0.5), 0.0, 1.0));
      float r = length(p);
      float target = mix(r, 0.35 + aSeed.y * 1.6, k);
      p = normalize(p) * target;
      // Angular momentum flattens the infall into a disk.
      p.y *= mix(1.0, 0.06 + aSeed.z * 0.08, uDisk);
      float spin = uTime * (0.05 + uDisk * 0.9 / max(0.4, target)) + aSeed.w * 6.2831;
      p.xz = rot(spin * (0.2 + k)) * p.xz;
      // Gentle turbulent drift.
      p += 0.08 * vec3(sin(uTime * 0.3 + aSeed.x * 20.0), cos(uTime * 0.25 + aSeed.y * 17.0), sin(uTime * 0.2 + aSeed.z * 13.0)) * (1.0 - k);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * uPixelRatio * (0.4 + aSeed.y) / -mv.z;
      float heat = smoothstep(2.5, 0.2, target) * k;
      vColor = mix(uColorA, uColorB, clamp(aSeed.x * 0.6 + heat, 0.0, 1.0)) * (0.6 + heat * 1.6);
      vAlpha = uOpacity * (0.25 + 0.75 * aSeed.z);
    }
  `,
  fragmentShader: SOFT_POINT_FRAG,
};

/**
 * Expanding ejecta. uMode 0 = planetary-nebula shell (slow, thin, bipolar),
 * uMode 1 = supernova blast (fast, filled, hot → cool colour).
 */
export const EjectaShader = {
  uniforms: {
    uTime: { value: 0 },
    uT: { value: 0 },
    uMode: { value: 0 },
    uRadius: { value: 4 },
    uOpacity: { value: 1 },
    uSize: { value: 30 },
    uPixelRatio: { value: 1 },
    uColorA: { value: null as unknown },
    uColorB: { value: null as unknown },
  },
  vertexShader: /* glsl */ `
    attribute vec3 aDir;
    attribute vec2 aRand;
    uniform float uTime;
    uniform float uT;
    uniform float uMode;
    uniform float uRadius;
    uniform float uOpacity;
    uniform float uSize;
    uniform float uPixelRatio;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec3 d = normalize(aDir);
      float r;
      if (uMode < 0.5) {
        // Shell: slightly elongated along y (bipolar), thin with noise thickness.
        float stretch = 1.0 + 0.35 * d.y * d.y;
        r = uT * uRadius * stretch * (0.88 + aRand.x * 0.12);
      } else {
        float ease = 1.0 - pow(1.0 - uT, 3.0);
        r = ease * uRadius * (0.25 + aRand.x * 0.95);
      }
      vec3 p = d * r;
      p += 0.05 * vec3(sin(uTime + aRand.y * 40.0), cos(uTime * 0.8 + aRand.x * 30.0), 0.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float sz = uMode < 0.5 ? (0.6 + aRand.y) : (0.5 + aRand.y * 1.2) * (1.0 + (1.0 - uT));
      gl_PointSize = uSize * uPixelRatio * sz / -mv.z;
      float mixv = uMode < 0.5 ? clamp(abs(d.y) + aRand.x * 0.3, 0.0, 1.0) : clamp(uT * 1.2 + aRand.x * 0.3, 0.0, 1.0);
      vColor = mix(uColorA, uColorB, mixv) * (uMode < 0.5 ? 1.2 : 1.0 + 1.6 * (1.0 - uT));
      vAlpha = uOpacity * (0.35 + 0.65 * aRand.y);
    }
  `,
  fragmentShader: SOFT_POINT_FRAG,
};

/** Simple accretion ring for the black-hole remnant (artistic). */
export const AccretionRingShader = {
  uniforms: {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      float r = length(c) * 2.0;
      float ang = atan(c.y, c.x);
      float band = smoothstep(0.42, 0.5, r) * (1.0 - smoothstep(0.62, 1.0, r));
      float streaks = 0.65 + 0.35 * sin(ang * 9.0 - uTime * 2.0 + r * 18.0);
      float doppler = 0.6 + 0.4 * cos(ang);
      vec3 col = mix(vec3(1.0, 0.45, 0.12), vec3(1.0, 0.9, 0.7), smoothstep(0.9, 0.5, r)) * doppler * streaks;
      float a = band * uOpacity;
      gl_FragColor = vec4(col * a * 1.6, a);
    }
  `,
};
