import React, { useState } from 'react';
import { Sparkles, Radio, AlertOctagon, CheckCircle, Info } from 'lucide-react';
import { COSMIC_PHENOMENA, CosmicPhenomenon } from '../../data/astronomicalFacts';

export const Section06BeyondPlanets: React.FC = () => {
  const [activePhenomenon, setActivePhenomenon] = useState<CosmicPhenomenon>(COSMIC_PHENOMENA[0]);

  return (
    <section
      id="beyond-planets"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>CHAPTER 06 // RELATIVISTIC & DEEP PHENOMENA</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-white">
            BEYOND THE PLANETS
          </h2>
          <p className="font-body text-space-muted text-base sm:text-lg">
            Past the Kuiper Belt and outer Oort Cloud lies the realm of cosmic cataclysms: star nurseries igniting in vibrant nebulae, supernova explosions forging the elements of life, and singularities where spacetime cascades into infinity.
          </p>
        </div>

        {/* Phenomenon Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {COSMIC_PHENOMENA.map((item) => {
            const isSelected = activePhenomenon.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePhenomenon(item)}
                className={`p-4 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'glass-panel-glow border-space-cyan/60 text-space-cyan -translate-y-1'
                    : 'glass-panel hover:bg-space-blue/30 text-space-muted hover:text-white border-white/10'
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider mb-1 text-space-cyan">
                  {item.type.split(' ')[0]}
                </div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-white">
                  {item.name}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Active Phenomenon Detail Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Scientific Overview & Relativistic Principles */}
          <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-space-cyan/30 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-space-cyan tracking-widest uppercase">
                {activePhenomenon.type}
              </span>
              <span className="font-mono text-xs text-amber-400 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                EXTREME ASTROPHYSICS
              </span>
            </div>

            <div>
              <h3 className="font-heading font-black text-3xl sm:text-4xl text-white mb-2">
                {activePhenomenon.name}
              </h3>
              <p className="font-mono text-sm text-space-cyan">
                &ldquo;{activePhenomenon.tagline}&rdquo;
              </p>
            </div>

            <p className="font-body text-sm sm:text-base text-space-white/90 leading-relaxed">
              {activePhenomenon.scientificExplanation}
            </p>

            {/* Key Physics Pillars */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <span className="font-mono text-xs text-space-cyan tracking-wider uppercase block">
                Fundamental Physical Mechanisms
              </span>
              <div className="space-y-2">
                {activePhenomenon.keyPhysics.map((physics, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm font-body text-space-white/90">
                    <CheckCircle className="w-4 h-4 text-space-cyan shrink-0 mt-0.5" />
                    <span>{physics}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-space-blue/50 border border-space-cyan/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-space-cyan shrink-0 mt-0.5" />
              <div className="text-xs font-body text-space-muted">
                <strong className="text-space-white">Visual Modeling Principle:</strong> {activePhenomenon.visualDescription}
              </div>
            </div>
          </div>

          {/* Right Column: Black Hole Special Focus Guide */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex items-center gap-2 font-mono text-xs text-space-purple tracking-widest uppercase">
              <Radio className="w-4 h-4" />
              <span>Singularity Detection Guide</span>
            </div>

            <h4 className="font-heading font-bold text-xl text-white">
              How Do We Detect Black Holes?
            </h4>

            <p className="font-body text-xs sm:text-sm text-space-muted leading-relaxed">
              Because black holes emit no intrinsic electromagnetic radiation from within their event horizons, astrophysicists infer their existence and measure their mass through external astrophysical signatures:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-space-blue/40 border border-white/10">
                <div className="font-heading font-bold text-xs text-space-cyan">1. Stellar Orbital Astrometry</div>
                <div className="font-body text-xs text-space-muted mt-1">
                  Tracking stars orbiting an unseen gravitational mass at tens of thousands of km/s (e.g. Andrea Ghez & Reinhard Genzel Nobel Prize work on Sagittarius A*).
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-blue/40 border border-white/10">
                <div className="font-heading font-bold text-xs text-space-purple">2. Relativistic Accretion X-Rays</div>
                <div className="font-body text-xs text-space-muted mt-1">
                  Gas from companion stars pulled into the accretion disk reaches friction velocities near c, radiating high-energy X-rays before crossing the horizon.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-blue/40 border border-white/10">
                <div className="font-heading font-bold text-xs text-emerald-400">3. Event Horizon Telescope (EHT)</div>
                <div className="font-body text-xs text-space-muted mt-1">
                  Global Very Long Baseline Interferometry (VLBI) directly imaged the photon ring silhouette of M87* (2019) and Sagittarius A* (2022).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
