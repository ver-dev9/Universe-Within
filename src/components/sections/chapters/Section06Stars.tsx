import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap, ScrollTrigger } from '../../../animations/smoothScroll';
import {
  STAR_STAGES,
  MASS_OPTIONS,
  ELEMENT_FACTS,
  STAR_VISUAL_KEYS,
  MassPath,
  stageFromProgress,
} from '../../../data/starsData';
import { blackbodyCss } from '../../../shaders/phase5Noise';
import {
  useInViewport,
  useChapterQuality,
  scrollSectionToProgress,
  ProgressBox,
} from '../../../scenes/stars/chapterRuntime';

const StarLifecycleScene = lazy(() => import('../../../scenes/stars/StarLifecycleScene'));
const ChapterBloom = lazy(() => import('../../../scenes/stars/ChapterBloom'));

/** Elements built in stellar cores, in order; how far a star gets depends on its mass. */
const FUSION_CHAIN = ['H', 'He', 'C', 'O · Ne · Mg', 'Si', 'Fe'];

function fusionReach(stage: number, mass: MassPath): number {
  if (stage < 2) return -1; // no fusion yet in clouds / protostars
  if (stage === 2) return 1; // H → He
  if (mass === 'low') return 2; // He → C in the giant core
  return stage >= 3 ? 5 : 1; // massive stars: up to iron
}

const STAGE_SPAN = 1 / STAR_STAGES.length;

