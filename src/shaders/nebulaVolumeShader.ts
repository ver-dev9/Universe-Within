import { SIMPLEX_3D } from './phase5Noise';

/**
 * Slice-based "volumetric" nebula. One InstancedMesh draws N camera-facing
 * planes stacked through the volume; each instance carries its depth (aSlice)
 * and samples 3D noise at that depth, so the stack reads as a volume as the
 * camera moves through it — with one draw call per nebula.
 *
 * uShape: 0 cavity (Orion), 1 pillars (Eagle), 2 cloud (Carina),
 *         3 filaments (Crab), 4 shell (Ring).
 */
export const NEBULA_SHAPE_INDEX = { cavity: 0, pillars: 1, cloud: 2, filaments: 3, shell: 4 } as const;

export const NebulaVolumeShader = {
  uniforms: {
    uTime: { value: 0 },
    uShape: { value: 0 },
    uColorA: { value: null as unknown },
    uColorB: { value: null as unknown },
    uColorC: { value: null as unknown },
    uIntensity: { value: 1 },
    uScale: { value: 1 },
    uOpacity: { value: 1 },
    uSeed: { value: 0 },
  },
  vertexShader: /* glsl */ `
    attribute float aSlice;
    varying vec3 vP;
    varying float vDepth;
    void main() {
      vP = vec3(position.xy * 2.0, aSlice);
      vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
      vec4 mv = viewMatrix * world;
      vDepth = -mv.z;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uShape;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uIntensity;
    uniform float uScale;
    uniform float uOpacity;
    uniform float uSeed;
    varying vec3 vP;
    varying float vDepth;
    ${SIMPLEX_3D}
    float fbm(vec3 p) {
      float a = 0.5, s = 0.0;
      for (int i = 0; i < OCTAVES; i++) { s += a * snoise(p); p = p * 2.03 + vec3(11.7, 3.1, 7.9); a *= 0.5; }
      return s;
    }
    void main() {
      vec3 p = vP;
      float r = length(p);
      vec3 q = p * uScale + vec3(uSeed, uSeed * 0.37, uTime * 0.02);
      float n = fbm(q * 1.6);
      float density = 0.0;
      float heat = 0.0;      // 0 = outer/cool palette, 1 = hot/ionised palette

      if (uShape < 0.5) {
        // Orion: bright ionised cavity opening toward us, dense wall behind.
        float wall = smoothstep(-0.6, 0.6, -p.z + n * 0.5);
        float bowl = exp(-pow(length(p.xy * vec2(0.9, 1.1)) * 1.2, 2.0));
        density = (0.55 * wall + 0.6 * bowl) * (0.6 + 0.8 * n);
        heat = bowl * 1.1;
      } else if (uShape < 1.5) {
        // Eagle: three eroding pillars with glowing rims against ionised haze.
        float pil = 1e3;
        vec3 cs[3];
        cs[0] = vec3(-0.45, 0.0, 0.05); cs[1] = vec3(0.05, 0.0, -0.1); cs[2] = vec3(0.5, 0.0, 0.1);
        float tops[3]; tops[0] = 0.55; tops[1] = 0.25; tops[2] = 0.0;
        for (int i = 0; i < 3; i++) {
          vec3 d = p - cs[i];
          float w = 0.16 + 0.06 * (1.0 - (p.y + 1.0) * 0.5) + n * 0.05;
          float side = length(d.xz) - w;
          float top = p.y - tops[i] - n * 0.12;
          pil = min(pil, max(side, top));
        }
        float rim = exp(-pow(pil / 0.05, 2.0));
        float inside = smoothstep(0.02, -0.08, pil);
        float haze = (0.35 + 0.65 * n) * smoothstep(1.0, 0.2, r);
        density = haze * (1.0 - inside) * 0.55 + rim * 1.3 + inside * 0.12;
        heat = rim + haze * 0.4 * smoothstep(-0.2, 1.0, p.y);
      } else if (uShape < 2.5) {
        // Carina: vast turbulent cloud, dark globules, bright core region.
        float body = smoothstep(1.0, 0.1, r + n * 0.35);
        float glob = smoothstep(0.35, 0.7, fbm(q * 3.1 + 5.0));
        density = body * (0.5 + n) * (1.0 - 0.75 * glob);
        heat = smoothstep(0.6, 0.0, length(p - vec3(0.25, 0.1, 0.0))) + n * 0.3;
      } else if (uShape < 3.5) {
        // Crab: ridged filament web inside an ellipsoid + blue synchrotron core.
        float e = length(p * vec3(0.85, 1.1, 1.0));
        float shellMask = smoothstep(1.0, 0.55, e + n * 0.2);
        float ridge = 1.0 - abs(snoise(q * 2.6));
        ridge = pow(ridge, 5.0);
        float sync = exp(-e * e * 3.5);
        density = ridge * shellMask * 1.4 + sync * 0.65;
        heat = sync * 1.4;
      } else {
        // Ring: shell (red outer, blue-green inner) with a blue barrel core.
        float e = length(p * vec3(1.0, 1.15, 0.85));
        float shell = exp(-pow((e - 0.58 - n * 0.06) / 0.13, 2.0));
        float knots = smoothstep(0.25, 0.6, snoise(q * 6.0)) * exp(-pow((e - 0.47) / 0.05, 2.0));
        float core = exp(-e * e * 9.0) * 0.55;
        density = shell * (0.75 + 0.5 * n) - knots * 0.6 + core;
        heat = clamp(1.0 - (e - 0.3) * 2.2, 0.0, 1.0);
      }

      density = max(density, 0.0);
      vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.9, density));
      col = mix(col, uColorC, clamp(heat, 0.0, 1.0) * 0.85);
      // Soft spherical bound so no slice edge is visible.
      float bound = smoothstep(1.0, 0.75, max(abs(vP.x), abs(vP.y)));
      // Fade slices very close to the camera so fly-through has no popping.
      float nearFade = smoothstep(0.6, 5.0, vDepth);
      float a = density * bound * nearFade * uOpacity * SLICE_WEIGHT;
      gl_FragColor = vec4(col * a * uIntensity, a);
      #include <colorspace_fragment>
    }
  `,
};
