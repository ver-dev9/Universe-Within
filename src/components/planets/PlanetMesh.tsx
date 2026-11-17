import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetData } from '../../data/planetsData';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { AtmosphereGlow } from '../effects/AtmosphereGlow';
import { SaturnRing } from './SaturnRing';

interface PlanetMeshProps {
  data: PlanetData;
  reducedMotion?: boolean;
  onSelect?: (planet: PlanetData) => void;
  showOrbit?: boolean;
  isFocusMode?: boolean;
}

export const PlanetMesh: React.FC<PlanetMeshProps> = ({
  data,
  reducedMotion = false,
  onSelect,
  showOrbit = true,
  isFocusMode = false,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => getPlanetTexture(data.id), [data.id]);

  // Orbit speed calculated inversely from orbit period
  const orbitSpeed = useMemo(() => {
    return (365.25 / data.orbitPeriodDays) * 0.05;
  }, [data.orbitPeriodDays]);

  // Axial rotation speed
  const rotationSpeed = useMemo(() => {
    return (24 / Math.abs(data.rotationPeriodHours)) * 0.15;
  }, [data.rotationPeriodHours]);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      if (planetRef.current) {
        planetRef.current.rotation.y += delta * rotationSpeed * (data.rotationPeriodHours < 0 ? -1 : 1);
      }
      if (orbitGroupRef.current && !isFocusMode) {
        orbitGroupRef.current.rotation.y += delta * orbitSpeed;
      }
    }
  });

  const planetRadius = data.relativeSize * (isFocusMode ? 1.6 : 1.0);

  const planetBody = (
    <group position={isFocusMode ? [0, 0, 0] : [data.orbitRadius, 0, 0]}>
      {/* Clickable Planet Mesh */}
      <mesh
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(data);
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
        <sphereGeometry args={[planetRadius, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric Fresnel Glow for planets with atmosphere */}
      {data.atmosphere.length > 0 && (
        <AtmosphereGlow
          radius={planetRadius}
          color={data.id === 'earth' ? '#48CFFF' : data.id === 'venus' ? '#FFD580' : data.id === 'mars' ? '#FF8866' : data.color}
          intensity={data.id === 'venus' ? 1.4 : 1.1}
          power={3.5}
        />
      )}

      {/* Interactive Selection / Hover Halo */}
      {hovered && (
        <mesh>
          <sphereGeometry args={[planetRadius * 1.35, 32, 32]} />
          <meshBasicMaterial
            color="#48CFFF"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* Saturn's Iconic Rings */}
      {data.id === 'saturn' && (
        <SaturnRing
          innerRadius={planetRadius * 1.3}
          outerRadius={planetRadius * 2.6}
        />
      )}

      {/* Uranus faint ring */}
      {data.id === 'uranus' && (
        <mesh rotation={[Math.PI * 0.48, 0, 0]}>
          <ringGeometry args={[planetRadius * 1.4, planetRadius * 1.6, 48]} />
          <meshBasicMaterial
            color="#75D8D8"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );

  if (isFocusMode) {
    return (
      <group>
        <ambientLight intensity={0.3} />
        <directionalLight position={[15, 10, 15]} intensity={2.0} color="#FFFFFF" />
        {planetBody}
      </group>
    );
  }

  return (
    <group>
      {/* Visual Orbit Path Line */}
      {showOrbit && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.orbitRadius - 0.08, data.orbitRadius + 0.08, 96]} />
          <meshBasicMaterial
            color="#48CFFF"
            opacity={hovered ? 0.35 : 0.12}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <group ref={orbitGroupRef}>
        {planetBody}
      </group>
    </group>
  );
};
