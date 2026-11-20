import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { getEarthMaps } from '../../utils/earthMaps';
import { AtmosphereGlow } from '../effects/AtmosphereGlow';
import { createRimMaterial } from '../../shaders/atmosphereShader';

interface EarthGlobeProps {
  reducedMotion?: boolean;
  nightMode?: boolean;
  onMoonClick?: () => void;
  scale?: number;
  /** Direction the sunlight comes FROM, in the globe's local frame. */
  sunDirection?: [number, number, number];
  /** Fill light; keep low so the night side reads as night. */
  ambientIntensity?: number;
  showMoon?: boolean;
  /** Show city lights only on the night side (shader-masked emissive). */
  cityLights?: boolean;
  /** Sphere segments (scaled by quality tier by the caller). */
  segments?: number;
  atmosphereIntensity?: number;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  reducedMotion = false,
  nightMode = false,
  onMoonClick,
  scale = 1,
  sunDirection = [20, 8, 20],
  ambientIntensity,
  showMoon = true,
  cityLights = false,
  segments = 48,
  atmosphereIntensity = 1.5,
}) => {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const moonOrbitGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);

  const dayTexture = useMemo(() => getPlanetTexture('earth'), []);
  const nightTexture = useMemo(() => getPlanetTexture('earth-night'), []);
  const cloudsTexture = useMemo(() => getPlanetTexture('earth-clouds'), []);
  const roughnessMap = useMemo(() => getEarthMaps().roughness, []);
  const moonTexture = useMemo(() => getPlanetTexture('moon'), []);

  // Light target lives at the globe's centre so the directional light follows the globe
  // wherever it is placed in the world (three's default target is the world origin).
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  // Night-side mask: city lights fade in only where the surface faces away from the sun.
  const sunDirView = useMemo(() => ({ value: new THREE.Vector3(1, 0, 0) }), []);
  const surfaceMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: nightMode ? nightTexture : dayTexture,
      roughness: 1,
      roughnessMap: nightMode ? null : roughnessMap,
      metalness: 0.05,
    });
    if (nightMode) {
      mat.emissive = new THREE.Color('#FFDD66');
      mat.emissiveMap = nightTexture;
      mat.emissiveIntensity = 0.8;
    } else if (cityLights) {
      mat.emissive = new THREE.Color('#FFFFFF');
      mat.emissiveMap = nightTexture;
      mat.emissiveIntensity = 1.4;
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSunDirView = sunDirView;
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec3 uSunDirView;')
          .replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
            float nightSide = 1.0 - smoothstep(-0.15, 0.12, dot(normalize(vNormal), uSunDirView));
            totalEmissiveRadiance *= nightSide;`,
          );
      };
    }
    return mat;
  }, [nightMode, cityLights, dayTexture, nightTexture, roughnessMap, sunDirView]);

  // Lit-limb scattering rim, sharing the sun-direction uniform with the surface.
  const rimMaterial = useMemo(() => {
    const m = createRimMaterial('#7FC8FF', 1.1);
    m.uniforms.uSunDirView = sunDirView;
    return m;
  }, [sunDirView]);

  useEffect(() => () => surfaceMaterial.dispose(), [surfaceMaterial]);
  useEffect(() => () => rimMaterial.dispose(), [rimMaterial]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    if (lightRef.current) {
      // Sun direction (light -> target) expressed in view space for the shader.
      tmp.setFromMatrixPosition(lightRef.current.matrixWorld);
      const target = tmpTarget.setFromMatrixPosition(lightTarget.matrixWorld);
      tmp.sub(target).normalize().transformDirection(state.camera.matrixWorldInverse);
      sunDirView.value.copy(tmp);
    }
    if (!reducedMotion) {
      if (earthMeshRef.current) earthMeshRef.current.rotation.y += delta * 0.03;
      // Clouds drift slightly faster than the surface.
      if (cloudsMeshRef.current) cloudsMeshRef.current.rotation.y += delta * 0.038;
      if (moonOrbitGroupRef.current) moonOrbitGroupRef.current.rotation.y += delta * 0.03;
      if (moonMeshRef.current) moonMeshRef.current.rotation.y += delta * 0.03; // Tidally locked
    }
  });

  return (
    <group scale={scale}>
      <primitive object={lightTarget} />
      <directionalLight
        ref={lightRef}
        position={nightMode ? [-20, 5, -20] : sunDirection}
        target={lightTarget}
        intensity={nightMode ? 0.35 : 2.6}
        color="#FFF6E5"
      />
      <ambientLight intensity={ambientIntensity ?? (nightMode ? 0.08 : 0.25)} />

      {/* Earth's 23.44° axial tilt */}
      <group rotation={[0, 0, 0.409]}>
        <mesh ref={earthMeshRef} material={surfaceMaterial}>
          <sphereGeometry args={[2.5, segments, segments]} />
        </mesh>

        <mesh ref={cloudsMeshRef}>
          <sphereGeometry args={[2.53, segments, segments]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={nightMode ? 0.25 : 0.85}
            depthWrite={false}
            roughness={1}
          />
        </mesh>

        <mesh material={rimMaterial}>
          <sphereGeometry args={[2.545, segments, segments]} />
        </mesh>

        {/* Rayleigh-style atmospheric halo (shared shader) */}
        <AtmosphereGlow radius={2.5} color="#5AB8FF" intensity={atmosphereIntensity} power={2.6} />
      </group>

      {showMoon && (
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
              <meshStandardMaterial map={moonTexture} roughness={0.9} metalness={0.05} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
