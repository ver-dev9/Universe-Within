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
      {/* Pinned to left ~45% max-w-xl — right side transparent to display 3D Black Hole & relativistic shader effects */}
      <div className="max-w-xl w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>CHAPTER 06 // RELATIVISTIC & DEEP PHENOMENA</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white">
            BEYOND THE PLANETS
          </h2>
          <p className="font-body text-space-muted text-sm sm:text-base">
            Past the Kuiper Belt lies the realm of cosmic cataclysms: star nurseries, supernovae, and singularities where spacetime cascades into infinity.
          </p>
        </div>

        {/* NASA JWST Carina Nebula Reference Image */}
        <div className="relative rounded-2xl overflow-hidden mb-5 border border-white/10 group">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Carina_Nebula_by_James_Webb_Space_Telescope_-_Cosmic_Cliffs.png/1280px-Carina_Nebula_by_James_Webb_Space_Telescope_-_Cosmic_Cliffs.png"
            alt="JWST Cosmic Cliffs in the Carina Nebula"
            className="w-full h-36 object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-space-cyan/90">
            Cosmic Cliffs, Carina Nebula • JWST / NASA / ESA
          </div>
        </div>

        {/* Phenomenon Selector — 2-column compact */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COSMIC_PHENOMENA.map((item) => {
            const isSelected = activePhenomenon.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePhenomenon(item)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'glass-panel-glow border-space-cyan/60 text-space-cyan -translate-y-0.5'
                    : 'glass-panel hover:bg-space-blue/30 text-space-muted hover:text-white border-white/10'
                }`}
              >
                <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5 text-space-cyan">
                  {item.type.split(' ')[0]}
                </div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                  {item.name}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Active Phenomenon Detail */}
        <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 border border-space-cyan/30 space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-space-cyan tracking-widest uppercase">
              {activePhenomenon.type}
            </span>
            <span className="font-mono text-[10px] text-amber-400 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" />
              EXTREME
            </span>
          </div>

          <div>
            <h3 className="font-heading font-black text-2xl text-white mb-0.5">
              {activePhenomenon.name}
            </h3>
            <p className="font-mono text-xs text-space-cyan">
              &ldquo;{activePhenomenon.tagline}&rdquo;
            </p>
          </div>

          <p className="font-body text-xs sm:text-sm text-space-white/90 leading-relaxed">
            {activePhenomenon.scientificExplanation}
          </p>

          {/* Key Physics */}
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <span className="font-mono text-[10px] text-space-cyan tracking-wider uppercase block">
              Physical Mechanisms
            </span>
            {activePhenomenon.keyPhysics.map((physics, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-body text-space-white/90">
                <CheckCircle className="w-3.5 h-3.5 text-space-cyan shrink-0 mt-0.5" />
                <span>{physics}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-space-blue/50 border border-space-cyan/20 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-space-cyan shrink-0 mt-0.5" />
            <div className="text-[11px] font-body text-space-muted">
              <strong className="text-space-white">Visual Modeling:</strong> {activePhenomenon.visualDescription}
            </div>
          </div>
        </div>

        {/* Black Hole Detection Guide — compact */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 font-mono text-xs text-space-purple tracking-widest uppercase">
            <Radio className="w-4 h-4" />
            <span>Singularity Detection</span>
          </div>

          <h4 className="font-heading font-bold text-sm text-white">
            How Do We Detect Black Holes?
          </h4>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-space-blue/40 border border-white/10">
              <div className="font-heading font-bold text-[11px] text-space-cyan">1. Stellar Astrometry</div>
              <div className="font-body text-[10px] text-space-muted mt-0.5">
                Tracking stars orbiting an unseen mass (Sagittarius A* — Nobel Prize 2020).
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-space-blue/40 border border-white/10">
              <div className="font-heading font-bold text-[11px] text-space-purple">2. Accretion X-Rays</div>
              <div className="font-body text-[10px] text-space-muted mt-0.5">
                Gas reaches relativistic speeds, radiating high-energy X-rays before crossing the horizon.
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-space-blue/40 border border-white/10">
              <div className="font-heading font-bold text-[11px] text-emerald-400">3. Event Horizon Telescope</div>
              <div className="font-body text-[10px] text-space-muted mt-0.5">
                Directly imaged M87* (2019) and Sagittarius A* (2022) photon ring silhouettes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
