import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCosmosStore, selectReducedMotion } from '../../store/useCosmosStore';

/**
 * Subtle ring cursor for fine-pointer desktops. The native cursor stays visible
 * (we never hide it), so accessibility and text selection are unaffected.
 */
export const CustomCursor: React.FC = () => {
  const reducedMotion = useCosmosStore(selectReducedMotion);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    setEnabled(mq.matches && !reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const ring = ringRef.current;
    if (!enabled || !ring) return;
    const xTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest('button, a, input, [role="button"], canvas');
      ring.dataset.hover = interactive ? 'true' : 'false';
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={ringRef} className="cosmic-cursor" aria-hidden="true" />;
};
