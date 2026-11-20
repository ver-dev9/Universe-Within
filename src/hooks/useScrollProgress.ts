import { useEffect, useCallback } from 'react';
import { ScrollTrigger, initSmoothScroll, destroySmoothScroll, scrollToId, getLenis } from '../animations/smoothScroll';
import { SECTION_ORDER } from '../data/chapters';
import { scrollState, useCosmosStore, selectReducedMotion } from '../store/useCosmosStore';

/**
 * Drives the scroll system:
 *  - Lenis smooth scroll (disabled under reduced motion)
 *  - one ScrollTrigger per section that updates the active section only when it changes
 *  - a page-level trigger writing progress into `scrollState` (no React state)
 */
export function useScrollProgress() {
  const reducedMotion = useCosmosStore(selectReducedMotion);
  const activeSection = useCosmosStore((s) => s.activeSection);
  const setActiveSection = useCosmosStore((s) => s.setActiveSection);

  useEffect(() => {
    const lenis = initSmoothScroll(reducedMotion);

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          scrollState.progress = self.progress;
          scrollState.velocity = lenis ? lenis.velocity : self.getVelocity() / 60;
        },
      }),
    );

    SECTION_ORDER.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActiveSection(id),
          onUpdate: (self) => {
            if (self.isActive) scrollState.sectionProgress = self.progress;
          },
        }),
      );
    });

    // Fonts and lazy content change layout; re-measure once things settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      window.removeEventListener('load', refresh);
      triggers.forEach((t) => t.kill());
      destroySmoothScroll();
    };
  }, [reducedMotion, setActiveSection]);

  const scrollToSection = useCallback((sectionId: string) => scrollToId(sectionId), []);

  return { currentSectionId: activeSection, scrollToSection, getLenis };
}
