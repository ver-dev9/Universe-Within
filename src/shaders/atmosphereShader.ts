import * as THREE from 'three';

/**
 * Atmospheric halo drawn on the BACK faces of a shell slightly larger than the
 * planet. For a back face, d = -dot(normal, viewDir) runs from 0 at the shell's
 * outer silhouette to 1 at its centre; the planet's limb projects to
 * d = sqrt(1 - (R / Rshell)^2). The glow rises from 0 at the outer edge to full
 * strength at the limb, giving a soft falloff instead of a solid ring (v1 used
 * 1 - dot(), which is ≥ 1 everywhere on back faces).
 */
export const AtmosphereShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vPosition = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uPower;
    uniform float uLimb;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float d = clamp(-dot(normalize(vNormal), viewDir), 0.0, 1.0);
      float g = pow(clamp(d / uLimb, 0.0, 1.0), uPower);
      gl_FragColor = vec4(uColor * g * uIntensity, g * uIntensity);
    }
  `,
};

/** Shell radius relative to the planet radius (AtmosphereGlow uses 1.15). */
export const ATMOSPHERE_SHELL = 1.15;

export function createAtmosphereMaterial(colorHex: string, intensity = 1.2, power = 3.0): THREE.ShaderMaterial {
  const limb = Math.sqrt(1 - 1 / (ATMOSPHERE_SHELL * ATMOSPHERE_SHELL));
  return new THREE.ShaderMaterial({
    vertexShader: AtmosphereShader.vertexShader,
    fragmentShader: AtmosphereShader.fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      // Callers tuned intensity/power for the old formula; map them to the new falloff.
      uIntensity: { value: Math.min(1, intensity * 0.55) },
      uPower: { value: Math.max(1.2, power * 0.75) },
      uLimb: { value: limb },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}

/**
 * Thin front-facing Fresnel rim on the planet itself: the bright blue edge of
 * the lit limb, faded toward the night side by the sun direction.
 */
export function createRimMaterial(colorHex: string, intensity = 1): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: AtmosphereShader.vertexShader,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform vec3 uSunDirView;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(-vPosition);
        float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        float lit = smoothstep(-0.25, 0.4, dot(n, uSunDirView));
        float a = rim * lit * uIntensity;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uIntensity: { value: intensity },
      uSunDirView: { value: new THREE.Vector3(1, 0, 0) },
    },
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}
