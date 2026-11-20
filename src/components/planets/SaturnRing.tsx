import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { getSaturnRingTexture } from '../../utils/textureGenerators';

interface SaturnRingProps {
  /** In planet radii when the ring sits inside a unit-radius planet group. */
  innerRadius?: number;
  outerRadius?: number;
}

/**
 * Saturn's main rings in the planet's equatorial plane. Default extent is the
 * true ratio: C-ring inner edge ≈ 1.24 Rs to A-ring outer edge ≈ 2.27 Rs
 * (NASA Saturnian Rings Fact Sheet).
 */
export const SaturnRing: React.FC<SaturnRingProps> = ({ innerRadius = 1.24, outerRadius = 2.27 }) => {
  const ringTexture = useMemo(() => getSaturnRingTexture(), []);

  // Concentric UVs: radial distance (inner -> outer) maps to U (0 -> 1).
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 1);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const dist = Math.hypot(pos.getX(i), pos.getY(i));
      uvs.setXY(i, (dist - innerRadius) / (outerRadius - innerRadius), 0.5);
    }
    uvs.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  // Passed in as a prop, so R3F won't dispose it on unmount.
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={ringTexture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        roughness={0.8}
        metalness={0}
        depthWrite={false}
      />
    </mesh>
  );
};
