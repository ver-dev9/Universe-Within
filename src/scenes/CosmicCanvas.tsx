import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Starfield } from '../components/effects/Starfield';
import { NebulaDust } from '../components/effects/NebulaDust';
import { SunMesh } from '../components/planets/SunMesh';
import { PlanetMesh } from '../components/planets/PlanetMesh';
import { PLANETS_DATA, PlanetData } from '../data/planetsData';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { PostEffects } from './PostEffects';
import { QUALITY_PROFILES, QUALITY_ORDER } from '../utils/quality';
import { useCosmosStore } from '../store/useCosmosStore';
import { CameraRig } from './CameraRig';
import { IntroScene } from './IntroScene';

interface CosmicCanvasProps {
  selectedPlanet: PlanetData | null;
  onSelectPlanet: (planet: PlanetData) => void;
  reducedMotion: boolean;
}

/** Solar system root — hidden during the Chapter 01 opening (the hero Earth owns that frame). */
function SolarSystem({ reducedMotion, onSelectPlanet }: { reducedMotion: boolean; onSelectPlanet: (p: PlanetData) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = useCosmosStore.getState().activeSection !== 'intro';
  });
  return (
    <group ref={ref}>
      <SunMesh reducedMotion={reducedMotion} />
      {PLANETS_DATA.map((planet, i) => (
        <PlanetMesh key={planet.id} data={planet} index={i} reducedMotion={reducedMotion} onSelect={onSelectPlanet} showOrbit />
      ))}
    </group>
  );
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
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

        {/* Single camera controller (scroll-scrubbed intro, fly-to, section poses) */}
        <CameraRig selectedPlanet={selectedPlanet} reducedMotion={reducedMotion} />

        {/* Chapter 01: glowing point -> hero Earth */}
        <IntroScene reducedMotion={reducedMotion} />

        {/* Chapter 02: Sun + 8 planets (cinematic / relative-size layouts) */}
        <SolarSystem reducedMotion={reducedMotion} onSelectPlanet={onSelectPlanet} />

        {/* Section 06 Beyond Planets: Supermassive Black Hole System at [0, 0, -160] */}
        <group position={[0, 0, -160]}>
        </group>

        <Suspense fallback={null}>
          <PostEffects />
        </Suspense>
      </Canvas>
    </div>
  );
};
