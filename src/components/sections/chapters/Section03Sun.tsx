import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChapterCanvas, InvalidateRef } from './shared/ChapterCanvas';
import { useChapterSettings } from './shared/useChapterSettings';
import { SourceList } from './shared/SourceList';
import { SunScene } from '../../../scenes/sun/SunScene';
import { PP_CHAIN_STEPS, SUN_ARTISTIC_DISCLAIMER, SUN_KEY_FACTS, SUN_SOURCES, SUN_STORY } from '../../../data/sunData';

gsap.registerPlugin(ScrollTrigger);

const DETAIL = { high: 1, medium: 0.65, low: 0.3 } as const;
const STORY_ORDER = ['fusion', 'surface', 'sunspots', 'eruptions'] as const;

/**
 * Chapter 03 — The Power of the Sun.
 * A sticky WebGL canvas behind scrolling story cards. Scroll progress through
 * the section scrubs the camera from a distant star to the edge of the limb.
 */
export function Section03Sun() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrub = useRef({ progress: 0 });
  const invalidateRef: InvalidateRef = useRef(null);
  const { budget, quality, reducedMotion } = useChapterSettings();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrub.current.progress = self.progress;
          invalidateRef.current?.();
        },
      });
      if (!reducedMotion) {
        gsap.utils.toArray<HTMLElement>('[data-sun-card]').forEach((card) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 48 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
            },
          );
        });
      }
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="sun" ref={sectionRef} aria-labelledby="sun-heading" className="relative bg-cosmos-void" style={{ height: '520vh' }}>
      {/* Sticky 3D stage */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <ChapterCanvas
          label="Artistic 3D visualisation of the Sun: a granulated photosphere with sunspots, glowing corona, magnetic prominence loops and streaming particles."
          camera={{ position: [0, 0.3, 12], fov: 40 }}
          invalidateRef={invalidateRef}
        >
          <SunScene
            scrub={scrub}
            reducedMotion={reducedMotion}
            segments={budget.sphereSegments}
            particles={budget.sunParticles}
            prominences={budget.prominences}
            detail={DETAIL[quality]}
            bloom={budget.bloom}
          />
        </ChapterCanvas>
        {/* Legibility gradient on the text side */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-cosmos-void/85 via-cosmos-void/30 to-transparent" />
        <p className="absolute bottom-4 right-4 left-4 md:left-auto md:max-w-sm text-[10px] leading-relaxed font-mono text-cosmos-white/75 bg-cosmos-void/70 border border-white/10 rounded-md px-3 py-2 backdrop-blur-sm">
          <span className="text-cosmos-gold uppercase tracking-[0.2em] mr-1">Artistic effects</span>
          {SUN_ARTISTIC_DISCLAIMER}
        </p>
      </div>

      {/* Scrolling story layer */}
      <div className="relative -mt-[100svh] z-10 pointer-events-none">
        {/* Opening */}
        <div className="min-h-[100svh] flex items-end md:items-center px-6 md:px-16 pb-28 md:pb-0">
          <header data-sun-card className="max-w-2xl pointer-events-auto readable">
            <p className="chapter-label mb-5">
              <span className="text-cosmos-gold">Chapter 03</span> · Our star
            </p>
            <h2 id="sun-heading" className="cinematic-heading text-cosmos-white">
              The Power <em className="text-cosmos-gold">of the Sun</em>
            </h2>
            <p className="mt-6 text-base md:text-lg text-cosmos-white/85 max-w-xl leading-relaxed">
              A 4.6-billion-year-old ball of hot plasma that holds the solar system together and powers almost every living
              thing on Earth.
            </p>
            <p className="mt-6 chapter-label" aria-hidden="true">
              Scroll to approach ↓
            </p>
          </header>
        </div>

        {/* Key facts */}
        <div className="min-h-[100svh] flex items-center px-6 md:px-16 py-24">
          <div data-sun-card className="glass-panel rounded-2xl p-6 md:p-8 max-w-xl w-full pointer-events-auto">
            <p className="chapter-label mb-4">By the numbers</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              {SUN_KEY_FACTS.map((f) => (
                <div key={f.label}>
                  <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-cosmos-muted">{f.label}</dt>
                  <dd className="mt-1 font-heading text-xl md:text-2xl text-cosmos-white">
                    {f.value}
                    {f.approx && (
                      <span className="sr-only"> (approximate)</span>
                    )}
                  </dd>
                  {f.note && <dd className="mt-0.5 text-[11px] text-cosmos-white/60 leading-snug">{f.note}</dd>}
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[10px] font-mono text-cosmos-muted">“~” marks values the source gives as approximate.</p>
            <SourceList className="mt-2" sources={[SUN_SOURCES.nasaFacts, SUN_SOURCES.nssdc]} />
          </div>
        </div>

        {/* Story cards */}
        {STORY_ORDER.map((key) => {
          const s = SUN_STORY[key];
          return (
            <div key={key} className="min-h-[90svh] flex items-center px-6 md:px-16 py-20">
              <article data-sun-card className="glass-panel rounded-2xl p-6 md:p-8 max-w-lg w-full pointer-events-auto">
                <p className="chapter-label mb-3 !text-cosmos-gold">{s.kicker}</p>
                <h3 className="font-display text-3xl md:text-4xl text-cosmos-white leading-tight">{s.title}</h3>
                <p className="mt-4 text-sm md:text-[15px] text-cosmos-white/85 leading-relaxed">{s.body}</p>
                {key === 'fusion' && (
                  <ol className="mt-5 space-y-2 border-l border-cosmos-gold/40 pl-4">
                    {PP_CHAIN_STEPS.map((p) => (
                      <li key={p.step}>
                        <p className="font-mono text-sm text-cosmos-gold">{p.step}</p>
                        <p className="text-xs text-cosmos-white/70">{p.detail}</p>
                      </li>
                    ))}
                  </ol>
                )}
                <SourceList
                  className="mt-5"
                  sources={key === 'fusion' ? [s.source, SUN_SOURCES.msfcInterior] : key === 'sunspots' ? [s.source, SUN_SOURCES.nssdc] : [s.source]}
                />
              </article>
            </div>
          );
        })}
        <div className="h-[30svh]" aria-hidden="true" />
      </div>
    </section>
  );
}

export default Section03Sun;
