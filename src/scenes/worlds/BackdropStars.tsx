import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mulberry32, randomUnitVector } from '../sun/random';

/** Lightweight distant star shell so chapter scenes have depth. Static: no per-frame work. */
export function BackdropStars({ count = 1500, radius = 140, seed = 7 }: { count?: number; radius?: number; seed?: number }) {
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(seed);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const v = randomUnitVector(rand).multiplyScalar(radius * (0.8 + rand() * 0.2));
      pos.set([v.x, v.y, v.z], i * 3);
      c.setHSL(0.55 + rand() * 0.12, 0.35, 0.55 + rand() * 0.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false });
    return { geometry: g, material: m };
  }, [count, radius, seed]);
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  return <points geometry={geometry} material={material} />;
}
