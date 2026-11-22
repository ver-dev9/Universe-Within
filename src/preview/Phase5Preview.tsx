import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/index.css';
import { Section06Stars, Section06StarsElements, Section07Nebulae } from '../components/sections/chapters/index-phase5';
import { initSmoothScroll, destroySmoothScroll } from '../animations/smoothScroll';
import { useCosmosStore, selectReducedMotion } from '../store/useCosmosStore';
import { QualityLevel } from '../utils/quality';

/**
 * TEMPORARY preview harness for Phase 5 — renders Chapter 06 and 07 stacked.
 * Query params: ?quality=low|medium|high  &reduced=1  (for headless checks).
 * Delete once the chapters are wired into App.tsx.
 */
const params = new URLSearchParams(window.location.search);
const q = params.get('quality') as QualityLevel | null;
if (q === 'low' || q === 'medium' || q === 'high') useCosmosStore.getState().setQuality(q, true);
if (params.get('reduced') === '1') useCosmosStore.setState({ reducedMotionOverride: true });

const Phase5Preview: React.FC = () => {
  const reduced = useCosmosStore(selectReducedMotion);
  useEffect(() => {
    initSmoothScroll(reduced || params.get('lenis') === '0');
    return () => destroySmoothScroll();
  }, [reduced]);
  return (
    <main className="bg-cosmos-void text-cosmos-white">
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="chapter-label">Phase 5 preview</p>
        <p className="font-display text-4xl">Scroll ↓</p>
      </div>
      <Section06Stars />
      <Section06StarsElements />
      <Section07Nebulae />
      <div className="h-[50vh]" />
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Phase5Preview />
  </React.StrictMode>,
);