export const Section06Stars: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef<ProgressBox>({ current: 0 }).current;
  const [stage, setStage] = useState(0);
  const [mass, setMass] = useState<MassPath>('low');
  const { profile, reducedMotion } = useChapterQuality();
  const inView = useInViewport(sectionRef);

  // Scroll-scrubbed timeline. GSAP writes the progress box; the scene reads it per frame.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const proxy = { p: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reducedMotion ? true : 0.8,
          onUpdate: (self) => {
            const s = stageFromProgress(self.progress);
            setStage((prev) => (prev === s ? prev : s));
          },
        },
      });
      tl.to(proxy, {
        p: 1,
        ease: 'none',
        onUpdate: () => {
          progress.current = proxy.p;
        },
      });
      // Gentle reveal of the intro copy as the chapter starts.
      if (!reducedMotion) {
        gsap.from(section.querySelectorAll('[data-s06-reveal]'), {
          opacity: 0,
          y: 24,
          stagger: 0.08,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%' },
        });
      }
    }, section);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [progress, reducedMotion]);

  const current = STAR_STAGES[stage];
  const body = current.byMass?.[mass] ?? current.body;
  const massOpt = MASS_OPTIONS.find((m) => m.id === mass)!;
  const reach = fusionReach(stage, mass);
  const temp = STAR_VISUAL_KEYS[mass][stage].temp;
  const tempPos = useMemo(() => Math.min(1, Math.max(0, (Math.log(temp) - Math.log(2000)) / (Math.log(40000) - Math.log(2000)))), [temp]);
  const remnantHidden = mass === 'veryHigh' && stage === 5;

  const goToStage = useCallback(
    (i: number) => scrollSectionToProgress(sectionRef.current, (i + 0.5) * STAGE_SPAN, reducedMotion),
    [reducedMotion],
  );

  const onMassKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = MASS_OPTIONS.findIndex((m) => m.id === mass);
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % MASS_OPTIONS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + MASS_OPTIONS.length) % MASS_OPTIONS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = MASS_OPTIONS.length - 1;
    else return;
    e.preventDefault();
    setMass(MASS_OPTIONS[next].id);
    const btn = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next];
    btn?.focus();
  };

  return (
    <section
      id="stars"
      ref={sectionRef}
      aria-labelledby="stars-heading"
      className="relative bg-cosmos-void"
      style={{ height: `${STAR_STAGES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D layer — mounted only while the chapter is near the viewport. */}
        <div className="absolute inset-0" aria-hidden="true">
          {inView && (
            <Canvas
              dpr={profile.dpr}
              gl={{ antialias: profile.antialias, powerPreference: 'high-performance', alpha: false }}
              camera={{ position: [0, 1.5, 12], fov: 45, near: 0.05, far: 200 }}
            >
              <Suspense fallback={null}>
                <StarLifecycleScene progress={progress} mass={mass} profile={profile} reducedMotion={reducedMotion} />
                <ChapterBloom profile={profile} intensity={1.0} />
              </Suspense>
            </Canvas>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cosmos-void/90 via-cosmos-void/40 to-transparent" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            // Eased multi-stop fade: a plain two-stop gradient leaves a visible band at its top edge.
            background:
              'linear-gradient(to top, rgba(3,4,10,0.88) 0%, rgba(3,4,10,0.62) 22%, rgba(3,4,10,0.34) 45%, rgba(3,4,10,0.13) 68%, rgba(3,4,10,0.03) 86%, rgba(3,4,10,0) 100%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-20 sm:px-10 lg:px-16">
          <header className="max-w-2xl">
            <p className="chapter-label" data-s06-reveal>
              Chapter 06
            </p>
            <h2
              id="stars-heading"
              className="cinematic-heading readable mt-2 text-cosmos-white"
              style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4.6rem)' }}
              data-s06-reveal
            >
              The Life and Death of Stars
            </h2>
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,26rem)_1fr_minmax(0,18rem)] lg:items-end">
            {/* Stage narrative */}
            <article
              className="readable rounded-2xl border border-white/10 bg-cosmos-void/70 p-5 backdrop-blur-md"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cosmos-gold">
                Stage {stage + 1} / {STAR_STAGES.length} · {current.kicker}
              </p>
              <h3 className="mt-2 font-display text-3xl text-cosmos-white sm:text-4xl">{current.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-cosmos-white/90 sm:text-[15px]">{body}</p>

              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cosmos-muted">Core fusion so far</p>
                <ol className="mt-2 flex flex-wrap gap-1.5" aria-label="Elements fused in the core">
                  {FUSION_CHAIN.map((el, i) => {
                    const on = i <= reach;
                    return (
                      <li
                        key={el}
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-colors ${
                          on
                            ? 'border-cosmos-gold/70 bg-cosmos-gold/15 text-cosmos-gold'
                            : 'border-white/10 text-cosmos-muted/70'
                        }`}
                      >
                        <span className="sr-only">{on ? 'fused: ' : 'not reached: '}</span>
                        {el}
                      </li>
                    );
                  })}
                </ol>
              </div>
              <a
                href={current.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-cosmos-cyan underline-offset-4 hover:underline"
              >
                Source: NASA Science
              </a>
              {current.alsoSourceUrl && mass !== 'low' && (
                <a
                  href={current.alsoSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-cosmos-cyan underline-offset-4 hover:underline"
                >
                  + NASA (neutron stars)
                </a>
              )}
            </article>

            <div className="hidden lg:block" />

            {/* Controls */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-cosmos-void/70 p-5 backdrop-blur-md">
              <div>
                <p id="s06-mass-label" className="font-mono text-[10px] uppercase tracking-[0.3em] text-cosmos-muted">
                  Starting mass
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby="s06-mass-label"
                  className="mt-2 grid gap-1.5"
                  onKeyDown={onMassKey}
                >
                  {MASS_OPTIONS.map((m) => {
                    const checked = m.id === mass;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        tabIndex={checked ? 0 : -1}
                        onClick={() => setMass(m.id)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          checked
                            ? 'border-cosmos-gold/70 bg-cosmos-gold/10 text-cosmos-white'
                            : 'border-white/10 text-cosmos-muted hover:border-white/30 hover:text-cosmos-white'
                        }`}
                      >
                        <span className="font-body">{m.label}</span>
                        <span className="font-mono text-[10px] text-cosmos-gold/90">{m.short}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 font-body text-xs leading-relaxed text-cosmos-muted">
                  {massOpt.description}{' '}
                  <a href={massOpt.sourceUrl} target="_blank" rel="noreferrer" className="text-cosmos-cyan hover:underline">
                    Source
                  </a>
                </p>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cosmos-muted">Surface colour</p>
                <div
                  className="relative mt-2 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${[2000, 3000, 4500, 6000, 9000, 15000, 40000]
                      .map((k) => blackbodyCss(k))
                      .join(', ')})`,
                  }}
                  role="img"
                  aria-label={
                    remnantHidden
                      ? 'No visible surface: black hole'
                      : `Model surface colour toward the ${tempPos < 0.35 ? 'cool red' : tempPos > 0.65 ? 'hot blue' : 'yellow-white'} end`
                  }
                >
                  {!remnantHidden && (
                    <span
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cosmos-white shadow"
                      style={{ left: `${tempPos * 100}%`, background: blackbodyCss(temp) }}
                    />
                  )}
                </div>
                <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">
                  <span>cooler</span>
                  <span>hotter</span>
                </div>
              </div>

              <nav aria-label="Star life stages">
                <ol className="flex items-center gap-1.5">
                  {STAR_STAGES.map((s, i) => (
                    <li key={s.id} className="flex-1">
                      <button
                        type="button"
                        onClick={() => goToStage(i)}
                        aria-current={i === stage ? 'step' : undefined}
                        aria-label={`Go to stage ${i + 1}: ${s.title}`}
                        title={s.title}
                        className={`h-1.5 w-full rounded-full transition-colors ${
                          i === stage ? 'bg-cosmos-gold' : i < stage ? 'bg-cosmos-gold/40' : 'bg-white/15 hover:bg-white/30'
                        }`}
                      />
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-wide text-cosmos-muted/90">
            Artistic interpretation, not to scale. Star colour uses a blackbody approximation of relative temperature.
          </p>
        </div>
      </div>

    </section>
  );
};

/** Visible element-formation panel that follows the pinned sequence. */
export const Section06StarsElements: React.FC = () => (
  <section aria-labelledby="stars-elements-heading" className="relative bg-cosmos-void px-5 py-24 sm:px-10 lg:px-16">
    <p className="chapter-label">Chapter 06 · Stardust</p>
    <h3 id="stars-elements-heading" className="mt-2 font-display text-4xl text-cosmos-white sm:text-5xl">
      Where the elements come from
    </h3>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ELEMENT_FACTS.map((f) => (
        <article key={f.title} className="rounded-2xl border border-white/10 bg-cosmos-deep/80 p-5">
          <h4 className="font-body text-base font-semibold text-cosmos-gold">{f.title}</h4>
          <p className="mt-2 font-body text-sm leading-relaxed text-cosmos-white/85">{f.body}</p>
          <a
            href={f.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-cosmos-cyan hover:underline"
          >
            Source
          </a>
        </article>
      ))}
    </div>
  </section>
);

export default Section06Stars;
