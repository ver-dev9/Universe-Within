import React, { Suspense, lazy, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../../animations/smoothScroll';
import { ChapterCanvas, InvalidateRef } from './shared/ChapterCanvas';
import { useChapterSettings } from './shared/useChapterSettings';
import { useInView } from './shared/useInView';
import { SourceList } from './shared/SourceList';
import { ObjectSelector } from './shared/ObjectSelector';
import { LightCurve } from './exoplanets/LightCurve';
import { RadialVelocityDiagram } from './exoplanets/RadialVelocityDiagram';
import { ORBIT_A, TRANSIT_CAMERA } from '../../../scenes/exoplanets/transitMath';
import {
  CONFIRMED_COUNT,
  CONSTANT_SOURCES,
  DEMO_STARS,
  DemoStarId,
  DETECTION_SOURCES,
  EARTH_PER_SUN_RADIUS,
  EXO_ARTISTIC_DISCLAIMER,
  EXO_SYSTEMS,
  ExoSystem,
  JUPITER_IN_EARTH_RADII,
  RADIUS_SLIDER,
  RV_EXAMPLES,
  RV_EXPLAINER,
  TRANSIT_EXPLAINER,
  ARCHIVE_PSCOMP,
  formatDepth,
  formatLy,
  pcToLy,
  transitDepth,
} from '../../../data/exoplanetsData';

const TransitScene = lazy(() => import('../../../scenes/exoplanets/TransitScene'));

/** Orbit period of the demo in seconds (illustrative). */
const DEMO_PERIOD_S = 14;
const STARFIELD = { high: 1400, medium: 900, low: 450 } as const;

const fmt = (v: number, digits = 2) => v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

function TransitLab() {
  const { budget, quality, reducedMotion } = useChapterSettings();
  const [starId, setStarId] = useState<DemoStarId>('sun');
  const [rp, setRp] = useState<number>(RADIUS_SLIDER.initial);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [phaseVersion, setPhaseVersion] = useState(0);
  const phase = useRef(-0.07);
  const invalidateRef: InvalidateRef = useRef(null);
  const labRef = useRef<HTMLDivElement>(null);
  const { inView } = useInView(labRef);
  const sliderId = useId();
  const posId = useId();

  useEffect(() => {
    if (reducedMotion) {
      setPlaying(false);
      phase.current = 0;
      setPhaseVersion((v) => v + 1);
    }
  }, [reducedMotion]);

  // DOM-side orbital clock: one source of truth for the 3D planet and the light curve.
  useEffect(() => {
    if (!playing || !inView) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      phase.current = (phase.current + dt / DEMO_PERIOD_S) % 1;
      invalidateRef.current?.();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView]);

  const star = DEMO_STARS.find((s) => s.id === starId)!;
  const k = (rp * EARTH_PER_SUN_RADIUS) / star.radiusSun;
  const depth = transitDepth(rp, star.radiusSun);
  const d = formatDepth(depth);
  const earthRef = formatDepth(transitDepth(1, star.radiusSun));
  const jupiterRef = formatDepth(transitDepth(JUPITER_IN_EARTH_RADII, star.radiusSun));

  const setPhaseFromSlider = (v: number) => {
    setPlaying(false);
    phase.current = v;
    setPhaseVersion((x) => x + 1);
    invalidateRef.current?.();
  };

  const wrapped = ((phase.current % 1) + 1) % 1;

  return (
    <div ref={labRef} className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]" data-s10-reveal>
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-cosmos-void sm:min-h-[420px]">
        <ChapterCanvas
          label={`Artistic 3D view of a planet ${fmt(rp, 1)} times Earth's radius orbiting a ${star.label.toLowerCase()} and passing in front of it.`}
          camera={TRANSIT_CAMERA}
          invalidateRef={invalidateRef}
        >
          <Suspense fallback={null}>
            <TransitScene
              phase={phase}
              ratio={k}
              starColor={star.color}
              segments={budget.sphereSegments}
              starfield={STARFIELD[quality]}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </ChapterCanvas>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-cosmos-gold/40 bg-cosmos-void/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cosmos-gold">
          Artistic interpretation · size ratio to scale
        </span>
        <p className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[10px] leading-relaxed text-cosmos-white/70">
          Planet drawn at the true size ratio Rₚ/R★ = {k.toFixed(4)}. Orbit distance compressed.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="chapter-label !text-cosmos-cyan">Interactive · the transit method</p>
        <p className="mt-2 text-sm leading-relaxed text-cosmos-white/85">{TRANSIT_EXPLAINER}</p>

        <fieldset className="mt-4">
          <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-muted">Host star</legend>
          <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Host star">
            {DEMO_STARS.map((s) => (
              <label
                key={s.id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-cosmos-cyan ${
                  s.id === starId ? 'border-cosmos-cyan bg-cosmos-cyan/15 text-cosmos-white' : 'border-white/15 text-cosmos-white/70 hover:border-white/40'
                }`}
              >
                <input
                  type="radio"
                  name="transit-star"
                  value={s.id}
                  checked={s.id === starId}
                  onChange={() => setStarId(s.id)}
                  className="sr-only"
                />
                {s.label}
              </label>
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-cosmos-muted">{star.note}</p>
        </fieldset>

        <div className="mt-4">
          <label htmlFor={sliderId} className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-muted">
            <span>Planet radius</span>
            <span className="text-sm normal-case tracking-normal text-cosmos-white">
              {fmt(rp, 1)} R<sub>⊕</sub> <span className="text-cosmos-muted">· {fmt(rp / JUPITER_IN_EARTH_RADII, 2)} R<sub>J</sub></span>
            </span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={RADIUS_SLIDER.min}
            max={RADIUS_SLIDER.max}
            step={RADIUS_SLIDER.step}
            value={rp}
            onChange={(e) => {
              setRp(parseFloat(e.target.value));
              invalidateRef.current?.();
            }}
            aria-valuetext={`${fmt(rp, 1)} Earth radii; transit depth ${d.pct}`}
            className="mt-2 w-full accent-[#69D9EF]"
          />
          <div className="flex justify-between font-mono text-[9px] text-cosmos-muted">
            <span>0.5 R⊕</span>
            <span>Earth 1</span>
            <span>Jupiter ≈ 11</span>
            <span>15 R⊕</span>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">Rₚ / R★</dt>
            <dd className="mt-0.5 font-heading text-lg text-cosmos-white">{k.toFixed(4)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">Depth (Rₚ/R★)²</dt>
            <dd className="mt-0.5 font-heading text-lg text-cosmos-cyan" aria-live="polite">
              {d.pct}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">In ppm</dt>
            <dd className="mt-0.5 font-heading text-lg text-cosmos-white">{d.ppm}</dd>
          </div>
        </dl>

        <div className="mt-3">
          <LightCurve k={k} a={ORBIT_A} phase={phase} active={playing && inView} phaseVersion={phaseVersion} depthLabel={d.pct} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
            className="rounded-full border border-cosmos-cyan/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-white hover:bg-cosmos-cyan/10"
          >
            {playing ? 'Pause orbit' : 'Play orbit'}
          </button>
          <label htmlFor={posId} className="flex min-w-[12rem] flex-1 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-muted">
            <span className="shrink-0">Orbit position</span>
            <input
              id={posId}
              type="range"
              min={-0.5}
              max={0.5}
              step={0.002}
              value={playing ? 0 : wrapped > 0.5 ? wrapped - 1 : wrapped}
              disabled={playing}
              onChange={(e) => setPhaseFromSlider(parseFloat(e.target.value))}
              aria-valuetext="Planet position along its orbit; 0 is mid-transit"
              className="w-full accent-[#E7B86B] disabled:opacity-40"
            />
          </label>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-cosmos-white/70">
          For scale: Earth crossing this star dims it by {earthRef.pct} ({earthRef.ppm}); Jupiter by ≈ {jupiterRef.pct}. The same planet makes
          a far deeper dip around a small red dwarf — one reason TRAPPIST-1’s small worlds were detectable.
        </p>
        <SourceList className="mt-3" sources={[DETECTION_SOURCES.howWeFind, CONSTANT_SOURCES.earth, CONSTANT_SOURCES.jupiter, ARCHIVE_PSCOMP]} />
      </div>
    </div>
  );
}

function TrappistOrbits({ system }: { system: ExoSystem }) {
  const maxA = Math.max(...system.planets.map((p) => p.semiMajorAu));
  return (
    <svg viewBox="0 0 320 120" className="w-full h-auto" role="img" aria-label="Orbits of the seven TRAPPIST-1 planets drawn to scale; e, f and g lie in the habitable zone.">
      {system.planets.map((p) => {
        const x = 16 + (p.semiMajorAu / maxA) * 290;
        return (
          <g key={p.name}>
            <line x1={x} x2={x} y1={28} y2={86} stroke={p.habitableZone ? 'rgba(105,217,239,0.4)' : 'rgba(238,242,250,0.12)'} />
            <circle cx={x} cy={57} r={Math.max(2.5, (p.radiusEarth ?? 1) * 6)} fill={p.habitableZone ? '#69D9EF' : '#929CAF'} />
            <text x={x} y={104} textAnchor="middle" className={p.habitableZone ? 'fill-cosmos-cyan' : 'fill-cosmos-muted'} style={{ font: '10px "JetBrains Mono", monospace' }}>
              {p.name}
            </text>
          </g>
        );
      })}
      <circle cx={6} cy={57} r={9} fill="#FF8A4C" />
      <text x={16} y={16} className="fill-cosmos-muted" style={{ font: '8px "JetBrains Mono", monospace', letterSpacing: '0.1em' }}>
        ORBITS TO SCALE · PLANET SIZES NOT TO ORBIT SCALE
      </text>
    </svg>
  );
}

function SizeCompare({ system }: { system: ExoSystem }) {
  const p = system.planets[system.featured];
  const r = p.radiusEarth ?? 1;
  const max = Math.max(r, 1);
  const scale = 46 / max;
  return (
    <svg viewBox="0 0 320 120" className="w-full h-auto" role="img" aria-label={`Size comparison: ${system.name} is ${fmt(r, 2)} times Earth's radius.`}>
      <circle cx={70} cy={60} r={1 * scale} fill="#3478D4" />
      <text x={70} y={116} textAnchor="middle" className="fill-cosmos-muted" style={{ font: '10px "JetBrains Mono", monospace' }}>Earth</text>
      <circle cx={210} cy={60} r={r * scale} fill={system.accent} opacity={0.9} />
      <text x={210} y={116} textAnchor="middle" className="fill-cosmos-white" style={{ font: '10px "JetBrains Mono", monospace' }}>
        {system.name} · {fmt(r, 2)} R⊕
      </text>
    </svg>
  );
}

function SystemPanel({ system }: { system: ExoSystem }) {
  const p = system.planets[system.featured];
  const ly = pcToLy(system.distancePc);
  const modelDepth = p.radiusEarth && system.method === 'Transit' ? formatDepth(transitDepth(p.radiusEarth, system.star.radiusSun)) : null;
  const facts: { label: string; value: string }[] = [
    { label: 'Distance', value: formatLy(ly) },
    { label: 'Discovered', value: `${system.discoveryYear} · ${system.method}` },
    { label: 'Radius', value: p.radiusEarth ? `${fmt(p.radiusEarth, 2)} R⊕${system.method === 'Radial Velocity' ? ' (est.)' : ''}` : '—' },
    {
      label: p.massIsMinimum ? 'Min. mass (M sin i)' : p.massFromRelation ? 'Mass (from M–R relation)' : 'Mass',
      value: p.massEarth ? `${fmt(p.massEarth, 2)} M⊕` : 'not measured',
    },
    { label: 'Orbital period', value: `${fmt(p.periodDays, 2)} days` },
    { label: 'Orbit', value: `${fmt(p.semiMajorAu, 4)} AU` },
    { label: 'Equilibrium temp.', value: p.eqTempK ? `≈ ${Math.round(p.eqTempK)} K` : '—' },
    { label: 'Host star', value: `${system.star.spectralType ? `${system.star.spectralType} · ` : ''}${system.star.tempK.toLocaleString('en-US')} K` },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: system.accent }}>
          {system.tagline}
        </p>
        <h4 className="mt-2 font-display text-3xl text-cosmos-white sm:text-4xl">
          {system.name}
          {system.id === 'trappist-1' && <span className="ml-2 font-body text-base text-cosmos-muted">featured: planet e</span>}
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-cosmos-white/90">{system.story}</p>
        <p className="mt-2 text-xs leading-relaxed text-cosmos-muted">{system.highlight}</p>
        <div className="mt-4 rounded-xl border border-white/10 bg-cosmos-void/50 p-3">
          {system.id === 'trappist-1' ? <TrappistOrbits system={system} /> : <SizeCompare system={system} />}
        </div>
      </div>
      <div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="font-mono text-[9px] uppercase tracking-widest text-cosmos-muted">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-cosmos-white">{f.value}</dd>
            </div>
          ))}
        </dl>
        {(modelDepth || system.rvAmplitudeMs) && (
          <div className="mt-4 space-y-1.5 rounded-xl border border-cosmos-cyan/20 bg-cosmos-cyan/5 p-3 text-xs leading-relaxed text-cosmos-white/85">
            {modelDepth && (
              <p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-cosmos-cyan">Transit check · </span>
                (Rₚ/R★)² gives {modelDepth.pct}; the archive’s measured depth is {fmt(system.measuredDepthPct ?? 0, 3)}%.
              </p>
            )}
            {system.rvAmplitudeMs && (
              <p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-cosmos-gold">Star wobble · </span>
                semi-amplitude {fmt(system.rvAmplitudeMs, 2)} m/s.
              </p>
            )}
          </div>
        )}
        <SourceList className="mt-4" sources={system.sources} />
      </div>
    </div>
  );
}

