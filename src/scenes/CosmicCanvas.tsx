import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Starfield } from '../components/effects/Starfield';
import { NebulaDust } from '../components/effects/NebulaDust';
import { SunMesh } from '../components/planets/SunMesh';
import { PlanetMesh } from '../components/planets/PlanetMesh';
import { BlackHoleEffect } from '../components/effects/BlackHoleEffect';
import { PLANETS_DATA, PlanetData } from '../data/planetsData';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { PostEffects } from './PostEffects';
import { QUALITY_PROFILES, QUALITY_ORDER } from '../utils/quality';
import { useCosmosStore } from '../store/useCosmosStore';

interface CosmicCanvasProps {
  currentSectionId: string;
  selectedPlanet: PlanetData | null;
  onSelectPlanet: (planet: PlanetData) => void;
  reducedMotion: boolean;
}

// Camera controller that smoothly interpolates position and lookAt target
function CameraRig({
  currentSectionId,
  selectedPlanet,
  reducedMotion,
}: {
  currentSectionId: string;
  selectedPlanet: PlanetData | null;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 70, 150));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    // Determine desired camera position and lookAt target according to active section
    if (selectedPlanet && currentSectionId === 'planet-exploration') {
      // Zoom close to chosen planet
      const r = selectedPlanet.orbitRadius;
      targetPos.current.set(r + 3.5, 1.8, 4.2);
      lookAtTarget.current.set(r, 0, 0);
    } else {
      switch (currentSectionId) {
        case 'intro':
          targetPos.current.set(0, 45, 130);
          lookAtTarget.current.set(0, 0, 0);
          break;
        case 'deep-space':
          targetPos.current.set(0, 120, 200);
          lookAtTarget.current.set(0, 10, -50);
          break;
        case 'solar-system':
          targetPos.current.set(0, 55, 105);
          lookAtTarget.current.set(20, 0, 0);
          break;
        case 'planet-exploration':
          targetPos.current.set(36, 12, 38);
          lookAtTarget.current.set(36, 0, 0);
          break;
        case 'earth-special':
          targetPos.current.set(36 + 4.5, 1.2, 5.5);
          lookAtTarget.current.set(36, 0, 0);
          break;
        case 'beyond-planets':
          // Move camera to Black Hole sector at [0, 0, -160]
          targetPos.current.set(0, 12, -125);
          lookAtTarget.current.set(0, 0, -160);
          break;
        case 'scale-universe':
          targetPos.current.set(0, 180, 260);
          lookAtTarget.current.set(0, 0, 0);
          break;
        case 'discoveries':
          targetPos.current.set(20, 40, 80);
          lookAtTarget.current.set(0, 0, 0);
          break;
        case 'final-vista':
        default:
          targetPos.current.set(0, 30, 90);
          lookAtTarget.current.set(0, 0, 0);
          break;
      }
    }

    // Smooth Lerp factor (higher speed if reduced motion is requested)
    const lerpSpeed = reducedMotion ? 0.15 : Math.min(delta * 2.8, 0.1);
    camera.position.lerp(targetPos.current, lerpSpeed);
    currentLookAt.current.lerp(lookAtTarget.current, lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  currentSectionId,
  selectedPlanet,
  onSelectPlanet,
  reducedMotion,
}) => {
  const quality = useCosmosStore((s) => s.quality);
  const qualityLocked = useCosmosStore((s) => s.qualityLocked);
  const setQuality = useCosmosStore((s) => s.setQuality);
  const profile = QUALITY_PROFILES[quality];

  // Step quality down when the GPU can't hold frame rate (never up past the visitor's choice).
  const stepDown = () => {
    if (qualityLocked) return;
    const i = QUALITY_ORDER.indexOf(quality);
    if (i > 0) setQuality(QUALITY_ORDER[i - 1]);
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 60, 140], fov: 48, near: 0.1, far: 2000 }}
        gl={{
          antialias: profile.antialias,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        dpr={profile.dpr}
        aria-hidden="true"
      >
        <PerformanceMonitor onDecline={stepDown} flipflops={2} />
        <AdaptiveDpr pixelated={false} />
        <color attach="background" args={['#03040A']} />

        {/* Ambient & Star Lighting */}
        <ambientLight intensity={0.22} />

        {/* Procedural Starfield */}
        <Starfield count={profile.starCount} radius={750} reducedMotion={reducedMotion} />

        {/* Volumetric Nebula Dust Clouds */}
        <NebulaDust reducedMotion={reducedMotion} />

        {/* Dynamic Camera Animation Rig */}
        <CameraRig
          currentSectionId={currentSectionId}
          selectedPlanet={selectedPlanet}
          reducedMotion={reducedMotion}
        />

        {/* The Solar System Core */}
        <group position={[0, 0, 0]}>
          {/* Central Sun */}
          <SunMesh reducedMotion={reducedMotion} />

          {/* All 8 Major Planets */}
          {PLANETS_DATA.map((planet) => (
            <PlanetMesh
              key={planet.id}
              data={planet}
              reducedMotion={reducedMotion}
              onSelect={onSelectPlanet}
              showOrbit={true}
              isFocusMode={false}
            />
          ))}
        </group>

        {/* Section 06 Beyond Planets: Supermassive Black Hole System at [0, 0, -160] */}
        <group position={[0, 0, -160]}>
          <BlackHoleEffect reducedMotion={reducedMotion} />
        </group>

        <Suspense fallback={null}>
          <PostEffects />
        </Suspense>
      </Canvas>
    </div>
  );
};
