import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BlackHoleAccretionShader } from '../../shaders/blackHoleShader';

interface BlackHoleEffectProps {
  reducedMotion?: boolean;
}

export const BlackHoleEffect: React.FC<BlackHoleEffectProps> = ({ reducedMotion = false }) => {
  const diskMeshRef = useRef<THREE.Mesh>(null);
  const photonRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Custom accretion disk shader material
  const accretionMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: BlackHoleAccretionShader.vertexShader,
      fragmentShader: BlackHoleAccretionShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Swirling infalling matter particles
  const [particlePositions, particleColors] = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 3.8 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.8;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // Outer particles golden amber, inner approaching ISCO electric cyan
      const isApproaching = Math.cos(angle) < 0;
      const c = isApproaching ? new THREE.Color('#48CFFF') : new THREE.Color('#FF9F1C');
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      accretionMaterial.uniforms.uTime.value += delta;

      if (photonRingRef.current) {
        photonRingRef.current.rotation.z += delta * 0.5;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += delta * 0.8;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Central Event Horizon (Pitch-black Schwarzschild sphere absorbs all light) */}
      <mesh>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Gravitational Lensing / Photon Sphere Rim (apparent radius 2.6 Rs) */}
      <mesh ref={photonRingRef}>
        <ringGeometry args={[2.52, 2.85, 64]} />
        <meshBasicMaterial
          color="#FFF8E7"
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary outer warped Einstein gravitational ring */}
      <mesh rotation={[Math.PI * 0.45, 0, 0]}>
        <ringGeometry args={[3.2, 3.6, 64]} />
        <meshBasicMaterial
          color="#48CFFF"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Relativistic Accretion Disk */}
      <mesh
        ref={diskMeshRef}
        rotation={[-Math.PI * 0.35, 0.15, -Math.PI * 0.1]}
        material={accretionMaterial}
      >
        <planeGeometry args={[28, 28, 64, 64]} />
      </mesh>

      {/* 4. Infalling high-energy particles */}
      <points
        ref={particlesRef}
        rotation={[-Math.PI * 0.35, 0.15, -Math.PI * 0.1]}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleColors.length / 3}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
