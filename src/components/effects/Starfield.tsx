import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftSprite } from '../../utils/softSprite';

interface StarfieldProps {
  count?: number;
  radius?: number;
  reducedMotion?: boolean;
}

export const Starfield: React.FC<StarfieldProps> = ({
  count = 4500,
  radius = 600,
  reducedMotion = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate stellar coordinates and spectral colors (O, B, A, F, G, K, M)
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const spectralPalette = [
      new THREE.Color('#9bb0ff'), // O/B: Blue-white (hot)
      new THREE.Color('#bbccff'), // A: Pure white
      new THREE.Color('#f8f9ff'), // F: Yellow-white
      new THREE.Color('#fff4e8'), // G: Yellow (like Sun)
      new THREE.Color('#ffd2a1'), // K: Orange
      new THREE.Color('#ffb56c'), // M: Red dwarf
      new THREE.Color('#48cfff'), // Electric Cyan accent
    ];

    for (let i = 0; i < count; i++) {
      // Distribute in a spherical shell around center
      const r = radius * 0.2 + Math.random() * (radius * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // Variable stellar sizes (brighter major stars vs faint background stars)
      sz[i] = Math.random() < 0.05 ? 2.5 + Math.random() * 2.5 : 0.8 + Math.random() * 1.4;
    }

    return [pos, col, sz];
  }, [count, radius]);

  useFrame((_, delta) => {
    if (pointsRef.current && !reducedMotion) {
      // Extremely subtle slow celestial sphere drift
      pointsRef.current.rotation.y += delta * 0.005;
      pointsRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={getSoftSprite()}
        alphaTest={0.01}
        size={1.6}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
