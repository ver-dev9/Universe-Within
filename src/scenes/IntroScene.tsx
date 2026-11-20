import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EarthGlobe } from '../components/planets/EarthGlobe';
import { getSoftSprite } from '../utils/softSprite';
import { INTRO_ORIGIN, INTRO_EARTH_RADIUS, introRig } from './rigState';
import { useCosmosStore } from '../store/useCosmosStore';
import { QUALITY_PROFILES } from '../utils/quality';
import { Starfield } from '../components/effects/Starfield';

/** Sections in which the Chapter 01 hero Earth is rendered. */
const INTRO_SECTIONS = new Set(['intro', 'deep-space']);

/**
 * Chapter 01 "The Beginning": a glowing point that resolves into a realistic
 * Earth. Everything here is driven imperatively from `introRig`, which the
 * intro ScrollTrigger timeline scrubs — no React state changes while scrolling.
 */
export const IntroScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const rootRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Group>(null);
  const pointRef = useRef<THREE.Sprite>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const quality = useCosmosStore((s) => s.quality);
  const profile = QUALITY_PROFILES[quality];
  const segments = Math.round(96 * profile.geometryDetail);

  const pointMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: getSoftSprite(),
        color: new THREE.Color('#CDEFFF'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  const haloMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: getSoftSprite(),
        color: new THREE.Color('#3478D4'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      pointMaterial.dispose();
      haloMaterial.dispose();
    },
    [pointMaterial, haloMaterial],
  );

  // Sunlight arrives from the Sun's side of the scene (behind-left of the camera).
  const sunDir = useMemo<[number, number, number]>(() => [-30, 10, -24], []);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    root.visible = INTRO_SECTIONS.has(useCosmosStore.getState().activeSection);
    if (!root.visible) return;

    const t = state.clock.elapsedTime;
    const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 1.6) * 0.08;
    const glow = introRig.pointGlow;
    if (pointRef.current) {
      pointRef.current.visible = glow > 0.01;
      pointRef.current.scale.setScalar(9 * glow * pulse + 0.001);
      pointMaterial.opacity = Math.min(1, glow * 1.2);
    }
    if (haloRef.current) {
      haloRef.current.visible = glow > 0.01;
      haloRef.current.scale.setScalar(34 * glow * pulse + 0.001);
      haloMaterial.opacity = glow * 0.55;
    }
    if (earthRef.current) {
      const r = introRig.earthReveal;
      earthRef.current.visible = r > 0.002;
      // Ease-out growth: the point "condenses" into a world.
      const eased = 1 - Math.pow(1 - r, 3);
      earthRef.current.scale.setScalar((INTRO_EARTH_RADIUS / 2.5) * Math.max(eased, 0.001));
    }
  });

  return (
    <group ref={rootRef} position={INTRO_ORIGIN}>
      {/* Local star shell around the opening shot ("stars form"); the global field is far from here */}
      <Starfield count={Math.round(profile.starCount * 0.6)} radius={300} reducedMotion={reducedMotion} />
      <sprite ref={haloRef} material={haloMaterial} />
      <sprite ref={pointRef} material={pointMaterial} />
      <group ref={earthRef}>
        <EarthGlobe
          reducedMotion={reducedMotion}
          sunDirection={sunDir}
          ambientIntensity={0.03}
          showMoon={false}
          cityLights
          segments={segments}
          atmosphereIntensity={1.7}
        />
      </group>
    </group>
  );
};
