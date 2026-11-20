import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';
import { scrollState } from '../store/useCosmosStore';

/**
 * Writes a scroll-derived value straight into a DOM node on GSAP's ticker,
 * bypassing React so progress UI updates at 60fps without re-rendering.
 */
export function useScrollValue<T extends HTMLElement>(
  ref: RefObject<T>,
  apply: (el: T, progress: number) => void,
) {
  useEffect(() => {
    let last = -1;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const p = Math.round(scrollState.progress * 1000) / 1000;
      if (p !== last) {
        last = p;
        apply(el, p);
      }
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [ref, apply]);
}