/**
 * Chapter 10 — The Search for Other Worlds.
 * A transit lab (3D star + planet linked to a live light curve), a radial-
 * velocity explainer and a tabbed showcase of five real systems.
 */
export function Section10Exoplanets() {
  const sectionRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useChapterSettings();
  const [systemId, setSystemId] = useState(EXO_SYSTEMS[0].id);
  const system = EXO_SYSTEMS.find((s) => s.id === systemId)!;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-s10-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          },
        );
      });
    }, section);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reducedMotion]);

  const onSelect = useCallback((id: string) => setSystemId(id), []);

  return (
    <section id="exoplanets" ref={sectionRef} aria-labelledby="exoplanets-heading" className="relative overflow-hidden bg-cosmos-void py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 40% at 80% 10%, rgba(105,217,239,0.08), transparent 70%), radial-gradient(50% 40% at 10% 70%, rgba(138,91,202,0.08), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-10 lg:px-16">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end" data-s10-reveal>
          <div>
            <p className="chapter-label mb-5">
              <span className="text-cosmos-cyan">Chapter 10</span> · Exoplanets
            </p>
            <h2 id="exoplanets-heading" className="cinematic-heading readable text-cosmos-white" style={{ fontSize: 'clamp(2.6rem, 6.4vw, 5.6rem)' }}>
              The Search for <em className="text-cosmos-cyan">Other Worlds</em>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cosmos-white/85 md:text-lg">
              Planets are tiny and faint beside their stars, so most are found indirectly — by reading the starlight itself: its faint dimming,
              its subtle wobble.
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cosmos-muted">Confirmed exoplanets</p>
            <p className="mt-2 font-display text-6xl leading-none text-cosmos-white sm:text-7xl">{CONFIRMED_COUNT.value.toLocaleString('en-US')}</p>
            <p className="mt-2 text-sm text-cosmos-white/80">
              as of {CONFIRMED_COUNT.asOf}, per the NASA Exoplanet Archive. The archive adds new planets weekly.
            </p>
            <SourceList className="mt-3" sources={[CONFIRMED_COUNT.source]} />
          </div>
        </header>

        <div className="mt-16">
          <h3 className="sr-only">Transit method demonstration</h3>
          <TransitLab />
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" data-s10-reveal>
          <div>
            <p className="chapter-label !text-cosmos-gold">The radial-velocity method</p>
            <h3 className="mt-3 font-display text-3xl text-cosmos-white sm:text-4xl">Reading the wobble</h3>
            <p className="mt-3 text-sm leading-relaxed text-cosmos-white/85">{RV_EXPLAINER}</p>
            <ul className="mt-4 space-y-2">
              {RV_EXAMPLES.map((ex) => (
                <li key={ex.planet} className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2 text-sm">
                  <span className="text-cosmos-white">
                    {ex.planet} <span className="text-xs text-cosmos-muted">— {ex.note}</span>
                  </span>
                  <span className="shrink-0 font-mono text-cosmos-gold">{fmt(ex.kMs, 2)} m/s</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[10px] text-cosmos-muted">Star’s velocity semi-amplitude (K), NASA Exoplanet Archive.</p>
            <SourceList className="mt-3" sources={[DETECTION_SOURCES.rvFactSheet, DETECTION_SOURCES.howWeFind, ARCHIVE_PSCOMP]} />
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <RadialVelocityDiagram reducedMotion={reducedMotion} />
            <p className="mt-2 font-mono text-[10px] text-cosmos-muted">Schematic — motion and line shifts hugely exaggerated.</p>
          </div>
        </div>

        <div className="mt-16" data-s10-reveal>
          <p className="chapter-label">Real worlds</p>
          <h3 className="mt-3 font-display text-3xl text-cosmos-white sm:text-4xl">Five systems that changed the search</h3>
          <div className="mt-5">
            <ObjectSelector
              items={EXO_SYSTEMS.map((s) => ({ id: s.id, label: s.name, sublabel: s.tagline }))}
              selectedId={systemId}
              onSelect={onSelect}
              idPrefix="exo"
              ariaLabel="Choose an exoplanet system"
              accent={system.accent}
            />
          </div>
          <article
            id="exo-panel"
            role="tabpanel"
            aria-labelledby={`exo-tab-${system.id}`}
            tabIndex={0}
            className="glass-panel mt-4 rounded-2xl p-5 sm:p-7"
          >
            <SystemPanel system={system} />
          </article>
        </div>

        <p className="mt-10 font-mono text-[10px] leading-relaxed text-cosmos-muted/90">
          {EXO_ARTISTIC_DISCLAIMER} Planet values: NASA Exoplanet Archive composite parameters, retrieved {CONFIRMED_COUNT.retrieved}; all carry
          measurement uncertainties.
        </p>
      </div>
    </section>
  );
}

export default Section10Exoplanets;
