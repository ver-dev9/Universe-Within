import React, { Suspense, lazy, useLayoutEffect, useRef } from 'react';
import { gsap } from '../../../animations/smoothScroll';
import { useCosmosStore, selectReducedMotion } from '../../../store/useCosmosStore';
import { BLACK_HOLE_BEATS, BLACK_HOLE_DISCLAIMER, BlackHoleBeat } from '../../../data/blackHolesData';
import { bhRig, BH_RIG_START, BH_RIG_STATIC, resetBlackHoleRig } from '../../../scenes/black-holes/bhRig';
import { useNearViewport } from '../../../scenes/black-holes/useNearViewport';

// The ray tracer (and three / R3F / postprocessing) loads only when the chapter nears the viewport.
const BlackHoleCanvas = lazy(() =>
  import('../../../scenes/black-holes/BlackHoleCanvas').then((m) => ({ default: m.BlackHoleCanvas })),
);

/** Camera pose per beat (radians / R_s). Index matches BLACK_HOLE_BEATS. */
const BEAT_POSES = [
  { az: 0.05, incl: 1.45, dist: 20 }, // formation — wide establishing view
  { az: 0.45, incl: 1.52, dist: 14.5 }, // horizon — near edge-on, shadow + lensed humps
  { az: 0.8, incl: 1.555, dist: 11 }, // photon sphere — tight, edge-on, rings at the shadow edge
  { az: 1.05, incl: 0.95, dist: 18 }, // ISCO — tilted well above the disk so the inner gap reads
  { az: 1.3, incl: 1.12, dist: 15.5 }, // accretion — tilted to show the disk and Doppler asymmetry
  { az: 1.9, incl: 1.36, dist: 23 }, // scale — pull back
  { az: 2.4, incl: 0.42, dist: 30 }, // Sgr A* / M87* — near face-on, like the EHT rings
];

