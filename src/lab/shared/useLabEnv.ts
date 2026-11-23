import { useCosmosStore, selectReducedMotion } from '../../store/useCosmosStore';
import { QUALITY_PROFILES } from '../../utils/quality';

/** Quality profile + reduced-motion flag every lab tool reads. */
export function useLabEnv() {
  const quality = useCosmosStore((s) => s.quality);
  const reducedMotion = useCosmosStore(selectReducedMotion);
  return { quality, profile: QUALITY_PROFILES[quality], reducedMotion };
}
