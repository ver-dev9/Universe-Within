import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '../../data/planetsData';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { AtmosphereGlow } from '../effects/AtmosphereGlow';
import { SaturnRing } from './SaturnRing';
import { blendedOrbit, blendedRadius, planetRegistry, solarState } from '../../scenes/rigState';
import { useCosmosStore } from '../../store/useCosmosStore';
import { QUALITY_PROFILES } from '../../utils/quality';

interface PlanetMeshProps {
  data: PlanetData;
  index: number;
  reducedMotion?: boolean;
  onSelect?: (planet: PlanetData) => void;
  showOrbit?: boolean;
}

const ATMOSPHERE_COLOR: Record<string, string> = {
  earth: '#48CFFF',
  venus: '#FFD580',
  mars: '#FF8866',
};

/** Sections where planet name labels are shown. */
const LABEL_SECTIONS = new Set(['solar-system']);

/**
 * One planet of the Chapter 02 system. Size and orbit radius are not React
 * props: they are blended every frame between the cinematic and relative-size
 * layouts from `solarState.scaleBlend`, so toggling scale mode never rebuilds
 * geometry. Everything lives in unit space and is scaled.
 */
export const PlanetMesh: React.FC<PlanetMeshProps> = ({ data, index, reducedMotion = false, onSelect, showOrbit = true }) => {
  const pivotRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const scaledRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const hitRef = useRef<THREE.Mesh>(null);
  const labelAnchorRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const quality = useCosmosStore((s) => s.quality);
  const segments = Math.max(24, Math.round(64 * QUALITY_PROFILES[quality].geometryDetail));

  const texture = useMemo(() => getPlanetTexture(data.id), [data.id]);

  // Orbital angular speed ∝ 1 / orbital period (Earth ≈ 0.05 rad/s).
  const orbitSpeed = useMemo(() => (365.25 / data.orbitPeriodDays) * 0.05, [data.orbitPeriodDays]);
  // Spin ∝ 1 / sidereal rotation period; sign carries retrograde rotation.
  const spinSpeed = useMemo(
    () => (24 / Math.abs(data.rotationPeriodHours)) * 0.15 * Math.sign(data.rotationPeriodHours),
    [data.rotationPeriodHours],
  );
  // Spread the starting longitudes so the planets do not line up on one axis.
  const startAngle = useMemo(() => index * 2.39996, [index]);
  const tilt = THREE.MathUtils.degToRad(data.axialTiltDeg);

  // Orbit path as a 1-px line loop of unit radius, scaled to the blended orbit.
  const orbitLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#69D9EF', transparent: true, opacity: 0.16, depthWrite: false });
    return new THREE.LineLoop(geo, mat);
  }, []);
  useEffect(
    () => () => {
      orbitLine.geometry.dispose();
      (orbitLine.material as THREE.Material).dispose();
    },
    [orbitLine],
  );

  useEffect(() => {
    if (pivotRef.current) pivotRef.current.rotation.y = startAngle;
    const body = bodyRef.current;
    if (body) planetRegistry.set(data.id, body);
    return () => {
      if (planetRegistry.get(data.id) === body) planetRegistry.delete(data.id);
    };
  }, [data.id, startAngle]);

  useFrame((_, delta) => {
    const r = blendedRadius(data);
    const orbit = blendedOrbit(data);
    const state = useCosmosStore.getState();
    const focused = state.focusedPlanetId === data.id;

    if (bodyRef.current) bodyRef.current.position.x = orbit;
    if (scaledRef.current) scaledRef.current.scale.setScalar(r);
    if (hitRef.current) hitRef.current.scale.setScalar(Math.max(r * 1.25, 1.4 + solarState.scaleBlend * 1.2));
    orbitLine.scale.setScalar(orbit);
    (orbitLine.material as THREE.LineBasicMaterial).opacity = hovered || focused ? 0.45 : 0.16;

    if (!reducedMotion) {
      if (spinRef.current) spinRef.current.rotation.y += delta * spinSpeed;
      if (pivotRef.current) pivotRef.current.rotation.y += delta * orbitSpeed * solarState.orbitTimeScale;
    }

    if (labelAnchorRef.current) labelAnchorRef.current.position.y = r * (data.id === 'saturn' ? 1.6 : 1.25) + 0.5;
    const el = labelRef.current;
    if (el) {
      const show = LABEL_SECTIONS.has(state.activeSection);
      el.style.opacity = show ? (focused || hovered ? '1' : '0.7') : '0';
      el.dataset.focused = focused ? 'true' : 'false';
    }
  });

  return (
    <group>
      {showOrbit && <primitive object={orbitLine} />}

      <group ref={pivotRef}>
        <group
          ref={bodyRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(data);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Generous invisible hit target so tiny true-scale worlds stay clickable */}
          <mesh ref={hitRef}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>

          <group ref={scaledRef}>
            <group rotation={[0, 0, tilt]}>
              <mesh ref={spinRef}>
                <sphereGeometry args={[1, segments, segments]} />
                <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} />
              </mesh>

              {data.id === 'saturn' && <SaturnRing />}

              {/* Uranus's faint narrow rings (ε ring ≈ 2.0 Ru) */}
              {data.id === 'uranus' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.64, 2.0, 96]} />
                  <meshBasicMaterial color="#9FD8E0" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
              )}
            </group>

            {data.atmosphere.length > 0 && data.id !== 'mercury' && (
              <AtmosphereGlow
                radius={1}
                color={ATMOSPHERE_COLOR[data.id] ?? data.color}
                intensity={data.id === 'venus' ? 1.4 : 1.1}
                power={3.5}
              />
            )}

            {hovered && (
              <mesh>
                <sphereGeometry args={[1.35, 24, 24]} />
                <meshBasicMaterial color="#69D9EF" wireframe transparent opacity={0.3} />
              </mesh>
            )}
          </group>

          <group ref={labelAnchorRef}>
            <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <div
                ref={labelRef}
                className="planet-label font-mono text-[10px] tracking-[0.25em] uppercase whitespace-nowrap select-none"
                style={{ opacity: 0, transition: 'opacity 0.4s' }}
              >
                {data.name}
              </div>
            </Html>
          </group>
        </group>
      </group>
    </group>
  );
};
