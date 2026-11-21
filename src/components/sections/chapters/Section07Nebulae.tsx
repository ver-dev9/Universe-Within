import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap, ScrollTrigger } from '../../../animations/smoothScroll';
import { NEBULAE, formatLy } from '../../../data/nebulaeData';
import {
  useInViewport,
  useChapterQuality,
  scrollSectionToProgress,
  ProgressBox,
} from '../../../scenes/stars/chapterRuntime';

const NebulaFlythroughScene = lazy(() => import('../../../scenes/nebulae/NebulaFlythroughScene'));
const ChapterBloom = lazy(() => import('../../../scenes/stars/ChapterBloom'));

const N = NEBULAE.length;
const indexFromProgress = (p: number) => Math.min(N - 1, Math.max(0, Math.floor(p * N)));

export const Section07Nebulae: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef<ProgressBox>({ current: 0 }).current;
  const [active, setActive] = useState(0);
  const { profile, reducedMotion } = useChapterQuality();
  const inView = useInViewport(sectionRef);

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
          scrub: reducedMotion ? true : 1,
          onUpdate: (self) => {
            const i = indexFromProgress(self.progress);
            setActive((prev) => (prev === i ? prev : i));
          },
        },
      });
      tl.to(proxy, { p: 1, ease: 'none', onUpdate: () => void (progress.current = proxy.p) });
      if (!reducedMotion) {
        gsap.from(section.querySelectorAll('[data-s07-reveal]'), {
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

  const goTo = useCallback(
    (i: number) => scrollSectionToProgress(sectionRef.current, (i + 0.5) / N, reducedMotion),
    [reducedMotion],
  );

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (active + 1) % N;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (active - 1 + N) % N;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = N - 1;
    else return;
    e.preventDefault();
    setActive(next);
    goTo(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  const neb = NEBULAE[active];

  return (
    <section
      id="nebulae"
      ref={sectionRef}
      aria-labelledby="nebulae-heading"
      className="relative bg-cosmos-void"
      style={{ height: `${N * 110}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {inView && (
            <Canvas
              dpr={profile.dpr}
              gl={{ antialias: profile.antialias, powerPreference: 'high-performance', alpha: false }}
              camera={{ position: [0, 0, 30], fov: 55, near: 0.1, far: 400 }}
            >
              <Suspense fallback={null}>
                <NebulaFlythroughScene progress={progress} profile={profile} reducedMotion={reducedMotion} />
                <ChapterBloom profile={profile} intensity={0.7} />
              </Suspense>
            </Canvas>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cosmos-void/85 via-cosmos-void/30 to-transparent" />
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
            <p className="chapter-label" data-s07-reveal>
              Chapter 07
            </p>
            <h2
              id="nebulae-heading"
              className="cinematic-heading readable mt-2 text-cosmos-white"
              style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4.6rem)' }}
              data-s07-reveal
            >
              Nebulae: Cosmic Nurseries
            </h2>
            <p className="readable mt-3 max-w-lg font-body text-sm text-cosmos-white/80" data-s07-reveal>
              Fly through five clouds of gas and dust — where stars are born, and where they scatter their remains.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,27rem)_1fr]">
            <div className="space-y-3">
              <div
                role="tablist"
                aria-label="Choose a nebula"
                className="flex flex-wrap gap-1.5"
                onKeyDown={onTabKey}
              >
                {NEBULAE.map((n, i) => {
                  const selected = i === active;
                  return (
                    <button
                      key={n.id}
                      id={`neb-tab-${n.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="neb-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => {
                        setActive(i);
                        goTo(i);
                      }}
                      className={`rounded-full border px-3 py-1.5 font-body text-xs transition-colors sm:text-sm ${
                        selected
                          ? 'border-cosmos-violet bg-cosmos-violet/25 text-cosmos-white'
                          : 'border-white/15 bg-cosmos-void/60 text-cosmos-muted hover:border-white/35 hover:text-cosmos-white'
                      }`}
                    >
                      {n.name.replace(' Nebula', '')}
                    </button>
                  );
                })}
              </div>

              <article
                id="neb-panel"
                role="tabpanel"
                aria-labelledby={`neb-tab-${neb.id}`}
                aria-live="polite"
                className="readable rounded-2xl border border-white/10 bg-cosmos-void/75 p-5 backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cosmos-violet">{neb.catalog}</p>
                  <span className="rounded-full border border-cosmos-gold/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cosmos-gold">
                    Artistic interpretation
                  </span>
                </div>
                <h3 className="mt-2 font-display text-3xl text-cosmos-white sm:text-4xl">{neb.name}</h3>
                <dl className="mt-3 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">Type</dt>
                    <dd className="mt-0.5 font-body text-xs text-cosmos-white">{neb.type}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">Distance (est.)</dt>
                    <dd className="mt-0.5 font-body text-xs text-cosmos-white">{formatLy(neb.distanceLy)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">Constellation</dt>
                    <dd className="mt-0.5 font-body text-xs text-cosmos-white">{neb.constellation}</dd>
                  </div>
                </dl>
                <p className="mt-3 font-body text-sm leading-relaxed text-cosmos-white/90">{neb.science}</p>
                <p className="mt-2 font-body text-xs leading-relaxed text-cosmos-muted">{neb.highlight}</p>
                <a
                  href={neb.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-cosmos-cyan underline-offset-4 hover:underline"
                >
                  Source: {neb.sourceLabel}
                </a>
              </article>
            </div>
          </div>

          <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-wide text-cosmos-muted/90">
            Procedural volumes inspired by Hubble imagery; shapes, colours and star positions are artistic, not to scale. Distances are
            published estimates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Section07Nebulae;
