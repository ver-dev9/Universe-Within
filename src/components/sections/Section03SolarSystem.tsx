import React from 'react';
import { Orbit, Sun, AlertTriangle, ArrowRight } from 'lucide-react';
import { PLANETS_DATA, SUN_DATA, PlanetData } from '../../data/planetsData';

interface Section03SolarSystemProps {
  onSelectPlanet: (planet: PlanetData) => void;
  onExplorePlanetsClick: () => void;
}

export const Section03SolarSystem: React.FC<Section03SolarSystemProps> = ({
  onSelectPlanet,
  onExplorePlanetsClick,
}) => {
  return (
    <section
      id="solar-system"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      {/* Content pinned to left — right side transparent for 3D solar system */}
      <div className="max-w-xl w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Orbit className="w-4 h-4" />
            <span>CHAPTER 03 // THE SOLAR REALM</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white">
            THE SOLAR SYSTEM REVEALED
          </h2>
          <p className="font-body text-space-muted text-sm sm:text-base">
            Eight distinct worlds bound by the immense gravitational dominance of a solitary yellow dwarf star.
          </p>

          <button
            onClick={onExplorePlanetsClick}
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs tracking-widest text-[#03050B] bg-space-cyan hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(72,207,255,0.3)]"
          >
            <span>OBSERVE EACH PLANET</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scientific Scaling Note */}
        <div className="glass-panel p-3 rounded-xl border border-space-cyan/20 mb-5 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-space-blue/60 text-space-cyan shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs font-body text-space-muted">
            <span className="font-heading font-bold text-space-white mr-1">Artistic Scaling:</span>
            True interplanetary distances span vast orders of magnitude. Artistic logarithmic scaling is used for visualization.
          </div>
        </div>

        {/* Sun Spotlight Card */}
        <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 mb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400 tracking-wider uppercase mb-2">
            <Sun className="w-4 h-4 animate-spin" style={{ animationDuration: '20s' }} />
            <span>The Sovereign Star</span>
          </div>
          <h3 className="font-heading font-black text-2xl text-white mb-1">
            {SUN_DATA.name}
          </h3>
          <p className="font-mono text-xs text-amber-300/80 mb-2">
            {SUN_DATA.classification}
          </p>
          <p className="font-body text-xs text-space-muted leading-relaxed mb-3">
            {SUN_DATA.scientificSummary}
          </p>
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-space-muted">Core Temperature:</span>
              <span className="text-amber-400 font-bold">15,000,000°C</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-space-muted">Diameter:</span>
              <span className="text-white">1,392,700 km</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-space-muted">Mass Share:</span>
              <span className="text-space-cyan font-bold">99.86% of Solar System</span>
            </div>
          </div>
        </div>

        {/* Planet Quick-Jump Grid — 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {PLANETS_DATA.map((planet) => (
            <button
              key={planet.id}
              onClick={() => {
                onSelectPlanet(planet);
                onExplorePlanetsClick();
              }}
              className="glass-panel glass-card-hover p-3 rounded-xl border border-white/10 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="w-6 h-6 rounded-full mb-2 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform" style={{ backgroundColor: planet.color }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                </div>
                <div className="font-mono text-[9px] text-space-cyan uppercase tracking-wider">
                  {planet.classification.split(' ')[0]}
                </div>
                <h4 className="font-heading font-bold text-sm text-white group-hover:text-space-cyan transition-colors">
                  {planet.name}
                </h4>
                <div className="font-mono text-[10px] text-space-muted mt-0.5">
                  {planet.distanceFromSunMillionKm}M km
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-space-cyan">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
