import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { QUALITY_PROFILES } from '../utils/quality';
import { useCosmosStore } from '../store/useCosmosStore';

/**
 * Post-processing chain scaled by quality tier. Bloom is threshold-based so only
 * genuinely bright emitters (the Sun, accretion disk, hot stars) glow.
 */
export const PostEffects: React.FC = () => {
  const quality = useCosmosStore((s) => s.quality);
  const mode = QUALITY_PROFILES[quality].postprocessing;
  if (mode === 'off') return null;

  if (mode === 'lite') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.95} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.75} />
      <Noise opacity={0.025} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette eskil={false} offset={0.22} darkness={0.8} />
    </EffectComposer>
  );
};
