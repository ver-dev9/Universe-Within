import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChapterCanvas, InvalidateRef } from './shared/ChapterCanvas';
import { useChapterSettings } from './shared/useChapterSettings';
import { ObjectSelector } from './shared/ObjectSelector';
import { SourceList } from './shared/SourceList';
import { WorldsScene } from '../../../scenes/worlds/WorldsScene';
import { WORLDS, WorldEntry } from '../../../data/worldsData';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#3478D4';
const ACCENT_TEXT = '#7FB0F0';

/**
 * Chapter 04 — Worlds Beyond Earth.
 * Pick a world; the camera flies to it and the panel shows sourced facts.
 */
export function Section04Worlds() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const entry = useRef({ progress: 0 });
  const invalidateRef: InvalidateRef = useRef(null);
  const { budget, reducedMotion } = useChapterSettings();
  const [selectedId, setSelectedId] = useState<WorldEntry['id']>('mars');
  const world = WORLDS.find((w) => w.id === selectedId) ?? WORLDS[0];

  const select = useCallback((id: string) => {
    setSelectedId(id as WorldEntry['id']);
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
          '[data-worlds-reveal]',
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 60%' } },
        );
      }
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  // Fade the panel content when switching objects (skipped under reduced motion).
  useLayoutEffect(() => {
    if (reducedMotion || !panelRef.current) return;
    const tween = gsap.fromTo(panelRef.current, { autoAlpha: 0.2, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    return () => {
      tween.kill();
    };
  }, [selectedId, reducedMotion]);

  return (
    <section
      id="worlds"
      ref={sectionRef}
      aria-labelledby="worlds-heading"
      className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-cosmos-void"
    >
      <ChapterCanvas
        label={`3D view of ${world.name}. Procedural, artistic rendering; sizes and distances are not to scale.`}
        camera={{ position: [0, 2, 20], fov: 40 }}
        invalidateRef={invalidateRef}
      >
        <WorldsScene
          worlds={WORLDS}
          selectedId={selectedId}
          entry={entry}
          reducedMotion={reducedMotion}
          segments={budget.sphereSegments}
          beltRocks={budget.beltRocks}
          tailParticles={budget.tailParticles}
        />
      </ChapterCanvas>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-cosmos-void/90 via-cosmos-void/35 to-transparent" />

      <div className="relative z-10 h-full flex flex-col md:flex-row md:items-stretch gap-4 px-4 md:px-12 pt-20 md:pt-24 pb-4 md:pb-10 pointer-events-none">
        <div className="flex flex-col min-h-0 w-full md:w-[440px] lg:w-[480px] md:h-full gap-4">
          <header data-worlds-reveal className="readable pointer-events-auto">
            <p className="chapter-label mb-2">
              <span style={{ color: ACCENT_TEXT }}>Chapter 04</span> · Rocky worlds &amp; small bodies
            </p>
            <h2 id="worlds-heading" className="cinematic-heading text-cosmos-white !text-[clamp(2.4rem,5.5vw,4.75rem)]">
              Worlds Beyond <em style={{ color: ACCENT_TEXT }}>Earth</em>
            </h2>
          </header>
          <div data-worlds-reveal className="pointer-events-auto">
            <ObjectSelector
              items={WORLDS.map((w) => ({ id: w.id, label: w.name, sublabel: w.kindLabel }))}
              selectedId={selectedId}
              onSelect={select}
              idPrefix="worlds"
              ariaLabel="Choose a world to visit"
              accent={ACCENT_TEXT}
            />
          </div>
          {/* Spacer so the 3D object is visible on narrow screens */}
          <div className="flex-1 md:hidden min-h-[22svh]" aria-hidden="true" />
          <div
            data-worlds-reveal
            id="worlds-panel"
            role="tabpanel"
            aria-labelledby={`worlds-tab-${world.id}`}
            className="glass-panel rounded-2xl pointer-events-auto min-h-0 max-h-[44svh] md:max-h-none md:flex-1 overflow-y-auto overscroll-contain"
            data-lenis-prevent
            tabIndex={0}
          >
            <div ref={panelRef} className="p-5 md:p-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: ACCENT_TEXT }}>
                {world.kindLabel}
              </p>
              <h3 className="font-display text-3xl md:text-4xl text-cosmos-white mt-1" aria-live="polite">
                {world.name}
              </h3>
              <p className="text-sm text-cosmos-white/80 mt-1">{world.tagline}</p>
              {world.illustrative && (
                <p className="mt-2 text-[11px] font-mono text-cosmos-gold">Illustrative body — not a model of a specific object.</p>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                {world.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-cosmos-muted">{s.label}</dt>
                    <dd className="text-sm md:text-base text-cosmos-white font-heading">
                      {s.approx && <span aria-label="approximately">≈ </span>}
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 space-y-3 text-[13px] leading-relaxed text-cosmos-white/85">
                <p>
                  <span className="chapter-label !tracking-[0.2em] !text-[10px] block mb-0.5">Surface</span>
                  {world.surface}
                </p>
                <p>
                  <span className="chapter-label !tracking-[0.2em] !text-[10px] block mb-0.5">Atmosphere</span>
                  {world.atmosphere}
                </p>
                <p>
                  <span className="chapter-label !tracking-[0.2em] !text-[10px] block mb-0.5">Interior &amp; geology</span>
                  {world.geology}
                </p>
              </div>
              <h4 className="chapter-label !tracking-[0.2em] !text-[10px] mt-5 mb-1">Missions</h4>
              <ul className="space-y-1 text-[13px] text-cosmos-white/85 list-disc pl-4 marker:text-cosmos-muted">
                {world.missions.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <h4 className="chapter-label !tracking-[0.2em] !text-[10px] mt-4 mb-1">Discoveries</h4>
              <ul className="space-y-1 text-[13px] text-cosmos-white/85 list-disc pl-4 marker:text-cosmos-muted">
                {world.discoveries.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="mt-4 text-[10px] font-mono text-cosmos-muted">≈ marks approximate or derived values.</p>
              <SourceList className="mt-1" sources={world.sources} />
            </div>
          </div>
        </div>
      </div>

      <p className="absolute z-10 top-20 md:top-auto md:bottom-6 right-4 md:right-8 text-[10px] font-mono uppercase tracking-[0.2em] text-cosmos-white/80 bg-cosmos-void/70 border border-white/15 rounded-full px-3 py-1">
        Not to scale · procedural surfaces
      </p>
    </section>
  );
}

export default Section04Worlds;
