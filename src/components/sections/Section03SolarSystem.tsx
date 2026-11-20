import React, { useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';
import { PLANETS_DATA, SUN_DATA, PlanetData, EARTH_DIAMETER_KM, AU_MILLION_KM } from '../../data/planetsData';
import { useCosmosStore, ScaleMode } from '../../store/useCosmosStore';
import { relativeOrbit, relativeRadius } from '../../scenes/rigState';

interface Section03SolarSystemProps {
  /** Select + focus a planet (camera fly-to). */
  onSelectPlanet: (planet: PlanetData) => void;
  /** Open the long-form planet chapter for the focused planet. */
  onDeepDive: (planet: PlanetData) => void;
}

const fmt = (n: number, digits = 0) => n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });

function formatRotation(hours: number) {
  const h = Math.abs(hours);
  const base = h >= 72 ? `${fmt(h / 24, 1)} Earth days` : `${fmt(h, 1)} hours`;
  return hours < 0 ? `${base} (retrograde)` : base;
}

function formatOrbit(days: number) {
  return days >= 730 ? `${fmt(days / 365.256, 2)} Earth years` : `${fmt(days, 1)} Earth days`;
}

/** How much farther than drawn the outermost planet really is, at relative-size scale. */
const NEPTUNE = PLANETS_DATA[PLANETS_DATA.length - 1];
const DISTANCE_COMPRESSION = Math.round(
  ((NEPTUNE.distanceFromSunMillionKm * 1e6) / EARTH_DIAMETER_KM) * (relativeRadius(PLANETS_DATA[2]) * 2) / relativeOrbit(NEPTUNE),
);

const SCALE_COPY: Record<ScaleMode, { badge: string; body: string }> = {
  cinematic: {
    badge: 'Not to scale',
    body: 'Sizes and distances are both compressed so all eight worlds and the Sun share one view. Giant planets are shrunk, small ones enlarged, and orbits squeezed together.',
  },
  relative: {
    badge: 'Sizes to scale · distances compressed',
    body: `The Sun and planets are drawn at their true diameter ratios — the Sun is about ${fmt(
      SUN_DATA.actualDiameterKm / EARTH_DIAMETER_KM,
    )}× Earth's width. Distances are still not to scale: at this size, Neptune would really be about ${fmt(
      DISTANCE_COMPRESSION,
    )}× farther from the Sun than shown. Orbit order and spacing trend are kept.`,
  },
};

/**
 * Chapter 02 — Our Solar System. Text column on the left, the 3D system on the
 * right; selecting a planet (click in 3D, or this keyboard-friendly selector)
 * flies the camera to it and opens the data panel.
 */
