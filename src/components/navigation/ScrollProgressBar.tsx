import React, { useCallback, useRef } from 'react';
import { useScrollValue } from '../../hooks/useScrollValue';

/** Thin page-progress line. Updated off the React render path. */
export const ScrollProgressBar: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const apply = useCallback((el: HTMLDivElement, p: number) => {
    el.style.transform = `scaleX(${p})`;
    el.parentElement?.setAttribute('aria-valuenow', String(Math.round(p * 100)));
  }, []);
  useScrollValue(barRef, apply);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-white/5"
      role="progressbar"
      aria-label="Journey progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-cosmos-blue via-cosmos-cyan to-cosmos-gold"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};
