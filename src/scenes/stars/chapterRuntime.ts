import { useEffect, useState, RefObject } from 'react';
import { useCosmosStore, selectReducedMotion } from '../../store/useCosmosStore';
import { QUALITY_PROFILES, QualityProfile, QualityLevel } from '../../utils/quality';
import { getLenis } from '../../animations/smoothScroll';

/**
 * Shared runtime helpers for self-contained chapter canvases (Phase 5).
 * Chapter 07 imports these too, so both chapters lazy-mount and scale the same way.
 */

/** True while `ref` is within (or near, via rootMargin) the viewport. */
export function useInViewport(ref: RefObject<Element>, rootMargin = '25% 0px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

export function useChapterQuality(): { level: QualityLevel; profile: QualityProfile; reducedMotion: boolean } {
  const level = useCosmosStore((s) => s.quality);
  const reducedMotion = useCosmosStore(selectReducedMotion);
  return { level, profile: QUALITY_PROFILES[level], reducedMotion };
}

/** Particle budget scaled by the quality tier. */
export const scaled = (base: number, profile: QualityProfile) => Math.max(64, Math.round(base * profile.nebulaParticles));

/**
 * Scroll so that a pinned chapter shows the given 0..1 progress.
 * Uses Lenis when active, native scrolling otherwise (e.g. reduced motion).
 */
export function scrollSectionToProgress(section: HTMLElement | null, progress: number, reducedMotion: boolean) {
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY;
  const range = Math.max(0, section.offsetHeight - window.innerHeight);
  const y = top + range * Math.min(1, Math.max(0, progress));
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { duration: reducedMotion ? 0 : 1.4, immediate: reducedMotion });
  else window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' });
}

/** Mutable progress box shared between GSAP (writer) and useFrame (reader) — no React re-renders. */
export interface ProgressBox {
  current: number;
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
