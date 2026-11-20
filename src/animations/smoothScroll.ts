import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

/**
 * Creates the single Lenis instance and wires it to GSAP's ticker so Lenis and
 * ScrollTrigger share one clock (no double rAF loops, no drift).
 */
export function initSmoothScroll(reducedMotion: boolean): Lenis | null {
  destroySmoothScroll();
  if (reducedMotion) {
    // Native scrolling for motion-sensitive visitors; ScrollTrigger still works.
    ScrollTrigger.refresh();
    return null;
  }

  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();
  return lenis;
}

export function destroySmoothScroll() {
  if (tick) gsap.ticker.remove(tick);
  tick = null;
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

/** Scroll to a section by DOM id, using Lenis when active. */
export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: immediate ? 0 : 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), immediate });
  } else {
    el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }
  // Move keyboard focus to the section for screen-reader and keyboard users.
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

export { gsap, ScrollTrigger };
