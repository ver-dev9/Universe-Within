import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getSaturnRingTexture } from '../../utils/textureGenerators';

interface SaturnRingProps {
  innerRadius?: number;
  outerRadius?: number;
}

export const SaturnRing: React.FC<SaturnRingProps> = ({
  innerRadius = 3.6,
  outerRadius = 7.2,
}) => {
  const ringTexture = useMemo(() => getSaturnRingTexture(), []);

  // Custom UV mapping for concentric ring geometry
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;

    // Map radial distance (inner to outer) to U (0 to 1)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - innerRadius) / (outerRadius - innerRadius);
      uvs.setXY(i, u, 0.5);
    }
    uvs.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI * 0.38, 0.15, 0]}
    >
      <meshStandardMaterial
        map={ringTexture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.88}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
};
