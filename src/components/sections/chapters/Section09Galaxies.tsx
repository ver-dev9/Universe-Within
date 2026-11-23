import React, {
  Suspense,
  lazy,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { gsap, ScrollTrigger } from "../../../animations/smoothScroll";
import {
  GALAXIES,
  GALAXY_DISCLAIMER,
  GALAXY_JOURNEY,
  GalaxyKind,
} from "../../../data/galaxiesData";
import {
  useInViewport,
  useChapterQuality,
  ProgressBox,
} from "../../../scenes/stars/chapterRuntime";

const GalaxyScene = lazy(() => import("../../../scenes/galaxies/GalaxyScene"));
const ChapterBloom = lazy(() => import("../../../scenes/stars/ChapterBloom"));

const N = GALAXIES.length;

/** Short visual description of each procedural model, for screen readers. */
const SCENE_ALT: Record<GalaxyKind, string> = {
  "milky-way":
    "A barred spiral galaxy of glowing points: a warm golden bar and bulge, two bright arms and two fainter ones of blue-white stars with pink star-forming knots. A cyan ring marks the Sun about halfway out.",
  andromeda:
    "A large spiral galaxy seen steeply tilted, a long cigar-shaped glow with a bright golden core and tightly wound arms.",
  elliptical:
    "A smooth, featureless golden ellipsoid of stars, brightest at the centre, surrounded by a swarm of compact globular clusters.",
  irregular:
    "An irregular dwarf galaxy: an off-centre bar of stars and scattered clumps of blue stars and pink star-forming gas, with no spiral order.",
  interacting:
    "Two colliding spiral galaxies with bright cores and pink starburst knots, trailing two long curved streamers of stars.",
};

/**
 * Chapter 09 — Galaxies.
 * A sticky stage with one lazily-mounted R3F canvas. The first part of the
 * scroll zooms out from stars in a spiral arm to the whole Milky Way; after
 * that a keyboard-accessible tablist switches between procedural galaxy types
 * with sourced data cards. Reduced motion: no scrub, overview pose, all copy static.
 */
export const Section09Galaxies: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const journey = useRef<ProgressBox>({ current: 0 }).current;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [exploring, setExploring] = useState(false);
  const { level, profile, reducedMotion } = useChapterQuality();
  const inView = useInViewport(sectionRef);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reducedMotion) {
      journey.current = 1;
      setExploring(true);
      return;
    }
    journey.current = 0;
    setExploring(false);
    const ctx = gsap.context(() => {
      const q = (sel: string) => section.querySelectorAll(sel);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            const e = self.progress > 0.62;
            setExploring((prev) => (prev === e ? prev : e));
          },
        },
      });
      const proxy = { p: 0 };
      tl.to(
        proxy,
        { p: 1, duration: 6, onUpdate: () => void (journey.current = proxy.p) },
        0,
      );
      tl.to(
        q('[data-g09="title"]'),
        { autoAlpha: 0, y: -30, duration: 0.6 },
        0.9,
      );
      GALAXY_JOURNEY.forEach((_, i) => {
        const t0 = 1.2 + i * 1.7;
        const card = q(`[data-g09-step="${i}"]`);
        tl.fromTo(
          card,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          t0,
        );
        tl.to(card, { autoAlpha: 0, y: -20, duration: 0.35 }, t0 + 1.35);
      });
      tl.fromTo(
        q('[data-g09="explorer"]'),
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        6.4,
      );
      tl.to({}, { duration: 3 }); // hold the explorer
    }, section);
    ScrollTrigger.refresh();
    return () => ctx.revert(); // kills the ScrollTrigger and its tweens
  }, [journey, reducedMotion]);

  const select = useCallback((i: number, focus = false) => {
    const n = (i + N) % N;
    setActive(n);
    if (focus) tabRefs.current[n]?.focus();
  }, []);

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      select(active + 1, true);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      select(active - 1, true);
    else if (e.key === "Home") select(0, true);
    else if (e.key === "End") select(N - 1, true);
    else return;
    e.preventDefault();
  };

  const gal = GALAXIES[active];
  // During the zoom-out journey the scene always shows the Milky Way.
  const sceneKind: GalaxyKind = exploring ? gal.id : "milky-way";

  return (
    <section
      id="galaxies"
      ref={sectionRef}
      aria-labelledby="galaxies-heading"
      className="pointer-events-auto relative bg-cosmos-void"
      style={{ height: reducedMotion ? undefined : "420vh" }}
    >
      <div
        className={`${reducedMotion ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} w-full overflow-hidden`}
      >
        <div
          className="absolute inset-0"
          role="img"
          aria-label={SCENE_ALT[sceneKind]}
        >
          {inView && (
            <Canvas
              dpr={profile.dpr}
              frameloop={reducedMotion ? "demand" : "always"}
              gl={{
                antialias: profile.antialias,
                powerPreference: "high-performance",
                alpha: false,
              }}
              camera={{ position: [0, 12, 22], fov: 50, near: 0.02, far: 600 }}
              aria-hidden
            >
              <color attach="background" args={["#03040A"]} />
              <Suspense fallback={null}>
                <GalaxyScene
                  kind={sceneKind}
                  journey={journey}
                  quality={level}
                  reducedMotion={reducedMotion}
                />
                <ChapterBloom profile={profile} intensity={0.55} />
              </Suspense>
            </Canvas>
          )}
        </div>

        {/* Readability scrims */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[60%] bg-gradient-to-r from-cosmos-void/90 via-cosmos-void/45 to-transparent md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(3,4,10,0.92) 0%, rgba(3,4,10,0.7) 30%, rgba(3,4,10,0.35) 60%, rgba(3,4,10,0) 100%)",
          }}
        />

        {/* Title */}
        {!reducedMotion && (
          <header
            data-g09="title"
            className="pointer-events-none absolute inset-x-5 top-20 sm:inset-x-10 md:inset-x-auto md:left-10 md:top-1/2 md:w-[34rem] md:-translate-y-1/2 lg:left-16"
          >
            <p className="chapter-label">Chapter 09 · Galaxies</p>
            <h2
              id="galaxies-heading"
              className="cinematic-heading readable mt-4 text-cosmos-white"
              style={{ fontSize: "clamp(2.6rem, 6vw, 5.4rem)" }}
            >
              Islands of Stars
            </h2>
            <p className="readable mt-5 max-w-md font-body text-base leading-relaxed text-cosmos-white/85 md:text-lg">
              Pull back from a single sun until a whole galaxy fits in view —
              then compare the shapes galaxies take.
            </p>
          </header>
        )}

        {/* Zoom-out journey */}
        {!reducedMotion &&
          GALAXY_JOURNEY.map((step, i) => (
            <article
              key={step.id}
              data-g09-step={i}
              aria-labelledby={`g09-step-${step.id}`}
              className="invisible absolute inset-x-5 bottom-10 opacity-0 sm:inset-x-10 md:inset-x-auto md:bottom-auto md:left-10 md:top-1/2 md:w-[28rem] md:-translate-y-1/2 lg:left-16"
            >
              <p className="chapter-label !text-cosmos-gold">{step.kicker}</p>
              <h3
                id={`g09-step-${step.id}`}
                className="readable mt-3 font-display text-3xl leading-tight text-cosmos-white sm:text-4xl md:text-5xl"
              >
                {step.title}
              </h3>
              <p className="readable mt-4 font-body text-sm leading-relaxed text-cosmos-white/85 md:text-base">
                {step.body}
              </p>
            </article>
          ))}

        {/* Explorer: tabs + data card */}
        <div
          data-g09="explorer"
          className={`absolute inset-x-4 bottom-5 sm:inset-x-8 md:inset-x-auto md:bottom-8 md:left-10 md:w-[27rem] lg:left-16 ${
            reducedMotion ? "top-auto" : "invisible opacity-0"
          }`}
        >
          {reducedMotion && (
            <div className="mb-4">
              <p className="chapter-label">Chapter 09 · Galaxies</p>
              <h2
                id="galaxies-heading"
                className="cinematic-heading readable mt-2 text-cosmos-white"
                style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
              >
                Islands of Stars
              </h2>
            </div>
          )}
          <div
            role="tablist"
            aria-label="Choose a galaxy type"
            aria-orientation="horizontal"
            className="flex flex-wrap gap-1.5"
            onKeyDown={onTabKey}
          >
            {GALAXIES.map((g, i) => {
              const selected = i === active;
              return (
                <button
                  key={g.id}
                  ref={(el) => (tabRefs.current[i] = el)}
                  id={`gal-tab-${g.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="gal-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cosmos-cyan ${
                    selected
                      ? "border-cosmos-blue bg-cosmos-blue/30 text-cosmos-white"
                      : "border-white/15 bg-cosmos-void/60 text-cosmos-muted hover:border-white/35 hover:text-cosmos-white"
                  }`}
                >
                  {g.label}
                  <span className="sr-only"> — {g.classification}</span>
                </button>
              );
            })}
          </div>

          <article
            id="gal-panel"
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`gal-tab-${gal.id}`}
            aria-live="polite"
            className="readable mt-3 max-h-[52svh] overflow-y-auto rounded-2xl border border-white/10 bg-cosmos-void/80 p-5 backdrop-blur-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cosmos-cyan">
                {gal.classification}
              </p>
              <span className="rounded-full border border-cosmos-gold/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cosmos-gold">
                Artistic interpretation
              </span>
            </div>
            <h3 className="mt-2 font-display text-3xl text-cosmos-white sm:text-4xl">
              {gal.name}
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-cosmos-white/85">
              {gal.summary}
            </p>
            <dl className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {gal.facts.map((f) => {
                const src = f.source ?? gal.source;
                return (
                  <div
                    key={f.label}
                    className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-3"
                  >
                    <dt className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cosmos-muted">
                      {f.label}
                    </dt>
                    <dd className="font-body text-sm text-cosmos-white">
                      {f.value}
                      {f.estimate && (
                        <span className="sr-only"> (estimate)</span>
                      )}
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1.5 font-mono text-[10px] text-cosmos-cyan/80 underline decoration-cosmos-cyan/30 underline-offset-2 hover:text-cosmos-cyan"
                        aria-label={`Source for ${f.label}: ${src.name}`}
                      >
                        src
                      </a>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <a
              href={gal.source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-cosmos-cyan underline-offset-4 hover:underline"
            >
              Source: {gal.source.name}
            </a>
          </article>
        </div>

        <p className="pointer-events-none absolute bottom-4 right-6 hidden max-w-xs text-right font-mono text-[10px] leading-snug text-cosmos-muted md:block">
          <span className="block uppercase tracking-[0.2em] text-cosmos-gold">
            Artistic interpretation
          </span>
          {GALAXY_DISCLAIMER} ≈ marks published estimates.
        </p>
      </div>

      {reducedMotion && (
        <div className="relative mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:px-8 md:grid-cols-3">
          {GALAXY_JOURNEY.map((step) => (
            <article
              key={step.id}
              className="rounded-2xl border border-white/10 bg-cosmos-deep/70 p-5"
            >
              <p className="chapter-label !text-cosmos-gold">{step.kicker}</p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-cosmos-white">
                {step.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-cosmos-white/85">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Section09Galaxies;
