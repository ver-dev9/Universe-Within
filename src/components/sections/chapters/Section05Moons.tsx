import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChapterCanvas, InvalidateRef } from './shared/ChapterCanvas';
import { useChapterSettings } from './shared/useChapterSettings';
import { ObjectSelector } from './shared/ObjectSelector';
import { SourceList } from './shared/SourceList';
import { MoonsScene } from '../../../scenes/moons/MoonsScene';
import { LARGEST_MOON_DIAMETER, MOONS, MoonEntry, moonDiameterKm } from '../../../data/moonsData';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#69D9EF';
const km = (n: number) => `${Math.round(n).toLocaleString('en-US')} km`;

/** True-to-scale diameters: bar length is proportional to diameter. */
function DiameterComparison({ selectedId, onSelect }: { selectedId: MoonEntry['id']; onSelect: (id: string) => void }) {
  const sorted = [...MOONS].sort((a, b) => moonDiameterKm(b) - moonDiameterKm(a));
  return (
    <figure className="mt-5">
      <figcaption className="chapter-label !tracking-[0.2em] !text-[10px] mb-2">True-to-scale diameters (≈, 2 × JPL mean radius)</figcaption>
      <ul className="space-y-1.5">
        {sorted.map((m) => {
          const d = moonDiameterKm(m);
          const active = m.id === selectedId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                aria-pressed={active}
                aria-label={`${m.name}: about ${km(d)} across`}
                className="w-full grid grid-cols-[76px_1fr_72px] items-center gap-2 text-left group"
              >
                <span className={`text-[11px] font-mono truncate ${active ? 'text-cosmos-white' : 'text-cosmos-white/65 group-hover:text-cosmos-white'}`}>
                  {m.name.replace('The ', '')}
                </span>
                <span className="h-2 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
                  <span
                    className="block h-full rounded-full transition-colors"
                    style={{ width: `${(d / LARGEST_MOON_DIAMETER) * 100}%`, background: active ? ACCENT : 'rgba(238,242,250,0.38)' }}
                  />
                </span>
                <span className={`text-[11px] font-mono text-right tabular-nums ${active ? 'text-cosmos-cyan' : 'text-cosmos-muted'}`}>≈{km(d)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/**
 * Chapter 05 — The Moons of the Solar System.
 * Pick a moon; the camera flies to it and its parent planet fades in behind.
 */
export function Section05Moons() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const entry = useRef({ progress: 0 });
  const invalidateRef: InvalidateRef = useRef(null);
  const { budget, reducedMotion } = useChapterSettings();
  const [selectedId, setSelectedId] = useState<MoonEntry['id']>('europa');
  const moon = MOONS.find((m) => m.id === selectedId) ?? MOONS[0];

  const select = useCallback((id: string) => {
    setSelectedId(id as MoonEntry['id']);
    invalidateRef.current?.();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        onUpdate: (self) => {
          entry.current.progress = self.progress;
          invalidateRef.current?.();
        },
        onLeave: () => {
          entry.current.progress = 1;
        },
      });
      if (!reducedMotion) {
        gsap.fromTo(
          '[data-moons-reveal]',
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 60%' } },
        );
      }
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (reducedMotion || !panelRef.current) return;
    const tween = gsap.fromTo(panelRef.current, { autoAlpha: 0.2, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    return () => {
      tween.kill();
    };
  }, [selectedId, reducedMotion]);

  return (
    <section
      id="moons"
      ref={sectionRef}
      aria-labelledby="moons-heading"
      className="relative h-[100svh] min-h-[700px] w-full overflow-hidden bg-cosmos-void"
    >
      <ChapterCanvas
        label={`3D view of ${moon.name} with ${moon.parent} behind it. Procedural, artistic rendering; sizes and distances are not to scale.`}
        camera={{ position: [0, 2, 20], fov: 40 }}
        invalidateRef={invalidateRef}
      >
        <MoonsScene
          moons={MOONS}
          selectedId={selectedId}
          entry={entry}
          reducedMotion={reducedMotion}
          segments={budget.sphereSegments}
          plumeParticles={budget.plumeParticles}
        />
      </ChapterCanvas>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-cosmos-void/90 via-cosmos-void/35 to-transparent" />

      <div className="relative z-10 h-full flex flex-col md:flex-row md:items-stretch gap-4 px-4 md:px-12 pt-20 md:pt-24 pb-4 md:pb-10 pointer-events-none">
        <div className="flex flex-col min-h-0 w-full md:w-[440px] lg:w-[480px] md:h-full gap-4">
          <header data-moons-reveal className="readable pointer-events-auto">
            <p className="chapter-label mb-2">
              <span className="text-cosmos-cyan">Chapter 05</span> · Ice, fire &amp; hidden oceans
            </p>
            <h2 id="moons-heading" className="cinematic-heading text-cosmos-white !text-[clamp(2.4rem,5.5vw,4.75rem)]">
              The <em className="text-cosmos-cyan">Moons</em>
            </h2>
          </header>
          <div data-moons-reveal className="pointer-events-auto">
            <ObjectSelector
              items={MOONS.map((m) => ({ id: m.id, label: m.name.replace('The ', ''), sublabel: `moon of ${m.parent}` }))}
              selectedId={selectedId}
              onSelect={select}
              idPrefix="moons"
              ariaLabel="Choose a moon to visit"
              accent={ACCENT}
            />
          </div>
          <div className="flex-1 md:hidden min-h-[20svh]" aria-hidden="true" />
          <div
            data-moons-reveal
            id="moons-panel"
            role="tabpanel"
            aria-labelledby={`moons-tab-${moon.id}`}
            className="glass-panel rounded-2xl pointer-events-auto min-h-0 max-h-[44svh] md:max-h-none md:flex-1 overflow-y-auto overscroll-contain"
            data-lenis-prevent
            tabIndex={0}
          >
            <div ref={panelRef} className="p-5 md:p-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cosmos-cyan">Moon of {moon.parent}</p>
              <h3 className="font-display text-3xl md:text-4xl text-cosmos-white mt-1" aria-live="polite">
                {moon.name}
              </h3>
              <p className="text-sm text-cosmos-white/80 mt-1">{moon.tagline}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-cosmos-muted">Diameter</dt>
                  <dd className="text-sm md:text-base text-cosmos-white font-heading">
                    <span aria-label="approximately">≈ </span>
                    {km(moonDiameterKm(moon))}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-cosmos-muted">Mean density</dt>
                  <dd className="text-sm md:text-base text-cosmos-white font-heading">{moon.densityGcm3} g/cm³</dd>
                </div>
              </dl>
              <h4 className="chapter-label !tracking-[0.2em] !text-[10px] mt-5 mb-1">Key traits</h4>
              <ul className="space-y-1 text-[13px] text-cosmos-white/85 list-disc pl-4 marker:text-cosmos-muted">
                {moon.traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <h4 className="chapter-label !tracking-[0.2em] !text-[10px] mt-4 mb-1">Exploration</h4>
              <p className="text-[13px] leading-relaxed text-cosmos-white/85">{moon.exploration}</p>
              <p className="mt-2 text-[11px] font-mono text-cosmos-white/60">Missions: {moon.missions.join(' · ')}</p>
              <DiameterComparison selectedId={moon.id} onSelect={select} />
              <p className="mt-4 text-[10px] font-mono text-cosmos-gold/90">Visual: {moon.visualNote}</p>
              <SourceList className="mt-1" sources={moon.sources} />
            </div>
          </div>
        </div>
      </div>

      <p className="absolute z-10 top-20 md:top-auto md:bottom-6 right-4 md:right-8 text-[10px] font-mono uppercase tracking-[0.2em] text-cosmos-white/80 bg-cosmos-void/70 border border-white/15 rounded-full px-3 py-1">
        3D sizes not to scale
      </p>
    </section>
  );
}

export default Section05Moons;
