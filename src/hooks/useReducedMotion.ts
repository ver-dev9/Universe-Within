import { useState, useEffect } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [overrideReducedMotion, setOverrideReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isReduced = overrideReducedMotion !== null ? overrideReducedMotion : prefersReducedMotion;

  const toggleReducedMotion = () => {
    setOverrideReducedMotion(prev => (prev === null ? !prefersReducedMotion : !prev));
  };

  return {
    isReducedMotion: isReduced,
    toggleReducedMotion,
  };
}
