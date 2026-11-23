import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { LAB_TOOLS, type LabToolId } from '../data/labData';
import { LabVisibleContext } from './shared/LabCanvas';
import { cx } from './shared/LabUI';

/*
 * Each tool is its own chunk. Only the active tool is mounted, so at most one
 * WebGL canvas exists in the lab at any time; switching tools unmounts the
 * previous Canvas (R3F disposes its scene and loses the context).
 */
const TOOLS: Record<LabToolId, React.LazyExoticComponent<React.FC>> = {
  'planet-explorer': lazy(() => import('./planet-explorer/PlanetExplorer')),
  'solar-system': lazy(() => import('./solar-system/SolarSystemExplorer')),
  'scale-comparison': lazy(() => import('./scale-comparison/ScaleComparison')),
  'stellar-explorer': lazy(() => import('./stellar-explorer/StellarExplorer')),
  'black-hole': lazy(() => import('./black-hole/BlackHoleExplorer')),
  'cosmic-distance': lazy(() => import('./cosmic-distance/CosmicDistanceExplorer')),
};

const ToolFallback: React.FC<{ name: string }> = ({ name }) => (
  <div className="grid h-[56vh] min-h-[340px] place-items-center rounded-2xl border border-white/10 bg-cosmos-deep lg:h-[min(72vh,760px)]" role="status">
    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cosmos-muted">Loading {name}…</p>
  </div>
);

/** Fires once the section is near the viewport, and reports whether it is on screen now. */
function useNearViewport<T extends Element>(ref: React.RefObject<T>) {
  const [state, setState] = useState({ near: false, visible: false });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setState({ near: true, visible: true });
      return;
    }
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setState((s) => ({ ...s, near: true })), { rootMargin: '600px 0px' });
    const vis = new IntersectionObserver(([e]) => setState((s) => ({ ...s, visible: e.isIntersecting })), { rootMargin: '0px' });
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, [ref]);
  return state;
}

export function CosmicLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<LabToolId>('planet-explorer');
  const { near, visible } = useNearViewport(sectionRef);
  const activeIndex = LAB_TOOLS.findIndex((t) => t.id === active);
  const Tool = TOOLS[active];
  const meta = LAB_TOOLS[activeIndex];

  const focusTab = (i: number) => {
    const n = LAB_TOOLS.length;
    const idx = (i + n) % n;
    setActive(LAB_TOOLS[idx].id);
    tabRefs.current[idx]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); focusTab(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); focusTab(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusTab(0); }
    else if (e.key === 'End') { e.preventDefault(); focusTab(LAB_TOOLS.length - 1); }
  };

  return (
    <section
      id="cosmic-lab"
      ref={sectionRef}
      aria-labelledby="cosmic-lab-heading"
      className="pointer-events-auto relative w-full bg-cosmos-void px-4 pb-20 pt-24 md:px-12"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cosmos-deep/80 to-transparent" />
      <div className="relative mx-auto max-w-[1400px]">
        <header className="readable max-w-3xl">
          <p className="chapter-label mb-2">
            <span className="text-cosmos-cyan">Cosmic Lab</span> · Hands-on science
          </p>
          <h2 id="cosmic-lab-heading" className="cinematic-heading text-cosmos-white !text-[clamp(2.4rem,5.5vw,4.75rem)]">
            The Cosmic <em className="text-cosmos-cyan">Lab</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-cosmos-muted">
            Six instruments built on real data from NASA, ESA and the research literature. Change a value and the physics answers live. Every tool
            cites its sources; numbers marked ≈ are estimates.
          </p>
        </header>

        <div role="tablist" aria-label="Cosmic Lab tools" aria-orientation="horizontal" className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {LAB_TOOLS.map((t, i) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[i] = el)}
                id={`lab-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="lab-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cx(
                  'group flex flex-col rounded-xl border px-3 py-3 text-left transition-colors',
                  selected ? 'border-cosmos-cyan/70 bg-cosmos-cyan/[0.08]' : 'border-white/10 bg-cosmos-deep/60 hover:border-white/30',
                )}
              >
                <span className={cx('font-mono text-[10px] tracking-[0.25em]', selected ? 'text-cosmos-cyan' : 'text-cosmos-muted')}>{t.index}</span>
                <span className={cx('mt-1 font-display text-lg leading-tight', selected ? 'text-cosmos-white' : 'text-cosmos-white/80 group-hover:text-cosmos-white')}>
                  {t.name}
                </span>
                <span className="mt-1 hidden text-xs leading-snug text-cosmos-muted sm:block">{t.blurb}</span>
              </button>
            );
          })}
        </div>

        <div id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${active}`} tabIndex={-1} className="mt-6 focus:outline-none">
          <LabVisibleContext.Provider value={visible}>
            {near ? (
              <Suspense fallback={<ToolFallback name={meta.name} />}>
                <Tool key={active} />
              </Suspense>
            ) : (
              <ToolFallback name={meta.name} />
            )}
          </LabVisibleContext.Provider>
        </div>
      </div>
    </section>
  );
}

export default CosmicLab;
