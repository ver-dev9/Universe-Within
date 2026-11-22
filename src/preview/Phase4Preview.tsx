import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Section03Sun, Section04Worlds, Section05Moons } from '../components/sections/chapters';
import { useCosmosStore } from '../store/useCosmosStore';
import { QualityLevel } from '../utils/quality';
import '../styles/index.css';

/**
 * Standalone preview for the Phase 4 chapters (removed at merge).
 * Query params: ?q=high|medium|low  &rm=1 (force reduced motion)
 */
const params = new URLSearchParams(window.location.search);
const q = params.get('q');
if (q === 'high' || q === 'medium' || q === 'low') useCosmosStore.getState().setQuality(q as QualityLevel, true);
if (params.get('rm') === '1' && !(useCosmosStore.getState().reducedMotionOverride ?? useCosmosStore.getState().systemReducedMotion)) {
  useCosmosStore.getState().toggleReducedMotion();
}

function Phase4Preview() {
  const quality = useCosmosStore((s) => s.quality);
  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);
  return (
    <main className="relative min-h-screen bg-cosmos-void text-cosmos-white">
      <div className="h-[40vh] flex items-center justify-center chapter-label">Phase 4 preview · quality {quality} · scroll ↓</div>
      <Section03Sun />
      <Section04Worlds />
      <Section05Moons />
      <div className="h-[40vh]" />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Phase4Preview />
  </React.StrictMode>,
);
