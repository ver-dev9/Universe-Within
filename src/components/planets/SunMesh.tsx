import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPlanetTexture } from '../../utils/textureGenerators';

interface SunMeshProps {
  reducedMotion?: boolean;
}

export const SunMesh: React.FC<SunMeshProps> = ({ reducedMotion = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flaresRef = useRef<THREE.Points>(null);

  const texture = useMemo(() => getPlanetTexture('sun'), []);

  // Solar flare particles
  const [flarePositions, flareColors] = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 6.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = Math.random() > 0.3 ? new THREE.Color('#FFDD55') : new THREE.Color('#FF4500');
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.04;
      }
      if (coronaRef.current) {
        coronaRef.current.rotation.z -= delta * 0.02;
        // Subtle rhythmic heartbeat pulsation
        const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 2.5) * 0.035;
        coronaRef.current.scale.set(pulse, pulse, pulse);
      }
      if (flaresRef.current) {
        flaresRef.current.rotation.y += delta * 0.06;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Omni-directional solar light illuminating the solar system */}
      <pointLight color="#FFF8E7" intensity={2.8} distance={300} decay={1.0} />

      {/* Sun Photosphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5.5, 48, 48]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Solar Chromosphere / Corona Glow */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[6.2, 32, 32]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.32}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Halo */}
      <mesh>
        <sphereGeometry args={[7.2, 32, 32]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Prominence / flare particle arcs */}
      <points ref={flaresRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={flarePositions.length / 3}
            array={flarePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={flareColors.length / 3}
            array={flareColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          vertexColors
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
