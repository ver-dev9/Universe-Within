import React, { useState } from 'react';
import { Globe, Sun, Moon, Shield, Droplets, Heart, Sparkles, X } from 'lucide-react';

export const Section05EarthSpecial: React.FC = () => {
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [moonModalOpen, setMoonModalOpen] = useState<boolean>(false);

  return (
    <section
      id="earth-special"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header & Tagline */}
        <div className="space-y-3 mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Globe className="w-4 h-4" />
            <span>CHAPTER 05 // THE BLUE OASIS</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-white">
            IN A VAST UNIVERSE, THIS IS OUR HOME.
          </h2>
          <p className="font-body text-space-muted text-base sm:text-lg">
            Suspended in the quiet darkness of the cosmos, Earth is a rare jewel: an active biosphere harboring liquid oceans, an oxygenated shield, and conscious observers looking back at the stars.
          </p>
        </div>

        {/* Interactive Controls & Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Day/Night and Moon Controls */}
          <div className="lg:col-span-5 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-space-cyan/30 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-space-cyan tracking-wider uppercase">
                Interactive Biosphere Terminal
              </span>
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                HABITABLE ZONE
              </span>
            </div>

            {/* Day / Night Toggle Control */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    Lighting Simulation Mode
                  </h4>
                  <p className="font-body text-xs text-space-muted">
                    {nightMode ? 'Nocturnal City Glow (Human Civilization)' : 'Diurnal Solar Illumination (Oceans & Clouds)'}
                  </p>
                </div>
                <button
                  onClick={() => setNightMode(!nightMode)}
                  className={`p-3 rounded-2xl flex items-center gap-2 transition-all border ${
                    nightMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-space-cyan/20 text-space-cyan border-space-cyan/40 shadow-[0_0_20px_rgba(72,207,255,0.3)]'
                  }`}
                  aria-label="Toggle day or night mode on Earth"
                >
                  {nightMode ? <Moon className="w-5 h-5 text-amber-300" /> : <Sun className="w-5 h-5 text-space-cyan" />}
                  <span className="font-mono text-xs font-bold">
                    {nightMode ? 'NIGHT VIEW' : 'DAY VIEW'}
                  </span>
                </button>
              </div>
            </div>

            {/* Moon Exploration Interaction Button */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-base text-white">
                  The Natural Satellite (Luna)
                </h4>
                <p className="font-body text-xs text-space-muted">
                  Diameter 3,474 km • Orbit distance 384,400 km
                </p>
              </div>
              <button
                onClick={() => setMoonModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-[#03050B] bg-gradient-to-r from-space-white to-space-cyan hover:brightness-110 transition-all shadow-[0_0_15px_rgba(72,207,255,0.3)]"
              >
                EXPLORE MOON
              </button>
            </div>

            {/* Planetary Reflection */}
            <div className="p-5 rounded-2xl bg-space-blue/40 border border-space-cyan/20">
              <p className="font-body text-xs sm:text-sm text-space-white/90 italic leading-relaxed">
                Seen from the outer reaches of the solar system, our entire world appears as a solitary speck of light suspended in a sunbeam—a testament to the rarity and fragility of life in an immense cosmos.
              </p>
              <div className="text-right font-mono text-xs text-space-cyan mt-2">
                — Cosmic Perspective Reflection
              </div>
            </div>
          </div>

          {/* Right Column: 4 Educational Pillars of Earth's Habitability */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pillar 1: Water & Oceans */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-lg text-white">
                Oceans & Hydrosphere
              </h4>
              <p className="font-body text-xs text-space-muted leading-relaxed">
                Liquid oceans cover 70.8% of Earth\'s surface (1.33 billion cubic kilometers). High specific heat capacity stabilizes global climate extremes and moderates temperature swings.
              </p>
            </div>

            {/* Pillar 2: Geomagnetic Dynamo */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-lg text-white">
                Geomagnetic Shield
              </h4>
              <p className="font-body text-xs text-space-muted leading-relaxed">
                Convection of liquid iron in Earth\'s outer core generates an active geodynamo, projecting the magnetosphere to deflect lethal solar wind protons and cosmic ionizing radiation.
              </p>
            </div>

            {/* Pillar 3: Nitrogen-Oxygen Atmosphere */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-lg text-white">
                Atmosphere & Ozone
              </h4>
              <p className="font-body text-xs text-space-muted leading-relaxed">
                A 78% Nitrogen / 21% Oxygen atmospheric mixture sustains aerobic cellular metabolism while stratospheric ozone (O3) absorbs harmful UV-B and UV-C solar photons.
              </p>
            </div>

            {/* Pillar 4: Biological Feedback */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-lg text-white">
                Conditions for Life
              </h4>
              <p className="font-body text-xs text-space-muted leading-relaxed">
                Continuous tectonic plate recycling balances atmospheric CO2 through silicate weathering, preserving habitable liquid water temperatures across billions of years.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Moon Exploration Modal */}
      {moonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-glow max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-space-cyan/40 relative">
            <button
              onClick={() => setMoonModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-space-muted hover:text-white glass-panel"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-space-cyan uppercase mb-3">
              <Moon className="w-4 h-4" />
              <span>Earth\'s Natural Satellite</span>
            </div>

            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
              The Moon (Luna)
            </h3>
            <p className="font-mono text-xs text-space-cyan mb-4">
              Mean Orbital Distance: 384,400 km • Synodic Period: 29.53 Days
            </p>

            <div className="space-y-3 font-body text-xs sm:text-sm text-space-muted mb-6">
              <p>
                <strong className="text-white">Giant Impact Origin:</strong> Formed ~4.5 billion years ago when a Mars-sized proto-planet named Theia collided with the early Earth, coalescing ejected debris into Luna.
              </p>
              <p>
                <strong className="text-white">Tidal Locking & Stabilization:</strong> Luna is tidally locked to Earth, always showing the same hemisphere. Gravitational tidal interactions stabilize Earth\'s 23.4° axial tilt, preventing wild climate fluctuations.
              </p>
              <p>
                <strong className="text-white">Apollo & Artemis Exploration:</strong> Twelve humans walked on the lunar regolith between 1969 and 1972. The ongoing NASA Artemis program will establish a permanent sustainable human presence at the lunar South Pole.
              </p>
            </div>

            <button
              onClick={() => setMoonModalOpen(false)}
              className="w-full py-3 rounded-xl font-heading font-bold text-xs tracking-wider text-[#03050B] bg-space-cyan hover:brightness-110 transition-all"
            >
              CLOSE LUNAR OBSERVATION
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
