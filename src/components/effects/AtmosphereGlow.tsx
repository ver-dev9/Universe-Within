import React, { useEffect, useMemo } from 'react';
import { createAtmosphereMaterial } from '../../shaders/atmosphereShader';

interface AtmosphereGlowProps {
  radius: number;
  color: string;
  intensity?: number;
  power?: number;
}

export const AtmosphereGlow: React.FC<AtmosphereGlowProps> = ({
  radius,
  color,
  intensity = 1.3,
  power = 3.2,
}) => {
  const mat = useMemo(() => createAtmosphereMaterial(color, intensity, power), [color, intensity, power]);
  // Created outside JSX, so R3F will not dispose it for us.
  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh>
      <sphereGeometry args={[radius * 1.15, 32, 32]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};
