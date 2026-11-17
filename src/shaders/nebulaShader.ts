import * as THREE from 'three';

export const NebulaDustShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float dist = length(p);
      if (dist > 1.0) discard;

      // Soft circular cloud falloff
      float falloff = pow(1.0 - dist, 1.8);

      // Multi-octave wave interference for gaseous filaments
      float wave1 = sin(p.x * 6.0 + uTime * 0.2) * cos(p.y * 6.0 - uTime * 0.15);
      float wave2 = sin(p.x * 12.0 - p.y * 10.0 + uTime * 0.3);
      float gas = clamp((wave1 + wave2 * 0.5) * 0.5 + 0.5, 0.0, 1.0);

      // Nebula colors: deep purple to electric cyan
      vec3 purple = vec3(0.55, 0.25, 0.95);
      vec3 cyan = vec3(0.15, 0.75, 0.95);
      vec3 deepBlue = vec3(0.05, 0.1, 0.3);

      vec3 col = mix(deepBlue, purple, gas);
      col = mix(col, cyan, pow(gas, 2.5));

      float alpha = falloff * (0.25 + gas * 0.35);
      gl_FragColor = vec4(col, alpha);
    }
  `
};
