import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftSprite } from '../../utils/softSprite';

interface NebulaDustProps {
  reducedMotion?: boolean;
}

export const NebulaDust: React.FC<NebulaDustProps> = ({ reducedMotion = false }) => {
  const dustRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#8D62FF'), // Nebula purple
      new THREE.Color('#48CFFF'), // Electric cyan
      new THREE.Color('#D946EF'), // Magenta
      new THREE.Color('#1E1B4B'), // Deep indigo
    ];

    for (let i = 0; i < count; i++) {
      // Create spiral/filament cloud formations
      const t = Math.random() * Math.PI * 4;
      const r = 40 + Math.random() * 180;
      const spread = (Math.random() - 0.5) * 60;

      pos[i * 3] = Math.cos(t) * r + spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = Math.sin(t) * r + spread - 80;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (dustRef.current && !reducedMotion) {
      dustRef.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <points ref={dustRef}>
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
        size={6.0}
        vertexColors
        transparent
        opacity={0.22}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