const BeatCard: React.FC<{ beat: BlackHoleBeat; index: number; staticLayout?: boolean }> = ({ beat, index, staticLayout }) => (
  <article
    data-bh-beat={staticLayout ? undefined : index}
    aria-labelledby={`bh-beat-${beat.id}`}
    className={
      staticLayout
        ? 'rounded-2xl border border-white/10 bg-cosmos-deep/70 p-5 backdrop-blur-sm'
        : 'invisible absolute inset-x-4 bottom-5 max-h-[54svh] overflow-y-auto rounded-2xl border border-white/10 bg-cosmos-void/70 p-5 opacity-0 backdrop-blur-md sm:inset-x-8 md:inset-y-0 md:left-10 md:right-auto md:flex md:max-h-none md:w-[26rem] md:flex-col md:justify-center md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-0 lg:left-16'
    }
  >
    <p className="chapter-label !text-cosmos-gold">
      {String(index + 1).padStart(2, '0')} · {beat.kicker}
    </p>
    <h3 id={`bh-beat-${beat.id}`} className="readable mt-3 font-display text-3xl leading-tight text-cosmos-white sm:text-4xl md:text-5xl">
      {beat.title}
    </h3>
    <p className="readable mt-4 font-body text-sm leading-relaxed text-cosmos-white/85 md:text-base">{beat.body}</p>
    {beat.facts && (
      <dl className="mt-5 space-y-3 border-t border-white/10 pt-4">
        {beat.facts.map((f) => (
          <div key={f.label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-muted">{f.label}</dt>
            <dd className="mt-0.5 font-body text-sm text-cosmos-white">
              <span className="font-medium">{f.value}</span>
              {f.estimate && (
                <span className="ml-2 rounded border border-cosmos-gold/40 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-cosmos-gold/90" title="Approximate / rounded value">
                  est.
                </span>
              )}
              {f.detail && <span className="block text-xs text-cosmos-muted">{f.detail}</span>}
              <a
                href={f.source.url}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto mt-0.5 inline-block font-mono text-[10px] text-cosmos-cyan/80 underline decoration-cosmos-cyan/30 underline-offset-2 hover:text-cosmos-cyan"
              >
                Source: {f.source.name}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    )}
  </article>
);

/**
 * Chapter 08 — Black Holes.
 * A tall scroll section with a sticky viewport. The black hole is a full-screen
 * GPU ray tracer on its own lazily-mounted canvas. One scrubbed GSAP timeline
 * drives the camera rig (orbit + inclination + distance) and the copy; the
 * visitor can also drag to orbit. Reduced motion: one static composition with
 * every beat laid out as cards.
 */
export const Section08BlackHole: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useCosmosStore(selectReducedMotion);
  const quality = useCosmosStore((s) => s.quality);
  const near = useNearViewport(sectionRef);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reducedMotion) {
      resetBlackHoleRig(BH_RIG_STATIC);
      return;
    }
    resetBlackHoleRig(BH_RIG_START);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      });
      const q = (sel: string) => section.querySelectorAll(sel);

      tl.to(bhRig, { fade: 1, duration: 0.6, ease: 'power1.out' }, 0);
      tl.to(bhRig, { dist: 20, duration: 1.4, ease: 'power2.out' }, 0);
      tl.to(q('[data-bh="title"]'), { autoAlpha: 0, y: -40, duration: 0.6 }, 1.0);
      tl.to(q('[data-bh="hint"]'), { autoAlpha: 0, duration: 0.4 }, 1.0);

      const start = 1.5;
      const span = 1.7;
      BLACK_HOLE_BEATS.forEach((_, i) => {
        const t0 = start + i * span;
        const card = q(`[data-bh-beat="${i}"]`);
        const dot = q(`[data-bh-dot="${i}"]`);
        tl.to(bhRig, { ...BEAT_POSES[i], duration: span, ease: 'power1.inOut' }, t0 - 0.5);
        tl.fromTo(card, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35 }, t0);
        tl.to(dot, { scale: 1.8, backgroundColor: '#E7B86B', duration: 0.2 }, t0);
        if (i < BLACK_HOLE_BEATS.length - 1) {
          tl.to(card, { autoAlpha: 0, y: -24, duration: 0.3 }, t0 + span - 0.3);
          tl.to(dot, { scale: 1, backgroundColor: 'rgba(238,242,250,0.25)', duration: 0.2 }, t0 + span - 0.3);
        }
      });
      tl.to({}, { duration: 0.6 }); // hold the last beat
    }, section);

    return () => {
      ctx.revert(); // kills the ScrollTrigger and restores inline styles
      resetBlackHoleRig(BH_RIG_START);
    };
  }, [reducedMotion]);

  return (
    <section
      id="black-holes"
      ref={sectionRef}
      aria-labelledby="bh-title"
      className="relative w-full bg-cosmos-void pointer-events-auto"
      style={{ height: reducedMotion ? undefined : `${180 + BLACK_HOLE_BEATS.length * 75}vh` }}
    >
      <div ref={stageRef} className={`${reducedMotion ? 'relative' : 'sticky top-0'} h-[100svh] w-full overflow-hidden`}>
        <div
          className="absolute inset-0"
          role="img"
          aria-label="Real-time visualization of a black hole: a dark shadow ringed by a thin photon ring, with a glowing accretion disk whose far side is lensed over and under the shadow. One side of the disk is brighter because of Doppler beaming."
        >
          {near && (
            <Suspense fallback={null}>
              <BlackHoleCanvas quality={quality} reducedMotion={reducedMotion} />
            </Suspense>
          )}
        </div>

        {/* Readability scrims (non-interactive) */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-cosmos-void/90 via-cosmos-void/45 to-transparent md:block" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-cosmos-void via-cosmos-void/70 to-transparent md:hidden" />

        <header
          data-bh="title"
          className="pointer-events-none absolute inset-x-4 bottom-8 sm:inset-x-8 md:inset-y-0 md:left-10 md:right-auto md:flex md:w-[34rem] md:flex-col md:justify-center lg:left-16"
        >
          <p className="chapter-label">Chapter 08 · Black Holes</p>
          <h2 id="bh-title" className="cinematic-heading readable mt-4 text-cosmos-white">
            Black Holes
          </h2>
          <p className="readable mt-5 max-w-md font-body text-base leading-relaxed text-cosmos-white/85 md:text-lg">
            Where gravity wins. Light bends, slows and, past one boundary, never returns.
          </p>
        </header>

        {!reducedMotion && BLACK_HOLE_BEATS.map((b, i) => <BeatCard key={b.id} beat={b} index={i} />)}

        {!reducedMotion && (
          <div aria-hidden className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            {BLACK_HOLE_BEATS.map((b, i) => (
              <span key={b.id} data-bh-dot={i} className="block h-1.5 w-1.5 rounded-full bg-cosmos-white/25" />
            ))}
          </div>
        )}

        <p
          data-bh="hint"
          className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-cosmos-muted md:top-auto md:bottom-8"
        >
          {reducedMotion ? 'Drag to orbit' : 'Scroll to orbit · drag to look around'}
        </p>

        {/* Always-visible honesty label */}
        <p className="pointer-events-none absolute inset-x-3 top-12 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-cosmos-gold/90 md:hidden">
          Approximate visualization · not a numerical-relativity simulation
        </p>
        <p className="pointer-events-auto absolute bottom-6 right-6 hidden max-w-xs rounded-lg border border-cosmos-gold/30 bg-cosmos-void/75 px-3 py-2 font-mono text-[10px] leading-snug text-cosmos-white/80 backdrop-blur-sm md:block">
          <span className="mb-1 block uppercase tracking-[0.2em] text-cosmos-gold">Approximate visualization</span>
          {BLACK_HOLE_DISCLAIMER}
        </p>
      </div>

      {reducedMotion && (
        <div className="relative mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
          {BLACK_HOLE_BEATS.map((b, i) => (
            <BeatCard key={b.id} beat={b} index={i} staticLayout />
          ))}
        </div>
      )}
    </section>
  );
};

export default Section08BlackHole;
