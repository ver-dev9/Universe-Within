import { useCosmosStore, selectReducedMotion } from '../../../../store/useCosmosStore';
import { QUALITY_PROFILES, QualityLevel } from '../../../../utils/quality';

/** Per-quality budgets for the Phase 4 chapter scenes. */
export const CHAPTER_BUDGETS: Record<
  QualityLevel,
  { sphereSegments: number; sunParticles: number; prominences: number; beltRocks: number; tailParticles: number; plumeParticles: number; bloom: boolean }
> = {
  high: { sphereSegments: 128, sunParticles: 2600, prominences: 9, beltRocks: 700, tailParticles: 2400, plumeParticles: 1400, bloom: true },
  medium: { sphereSegments: 96, sunParticles: 1500, prominences: 6, beltRocks: 380, tailParticles: 1400, plumeParticles: 800, bloom: false },
  low: { sphereSegments: 56, sunParticles: 600, prominences: 4, beltRocks: 160, tailParticles: 600, plumeParticles: 350, bloom: false },
};

export function useChapterSettings() {
  const quality = useCosmosStore((s) => s.quality);
  const reducedMotion = useCosmosStore(selectReducedMotion);
  return {
    quality,
    reducedMotion,
    profile: QUALITY_PROFILES[quality],
    budget: CHAPTER_BUDGETS[quality],
  };
}
