import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { AtmosphereGlow } from '../effects/AtmosphereGlow';

interface EarthGlobeProps {
  reducedMotion?: boolean;
  nightMode?: boolean;
  onMoonClick?: () => void;
  scale?: number;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  reducedMotion = false,
  nightMode = false,
  onMoonClick,
  scale = 1,
}) => {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const moonOrbitGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);

  const dayTexture = useMemo(() => getPlanetTexture('earth'), []);
  const nightTexture = useMemo(() => getPlanetTexture('earth-night'), []);
  const cloudsTexture = useMemo(() => getPlanetTexture('earth-clouds'), []);
  const moonTexture = useMemo(() => getPlanetTexture('moon'), []);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      // Earth rotation on its 23.5° tilted axis
      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y += delta * 0.08;
      }
      // Atmospheric clouds drift slightly faster due to atmospheric winds
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += delta * 0.105;
      }
      // Moon orbital period around Earth
      if (moonOrbitGroupRef.current) {
        moonOrbitGroupRef.current.rotation.y += delta * 0.03;
      }
      if (moonMeshRef.current) {
        moonMeshRef.current.rotation.y += delta * 0.03; // Tidally locked
      }
    }
  });

  return (
    <group scale={scale}>
      {/* Directional sunlight */}
      <directionalLight
        position={nightMode ? [-20, 5, -20] : [20, 8, 20]}
        intensity={nightMode ? 0.35 : 2.2}
        color="#FFF9E6"
      />
      <ambientLight intensity={nightMode ? 0.08 : 0.25} />

      {/* Earth tilted axis container (23.44° axial tilt) */}
      <group rotation={[0.41, 0, 0]}>
        {/* Earth Surface Sphere */}
        <mesh ref={earthMeshRef}>
          <sphereGeometry args={[2.5, 48, 48]} />
          <meshStandardMaterial
            map={nightMode ? nightTexture : dayTexture}
            roughness={0.65}
            metalness={0.1}
            emissive={nightMode ? new THREE.Color('#FFDD66') : new THREE.Color('#000000')}
            emissiveMap={nightMode ? nightTexture : undefined}
            emissiveIntensity={nightMode ? 0.8 : 0}
          />
        </mesh>

        {/* Dynamic Cloud Sphere */}
        <mesh ref={cloudsMeshRef}>
          <sphereGeometry args={[2.535, 48, 48]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={nightMode ? 0.25 : 0.65}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>

        {/* Rayleigh Atmospheric Fresnel Glow (electric cyan) */}
        <AtmosphereGlow radius={2.5} color="#48CFFF" intensity={1.5} power={2.8} />

        {/* Orbiting Moon Container */}
        <group ref={moonOrbitGroupRef}>
          <group position={[8.5, 0.4, 0]}>
            <mesh
              ref={moonMeshRef}
              onClick={onMoonClick}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.68, 32, 32]} />
              <meshStandardMaterial
                map={moonTexture}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Subtle Moon Orbit Line */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[8.48, 8.52, 64]} />
              <meshBasicMaterial color="#48CFFF" opacity={0.12} transparent side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
