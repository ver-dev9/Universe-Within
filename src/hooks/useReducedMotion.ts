import { useEffect } from 'react';
import { useCosmosStore, selectReducedMotion } from '../store/useCosmosStore';

/** Follows the OS reduced-motion setting; the visitor can override it from the navbar. */
export function useReducedMotion() {
  const isReducedMotion = useCosmosStore(selectReducedMotion);
  const toggleReducedMotion = useCosmosStore((s) => s.toggleReducedMotion);
  const setSystemReducedMotion = useCosmosStore((s) => s.setSystemReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setSystemReducedMotion]);

  return { isReducedMotion, toggleReducedMotion };
}
