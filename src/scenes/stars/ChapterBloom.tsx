import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { QualityProfile } from '../../utils/quality';

/** Per-chapter post chain (each chapter owns its own Canvas, so its own composer). */
export const ChapterBloom: React.FC<{ profile: QualityProfile; intensity?: number }> = ({ profile, intensity = 0.9 }) => {
  if (profile.postprocessing === 'off') return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={intensity} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur />
      <Vignette eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
};

export default ChapterBloom;
