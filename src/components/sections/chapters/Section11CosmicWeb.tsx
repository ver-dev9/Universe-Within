import React, { Suspense, lazy, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../../animations/smoothScroll';
import { ChapterCanvas, InvalidateRef } from './shared/ChapterCanvas';
import { useChapterSettings } from './shared/useChapterSettings';
import { scrollSectionToProgress } from '../../../scenes/stars/chapterRuntime';
import {
  COSMIC_SCALES,
  COSMIC_COMPOSITION,
  COMPOSITION_SOURCE,
  COSMIC_WEB_DISCLAIMER,
  WEB_BUDGET,
} from '../../../data/cosmicWebData';

const CosmicWebScene = lazy(() => import('../../../scenes/cosmicweb/CosmicWebScene'));

const N = COSMIC_SCALES.length;
const indexFromProgress = (p: number) => Math.min(N - 1, Math.max(0, Math.floor(p * N)));

/**
 * Chapter 11 — The Architecture of the Universe.
 * A pinned, scroll-scrubbed zoom out through four scales of cosmic structure,
 * followed by the Universe's composition.
 */
export function Section11CosmicWeb() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const scrub = useRef({ progress: 0 });
  const invalidateRef: InvalidateRef = useRef(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { quality, reducedMotion } = useChapterSettings();

  useLayoutEffect(() => {
    const pin = pinRef.current;
    const section = sectionRef.current;
    if (!pin || !section) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrub.current.progress = self.progress;
          invalidateRef.current?.();
          const i = indexFromProgress(self.progress);
          setActive((prev) => (prev === i ? prev : i));
        },
      });
      if (!reducedMotion) {
        gsap.utils.toArray<HTMLElement>('[data-s11-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
            },
          );
        });
      }
    }, section);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reducedMotion]);

  const goTo = useCallback(
    (i: number) => scrollSectionToProgress(pinRef.current, (i + 0.5) / N, reducedMotion),
    [reducedMotion],
  );

  const select = (i: number) => {
    setActive(i);
    goTo(i);
  };

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = active;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (active + 1) % N;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (active - 1 + N) % N;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = N - 1;
    else return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const scale = COSMIC_SCALES[active];

  return (
    <section id="cosmic-web" ref={sectionRef} aria-labelledby="cosmic-web-heading" className="relative bg-cosmos-void">
      <div ref={pinRef} className="relative" style={{ height: `${N * 115}vh` }}>
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <ChapterCanvas
            label="Artistic, procedurally generated 3D cosmic web: glowing filaments of galaxies meeting at bright clusters around dark voids. Scrolling zooms out from the Local Group to the edge of the observable universe."
            camera={{ position: [0, 0, 3], fov: 55, near: 0.02, far: 900 }}
            invalidateRef={invalidateRef}
          >
            <Suspense fallback={null}>
              <CosmicWebScene scrub={scrub} budget={WEB_BUDGET[quality]} reducedMotion={reducedMotion} />
            </Suspense>
          </ChapterCanvas>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cosmos-void/90 via-cosmos-void/20 to-transparent md:bg-gradient-to-r md:from-cosmos-void/85 md:via-cosmos-void/25" />

          <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-20 sm:px-10 lg:px-16">
            <header className="max-w-2xl">
              <p className="chapter-label" data-s11-reveal>
                <span className="text-cosmos-blue">Chapter 11</span> · Cosmic architecture
              </p>
              <h2
                id="cosmic-web-heading"
                className="cinematic-heading readable mt-2 text-cosmos-white"
                style={{ fontSize: 'clamp(2.2rem, 5.4vw, 4.8rem)' }}
                data-s11-reveal
              >
                The Architecture <em className="text-cosmos-blue">of the Universe</em>
              </h2>
              <p className="readable mt-3 max-w-lg text-sm text-cosmos-white/80" data-s11-reveal>
                Zoom out from our galactic neighbourhood to the edge of what we can see. Galaxies are not scattered at random — they trace a
                vast web.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,27rem)] lg:items-end">
              <div
                role="tablist"
                aria-label="Cosmic scale"
                aria-orientation="vertical"
                onKeyDown={onTabKey}
                className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible"
              >
                {COSMIC_SCALES.map((s, i) => {
                  const selected = i === active;
                  return (
                    <button
                      key={s.id}
                      ref={(el) => (tabRefs.current[i] = el)}
                      id={`cw-tab-${s.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="cw-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(i)}
                      className={`group flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                        selected ? 'border-white/30 bg-cosmos-void/80' : 'border-white/10 bg-cosmos-void/50 hover:border-white/30'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full transition-transform"
                        style={{ background: s.accent, transform: selected ? 'scale(1.6)' : 'scale(1)', opacity: selected ? 1 : 0.5 }}
                      />
                      <span>
                        <span className={`block font-body text-xs sm:text-sm ${selected ? 'text-cosmos-white' : 'text-cosmos-muted'}`}>{s.name}</span>
                        <span className="block font-mono text-[9px] tracking-wide text-cosmos-muted">{s.sizeLabel}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <article
                id="cw-panel"
                role="tabpanel"
                aria-labelledby={`cw-tab-${scale.id}`}
                aria-live="polite"
                className="readable rounded-2xl border border-white/10 bg-cosmos-void/75 p-5 backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: scale.accent }}>
                    {scale.kicker}
                  </p>
                  <span className="rounded-full border border-cosmos-gold/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cosmos-gold">
                    Artistic interpretation
                  </span>
                </div>
                <h3 className="mt-2 font-display text-3xl text-cosmos-white sm:text-4xl">{scale.name}</h3>
                <p className="mt-1 font-heading text-lg text-cosmos-white/90">{scale.sizeLabel}</p>
                <p className="mt-3 text-sm leading-relaxed text-cosmos-white/90">{scale.body}</p>
                <p className="mt-2 text-xs leading-relaxed text-cosmos-muted">{scale.detail}</p>
                <p className="mt-3 font-mono text-[10px] leading-relaxed text-cosmos-muted">
                  <span className="mr-1 uppercase tracking-[0.2em]">Sources</span>
                  {scale.sources.map((src, i) => (
                    <React.Fragment key={src.url}>
                      {i > 0 && <span aria-hidden="true"> · </span>}
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-cosmos-cyan underline decoration-white/20 underline-offset-2 hover:decoration-cosmos-cyan">
                        {src.label}
                      </a>
                    </React.Fragment>
                  ))}
                </p>
              </article>
            </div>

            <p className="mt-3 max-w-3xl font-mono text-[10px] leading-relaxed tracking-wide text-cosmos-muted/90">{COSMIC_WEB_DISCLAIMER}</p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center" data-s11-reveal>
          <div>
            <p className="chapter-label !text-cosmos-violet">What the web is made of</p>
            <h3 className="mt-3 font-display text-3xl text-cosmos-white sm:text-5xl">Mostly invisible</h3>
            <p className="mt-4 text-sm leading-relaxed text-cosmos-white/85 sm:text-base">
              Everything we can see — every star, planet and glowing filament — is a small fraction of the Universe. Planck’s map of the
              cosmic microwave background pins down the recipe: the rest is dark matter, seen only through its gravity, and dark energy,
              thought to be accelerating cosmic expansion.
            </p>
          </div>
          <figure className="glass-panel m-0 rounded-2xl p-6">
            <div className="flex h-7 w-full overflow-hidden rounded-full" role="img" aria-label="Composition of the Universe: about 5% ordinary matter, 27% dark matter, 68% dark energy.">
              {COSMIC_COMPOSITION.map((c) => (
                <div key={c.id} style={{ width: `${c.pct}%`, background: c.color }} />
              ))}
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              {COSMIC_COMPOSITION.map((c) => (
                <div key={c.id}>
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cosmos-muted">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    {c.label}
                  </dt>
                  <dd className="mt-1 font-display text-4xl text-cosmos-white">{c.rounded}</dd>
                  <dd className="mt-1 text-xs leading-snug text-cosmos-white/65">{c.note}</dd>
                </div>
              ))}
            </dl>
            <figcaption className="mt-4 font-mono text-[10px] leading-relaxed text-cosmos-muted">
              Share of the Universe’s mass–energy. ESA/Planck (2013): ordinary matter 4.9%, dark matter 26.8%; dark energy is the remainder
              (≈ 68.3%).{' '}
              <a href={COMPOSITION_SOURCE.url} target="_blank" rel="noopener noreferrer" className="text-cosmos-cyan underline decoration-white/20 underline-offset-2">
                {COMPOSITION_SOURCE.label}
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export default Section11CosmicWeb;