export const Section03SolarSystem: React.FC<Section03SolarSystemProps> = ({ onSelectPlanet, onDeepDive }) => {
  const scaleMode = useCosmosStore((s) => s.scaleMode);
  const setScaleMode = useCosmosStore((s) => s.setScaleMode);
  const focusedId = useCosmosStore((s) => s.focusedPlanetId);
  const setFocusedPlanet = useCosmosStore((s) => s.setFocusedPlanet);
  const focused = PLANETS_DATA.find((p) => p.id === focusedId) ?? null;
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const selectIndex = useCallback(
    (i: number, moveFocus = false) => {
      const n = PLANETS_DATA.length;
      const idx = ((i % n) + n) % n;
      onSelectPlanet(PLANETS_DATA[idx]);
      if (moveFocus) buttonsRef.current[idx]?.focus();
    },
    [onSelectPlanet],
  );

  const currentIndex = focused ? PLANETS_DATA.indexOf(focused) : -1;

  // Esc anywhere in Chapter 02 returns the camera to the overview.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const s = useCosmosStore.getState();
      if (s.activeSection === 'solar-system' && s.focusedPlanetId) s.setFocusedPlanet(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSelectorKey = (e: React.KeyboardEvent) => {
    const from = currentIndex < 0 ? 0 : currentIndex;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        selectIndex(currentIndex < 0 ? 0 : from + 1, true);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        selectIndex(currentIndex < 0 ? PLANETS_DATA.length - 1 : from - 1, true);
        break;
      case 'Home':
        e.preventDefault();
        selectIndex(0, true);
        break;
      case 'End':
        e.preventDefault();
        selectIndex(PLANETS_DATA.length - 1, true);
        break;
    }
  };

  const copy = SCALE_COPY[scaleMode];

  return (
    <section
      id="solar-system"
      aria-labelledby="solar-title"
      className="relative min-h-screen px-4 sm:px-6 lg:px-12 pt-48 pb-24 pointer-events-none"
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,25rem)_1fr_minmax(0,21rem)] lg:gap-8 items-start">
        {/* ---------------- Left column: intro, scale mode, selector ---------------- */}
        <div className="pointer-events-auto space-y-6 max-w-md">
          <div className="space-y-3">
            <p className="chapter-label">Chapter 02 · Our Solar System</p>
            <h2 id="solar-title" className="font-display text-5xl sm:text-6xl leading-[0.95] text-cosmos-white">
              Our Solar System
            </h2>
            <p className="font-body text-sm sm:text-base text-cosmos-muted leading-relaxed">
              One star and eight planets, from scorched Mercury to wind-torn Neptune. Choose a world to fly to it.
            </p>
          </div>

          {/* Scale mode */}
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div role="radiogroup" aria-label="Scale mode" className="grid grid-cols-2 gap-1 p-1 rounded-full bg-cosmos-void/60 border border-white/10">
              {(['cinematic', 'relative'] as ScaleMode[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={scaleMode === m}
                  onClick={() => setScaleMode(m)}
                  className={`rounded-full px-3 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors ${
                    scaleMode === m ? 'bg-cosmos-cyan text-cosmos-void' : 'text-cosmos-muted hover:text-cosmos-white'
                  }`}
                >
                  {m === 'cinematic' ? 'Cinematic' : 'Relative size'}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-cosmos-gold" aria-live="polite">
              {copy.badge}
            </p>
            <p className="font-body text-xs text-cosmos-muted leading-relaxed">{copy.body}</p>
          </div>

          {/* Planet selector — arrow keys move between planets, Esc returns to the overview */}
          <div>
            <p id="planet-selector-label" className="chapter-label mb-3">
              Select a planet
            </p>
            <div role="group" aria-labelledby="planet-selector-label" onKeyDown={onSelectorKey} className="grid grid-cols-4 gap-2">
              {PLANETS_DATA.map((p, i) => {
                const active = p.id === focusedId;
                const tabbable = active || (currentIndex < 0 && i === 0);
                return (
                  <button
                    key={p.id}
                    ref={(el) => (buttonsRef.current[i] = el)}
                    tabIndex={tabbable ? 0 : -1}
                    aria-pressed={active}
                    onClick={() => selectIndex(i)}
                    className={`group flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors ${
                      active ? 'border-cosmos-cyan bg-cosmos-cyan/10' : 'border-white/10 bg-cosmos-deep/60 hover:border-white/30'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="block rounded-full"
                      style={{
                        width: 10 + Math.min(14, Math.sqrt(p.actualDiameterKm / 4879) * 3),
                        height: 10 + Math.min(14, Math.sqrt(p.actualDiameterKm / 4879) * 3),
                        background: `radial-gradient(circle at 35% 35%, ${p.color}, ${p.secondaryColor})`,
                      }}
                    />
                    <span className={`font-mono text-[10px] tracking-wider ${active ? 'text-cosmos-white' : 'text-cosmos-muted group-hover:text-cosmos-white'}`}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {focused && (
              <button
                onClick={() => setFocusedPlanet(null)}
                className="mt-3 font-mono text-[10px] tracking-[0.25em] uppercase text-cosmos-muted hover:text-cosmos-white"
              >
                ← Back to overview
              </button>
            )}
          </div>
        </div>

        {/* Centre column intentionally empty: the 3D view shows through. */}
        <div aria-hidden="true" className="hidden lg:block" />

        {/* ---------------- Right column: planet info panel ---------------- */}
        <div className="pointer-events-auto mt-8 lg:mt-0 lg:sticky lg:top-48" aria-live="polite">
          {focused ? <PlanetInfo planet={focused} onClose={() => setFocusedPlanet(null)} onPrev={() => selectIndex(currentIndex - 1)} onNext={() => selectIndex(currentIndex + 1)} onDeepDive={() => onDeepDive(focused)} /> : (
            <p className="hidden lg:block font-mono text-[10px] tracking-[0.25em] uppercase text-cosmos-muted/80 text-right">
              Click a planet or use the selector
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

const PlanetInfo: React.FC<{
  planet: PlanetData;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDeepDive: () => void;
}> = ({ planet, onClose, onPrev, onNext, onDeepDive }) => {
  const au = planet.distanceFromSunMillionKm / AU_MILLION_KM;
  const rows: [string, string, string?][] = [
    ['Diameter', `${fmt(planet.actualDiameterKm)} km`, `${fmt(planet.actualDiameterKm / EARTH_DIAMETER_KM, 2)} × Earth · equatorial`],
    ['Distance from Sun', `${fmt(planet.distanceFromSunMillionKm, 1)} million km`, `${fmt(au, 2)} AU · average (semimajor axis)`],
    ['Orbital period', formatOrbit(planet.orbitPeriodDays), `${fmt(planet.orbitPeriodDays, 1)} days · sidereal`],
    ['Rotation period', formatRotation(planet.rotationPeriodHours), `sidereal · axial tilt ${fmt(planet.axialTiltDeg, 1)}°`],
    ['Mean temperature', `${planet.averageTemperatureC}°C`, planet.temperatureContext],
    ['Known moons', String(planet.moonsCount)],
  ];

  return (
    <article className="glass-panel-glow rounded-2xl p-5 space-y-3 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto" aria-labelledby="planet-info-title">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-cosmos-cyan">{planet.classification}</p>
          <h3 id="planet-info-title" className="font-display text-4xl text-cosmos-white leading-none mt-1">
            {planet.name}
          </h3>
          <p className="font-body text-xs text-cosmos-muted mt-1">{planet.tagline}</p>
        </div>
        <button onClick={onClose} aria-label="Close planet details and return to overview" className="p-1.5 rounded-full text-cosmos-muted hover:text-cosmos-white hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </header>

      <dl className="divide-y divide-white/10 border-y border-white/10">
        {rows.map(([label, value, note]) => (
          <div key={label} className="py-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-cosmos-muted">{label}</dt>
              <dd className="font-body text-sm text-cosmos-white text-right">{value}</dd>
            </div>
            {note && <p className="font-body text-[11px] text-cosmos-muted/80 mt-0.5 leading-snug">{note}</p>}
          </div>
        ))}
      </dl>

      <ul className="space-y-2">
        {planet.keyDiscoveries.slice(0, 2).map((f) => (
          <li key={f} className="font-body text-xs text-cosmos-white/85 leading-relaxed pl-3 border-l border-cosmos-cyan/40">
            {f}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex gap-1">
          <button onClick={onPrev} aria-label="Previous planet" className="p-2 rounded-full border border-white/15 text-cosmos-muted hover:text-cosmos-white hover:border-white/40">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={onNext} aria-label="Next planet" className="p-2 rounded-full border border-white/15 text-cosmos-muted hover:text-cosmos-white hover:border-white/40">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={onDeepDive} className="font-mono text-[10px] tracking-[0.2em] uppercase text-cosmos-cyan hover:text-cosmos-white">
          Deep dive →
        </button>
      </div>

      <a
        href={planet.source.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-cosmos-muted/70 hover:text-cosmos-white"
      >
        Source: NASA NSSDCA fact sheet <ExternalLink className="w-3 h-3" />
      </a>
    </article>
  );
};
