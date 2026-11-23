import React from 'react';
import { ArrowLeft, ArrowRight, Compass, Shield, Wind, Thermometer, Orbit, Disc, CheckCircle } from 'lucide-react';
import { PLANETS_DATA, PlanetData, EARTH_DIAMETER_KM, AU_MILLION_KM } from '../../data/planetsData';

interface Section04PlanetExplorationProps {
  selectedPlanet: PlanetData;
  onSelectPlanet: (planet: PlanetData) => void;
  onReturnToSolarSystem: () => void;
}

export const Section04PlanetExploration: React.FC<Section04PlanetExplorationProps> = ({
  selectedPlanet,
  onSelectPlanet,
  onReturnToSolarSystem,
}) => {
  const currentIndex = PLANETS_DATA.findIndex((p) => p.id === selectedPlanet.id);

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + PLANETS_DATA.length) % PLANETS_DATA.length;
    onSelectPlanet(PLANETS_DATA[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % PLANETS_DATA.length;
    onSelectPlanet(PLANETS_DATA[nextIdx]);
  };

  return (
    <section
      id="planet-exploration"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-36 pb-24 pointer-events-auto"
    >
      {/* Pinned to left ~42% max-w-lg, leaving the right side wide open to observe the 3D rotating planet */}
      <div className="max-w-lg w-full">
        {/* Navigation — Back & Planet Switcher */}
        <div className="mb-4 space-y-2">
          <button
            onClick={onReturnToSolarSystem}
            className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-space-cyan hover:text-white border border-space-cyan/20 flex items-center gap-2 hover:border-space-cyan transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO SOLAR SYSTEM</span>
          </button>

          {/* Quick Planet Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PLANETS_DATA.map((planet) => {
              const active = planet.id === selectedPlanet.id;
              return (
                <button
                  key={planet.id}
                  onClick={() => onSelectPlanet(planet)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-space-cyan text-[#03050B] font-bold border-space-cyan shadow-[0_0_12px_rgba(72,207,255,0.4)]'
                      : 'glass-panel text-space-muted hover:text-white border-white/10'
                  }`}
                >
                  {planet.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Planet Identity Card */}
        <div className="glass-panel-glow rounded-2xl p-5 border border-space-cyan/30 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-space-cyan tracking-widest uppercase">
              PLANET 0{currentIndex + 1} OF 08
            </span>
            <span className="font-mono text-xs text-space-muted">
              {selectedPlanet.classification}
            </span>
          </div>

          <h2 className="font-display font-normal text-4xl sm:text-5xl text-cosmos-white mb-0.5">
            {selectedPlanet.name}
          </h2>
          <p className="font-mono text-xs text-space-cyan tracking-wider mb-3">
            &ldquo;{selectedPlanet.tagline}&rdquo;
          </p>

          {/* Visual Highlights */}
          <div className="p-3 rounded-xl bg-space-blue/50 border border-space-cyan/20 mb-3">
            <div className="flex items-center gap-1.5 font-mono text-xs text-space-cyan mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Unique Visual Signatures</span>
            </div>
            <p className="font-body text-xs text-space-white/90 leading-relaxed">
              {selectedPlanet.visualHighlights}
            </p>
          </div>

          <p className="font-body text-xs text-space-muted leading-relaxed">
            {selectedPlanet.scientificSummary}
          </p>

          {/* Planet Nav */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3">
            <button
              onClick={handlePrev}
              className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-space-white hover:text-space-cyan flex items-center gap-1.5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>
            <span className="font-mono text-xs text-space-muted font-bold">
              {selectedPlanet.name.toUpperCase()}
            </span>
            <button
              onClick={handleNext}
              className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-space-white hover:text-space-cyan flex items-center gap-1.5 border border-white/10"
            >
              <span>NEXT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Key Physical Parameters — compact 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="glass-panel p-2.5 rounded-xl border-white/10">
            <div className="flex items-center gap-1 font-mono text-[10px] text-space-muted mb-0.5">
              <Orbit className="w-3 h-3 text-space-cyan" />
              <span>Sun Distance</span>
            </div>
            <div className="font-heading font-bold text-sm text-white">
              {selectedPlanet.distanceFromSunMillionKm}M km
            </div>
            <div className="text-[9px] font-mono text-space-cyan">
              {(selectedPlanet.distanceFromSunMillionKm / AU_MILLION_KM).toFixed(2)} AU
            </div>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border-white/10">
            <div className="flex items-center gap-1 font-mono text-[10px] text-space-muted mb-0.5">
              <Disc className="w-3 h-3 text-space-purple" />
              <span>Diameter</span>
            </div>
            <div className="font-heading font-bold text-sm text-white">
              {selectedPlanet.actualDiameterKm.toLocaleString()} km
            </div>
            <div className="text-[9px] font-mono text-space-purple">
              {(selectedPlanet.actualDiameterKm / EARTH_DIAMETER_KM).toFixed(2)} × Earth
            </div>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border-white/10">
            <div className="flex items-center gap-1 font-mono text-[10px] text-space-muted mb-0.5">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>Avg Temp</span>
            </div>
            <div className="font-heading font-bold text-sm text-white">
              {selectedPlanet.averageTemperatureC}°C
            </div>
            <div className="text-[9px] font-mono text-amber-300">
              {selectedPlanet.averageTemperatureC + 273.15} K
            </div>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border-white/10">
            <div className="flex items-center gap-1 font-mono text-[10px] text-space-muted mb-0.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Known Moons</span>
            </div>
            <div className="font-heading font-bold text-sm text-white">
              {selectedPlanet.moonsCount}
            </div>
            <div className="text-[9px] font-mono text-emerald-300">
              2024–2026 IAU
            </div>
          </div>
        </div>

        {/* Orbit & Rotation */}
        <div className="glass-panel p-3 rounded-xl border-white/10 grid grid-cols-2 gap-2 mb-3">
          <div>
            <span className="font-mono text-[10px] text-space-muted">Orbital Period:</span>
            <div className="font-heading font-bold text-sm text-space-white mt-0.5">
              {selectedPlanet.orbitPeriodDays.toLocaleString()} Days
            </div>
            <p className="font-mono text-[9px] text-space-cyan">
              {(selectedPlanet.orbitPeriodDays / 365.256).toFixed(2)} Earth Years
            </p>
          </div>
          <div>
            <span className="font-mono text-[10px] text-space-muted">Rotation Period:</span>
            <div className="font-heading font-bold text-sm text-space-white mt-0.5">
              {Math.abs(selectedPlanet.rotationPeriodHours).toFixed(1)} Hours
            </div>
            <p className="font-mono text-[9px] text-space-purple">
              {selectedPlanet.rotationPeriodHours < 0 ? 'Retrograde' : 'Prograde'}
            </p>
          </div>
        </div>

        {/* Atmospheric Composition */}
        <div className="glass-panel p-3 rounded-xl border-white/10 mb-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-space-cyan mb-2">
            <Wind className="w-3.5 h-3.5" />
            <span>Atmospheric Composition</span>
          </div>
          {selectedPlanet.atmosphere.length > 0 ? (
            <div className="space-y-1.5">
              {selectedPlanet.atmosphere.map((gas) => (
                <div key={gas.gas} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-space-white">{gas.gas}</span>
                    <span className="text-space-cyan font-bold">{gas.percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-space-blue/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-space-cyan to-space-purple rounded-full"
                      style={{ width: `${Math.min(gas.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-[11px] text-space-muted italic">
              Minimal atmospheric exosphere trace atoms only.
            </div>
          )}
        </div>

        {/* Key Discoveries */}
        <div className="glass-panel p-3 rounded-xl border-white/10 space-y-2">
          <div>
            <span className="font-mono text-[10px] text-space-cyan tracking-wider uppercase mb-1 block">
              Groundbreaking Discoveries
            </span>
            <ul className="space-y-1">
              {selectedPlanet.keyDiscoveries.map((discovery, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs font-body text-space-white/90">
                  <CheckCircle className="w-3.5 h-3.5 text-space-cyan shrink-0 mt-0.5" />
                  <span>{discovery}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 pt-2">
            <span className="font-mono text-[10px] text-space-muted block mb-1">
              Exploration Missions:
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedPlanet.explorationMissions.map((m, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-space-blue/60 text-[10px] font-mono text-space-white border border-white/10">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
