import * as THREE from 'three';

export const BlackHoleAccretionShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // Polar coordinates on the flat accretion disk
      vec2 center = vec2(0.5, 0.5);
      vec2 d = vUv - center;
      float dist = length(d) * 2.0; // 0.0 at center, 1.0 at outer edge
      float angle = atan(d.y, d.x);

      // Inner shadow boundary (Schwarzschild horizon cutoff)
      float innerCut = 0.35;
      if (dist < innerCut) {
        discard;
      }

      // Keplerian differential rotation speed ~ r^-1.5
      float rotSpeed = 1.8 / pow(max(dist, 0.1), 1.2);
      float spiral = angle + uTime * rotSpeed;

      // Accretion gas density variations (spiral arms and shock turbulence)
      float density = sin(spiral * 8.0) * 0.5 + 0.5;
      density += sin(dist * 35.0 - uTime * 4.0) * 0.25;
      density = clamp(density, 0.0, 1.0);

      // Radial brightness profile (peaking near innermost stable circular orbit ISCO)
      float iscoPeak = exp(-pow((dist - 0.42) * 5.0, 2.0));
      float radialFade = smoothstep(1.0, 0.55, dist) * smoothstep(innerCut, innerCut + 0.08, dist);

      // Relativistic Doppler beaming: approaching side (x < 0) is blueshifted and intensified
      // receding side (x > 0) is redshifted and dimmed
      float dopplerFactor = -d.x * 1.5; // [-1.5, +1.5]
      float intensity = (0.7 + dopplerFactor * 0.5) * iscoPeak * radialFade;

      // Color gradient from ultra-hot cyan/white near ISCO to deep orange/red in outer disk
      vec3 hotColor = vec3(0.3, 0.85, 1.0); // Electric cyan (approaching Doppler blue)
      vec3 warmColor = vec3(1.0, 0.6, 0.15); // Golden amber
      vec3 coolColor = vec3(0.9, 0.15, 0.05); // Redshift tail

      vec3 diskColor = mix(coolColor, warmColor, iscoPeak);
      if (dopplerFactor > 0.1) {
        diskColor = mix(diskColor, hotColor, clamp(dopplerFactor * 0.8, 0.0, 1.0));
      }

      float alpha = clamp(intensity * (0.8 + density * 0.4), 0.0, 0.95);
      gl_FragColor = vec4(diskColor * 1.6, alpha);
    }
  `
};
