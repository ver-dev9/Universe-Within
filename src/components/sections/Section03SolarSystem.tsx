import React from 'react';
import { Orbit, Sun, AlertTriangle, ArrowRight, Layers } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
              <Orbit className="w-4 h-4" />
              <span>CHAPTER 03 // THE SOLAR REALM</span>
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-white">
              THE SOLAR SYSTEM REVEALED
            </h2>
            <p className="font-body text-space-muted text-base sm:text-lg">
              Eight distinct worlds bound by the immense gravitational dominance of a solitary yellow dwarf star. Scroll to travel from the incandescent heart of the Sun across billions of kilometers of celestial choreography.
            </p>
          </div>

          <button
            onClick={onExplorePlanetsClick}
            className="self-start md:self-auto px-6 py-3 rounded-xl font-heading font-bold text-xs tracking-widest text-[#03050B] bg-space-cyan hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(72,207,255,0.3)]"
          >
            <span>OBSERVE EACH PLANET</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scientific Scaling Transparency Banner */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-space-cyan/20 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 rounded-xl bg-space-blue/60 text-space-cyan shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-body text-space-muted">
            <span className="font-heading font-bold text-space-white mr-1.5">Artistic Scaling Architecture:</span>
            True interplanetary distances and planetary diameters span orders of magnitude (the Sun is 109 times Earth\'s diameter; Neptune is 30 AU away). To render all eight planets simultaneously distinguishable and interactive on a digital canvas, artistic logarithmic scaling is utilized for relative distances and radii.
          </div>
        </div>

        {/* Central Sun Card & Planet Quick Jump Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Sun Spotlight Card */}
          <div className="lg:col-span-4 glass-panel-glow rounded-3xl p-6 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-amber-400 tracking-wider uppercase mb-3">
                <Sun className="w-4 h-4 animate-spin" style={{ animationDuration: '20s' }} />
                <span>The Sovereign Star</span>
              </div>
              <h3 className="font-heading font-black text-3xl text-white mb-1">
                {SUN_DATA.name}
              </h3>
              <p className="font-mono text-xs text-amber-300/80 mb-4">
                {SUN_DATA.classification}
              </p>
              <p className="font-body text-xs sm:text-sm text-space-muted leading-relaxed mb-4">
                {SUN_DATA.scientificSummary}
              </p>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
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

          {/* Planetary Carousel Quick Select Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PLANETS_DATA.map((planet) => (
              <button
                key={planet.id}
                onClick={() => {
                  onSelectPlanet(planet);
                  onExplorePlanetsClick();
                }}
                className="glass-panel glass-card-hover p-4 rounded-2xl border border-white/10 flex flex-col justify-between text-left group"
              >
                <div>
                  <div className="w-8 h-8 rounded-full mb-3 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform" style={{ backgroundColor: planet.color }}>
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  <div className="font-mono text-[10px] text-space-cyan uppercase tracking-wider">
                    {planet.classification.split(' ')[0]}
                  </div>
                  <h4 className="font-heading font-bold text-lg text-white group-hover:text-space-cyan transition-colors">
                    {planet.name}
                  </h4>
                  <div className="font-mono text-[11px] text-space-muted mt-1">
                    {planet.distanceFromSunMillionKm}M km
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-space-cyan">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
