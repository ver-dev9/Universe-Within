import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getSoftSprite } from '../../utils/softSprite';
import { useLabEnv } from './useLabEnv';

/** Static background star shell, sized by the quality tier. */
export const Starfield: React.FC<{ radius?: number; fraction?: number; size?: number }> = ({ radius = 400, fraction = 0.35, size = 1.6 }) => {
  const { profile } = useLabEnv();
  const count = Math.round(profile.starCount * fraction);
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = radius * (0.8 + Math.random() * 0.2);
      pos.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
      c.setHSL(0.55 + Math.random() * 0.12 - (Math.random() < 0.2 ? 0.5 : 0), 0.35, 0.55 + Math.random() * 0.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const sprite = useMemo(() => getSoftSprite(), []);
  return (
    <points geometry={geometry} renderOrder={-10}>
      <pointsMaterial map={sprite} vertexColors size={size} sizeAttenuation={false} transparent depthWrite={false} opacity={0.85} />
    </points>
  );
};
