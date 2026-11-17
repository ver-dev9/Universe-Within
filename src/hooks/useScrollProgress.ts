import { useState, useEffect, useCallback } from 'react';

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentSectionId, setCurrentSectionId] = useState<string>('intro');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          const progress = totalHeight > 0 ? Math.min(Math.max(currentScroll / totalHeight, 0), 1) : 0;
          setScrollProgress(progress);

          // Detect active section based on scroll offset
          const sections = [
            'intro',
            'deep-space',
            'solar-system',
            'planet-exploration',
            'earth-special',
            'beyond-planets',
            'scale-universe',
            'discoveries',
            'final-vista'
          ];

          for (const id of sections) {
            const el = document.getElementById(id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.25) {
                setCurrentSectionId(id);
                break;
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    scrollProgress,
    currentSectionId,
    scrollToSection,
  };
}
