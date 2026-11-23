import React, { useState } from 'react';
import { Globe, Sun, Moon, Shield, Droplets, Heart, X } from 'lucide-react';

export const Section05EarthSpecial: React.FC = () => {
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [moonModalOpen, setMoonModalOpen] = useState<boolean>(false);

  return (
    <section
      id="earth-special"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-32 pb-24 pointer-events-auto"
    >
      {/* Pinned to left ~42% max-w-lg, leaving the right side wide open to observe 3D Earth */}
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Globe className="w-4 h-4" />
            <span>Chapter 02 · The Blue Oasis</span>
          </div>
          <h2 className="font-display font-normal text-4xl sm:text-6xl leading-[1.02] tracking-tight text-cosmos-white">
            In a vast universe, <em className="text-cosmos-cyan">this is our home.</em>
          </h2>
          <p className="font-body text-space-muted text-sm sm:text-base">
            Suspended in the quiet darkness of the cosmos, Earth is an active biosphere harboring liquid oceans and an oxygenated shield.
          </p>
        </div>

        {/* NASA Earth Reference Image */}
        <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10 group">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1200px-The_Blue_Marble_%28remastered%29.jpg"
            alt="The Blue Marble — Earth as seen from Apollo 17"
            className="w-full h-32 object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-space-cyan/90">
            Blue Marble • Apollo 17 / NASA
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="glass-panel-glow rounded-2xl p-4 border border-space-cyan/30 space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-space-cyan tracking-wider uppercase">
              Biosphere Terminal
            </span>
            <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HABITABLE ZONE
            </span>
          </div>

          {/* Day / Night Toggle */}
          <div className="glass-panel p-3 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-white">
                  Lighting Simulation
                </h4>
                <p className="font-body text-[11px] text-space-muted">
                  {nightMode ? 'Nocturnal City Glow' : 'Diurnal Solar Illumination'}
                </p>
              </div>
              <button
                onClick={() => setNightMode(!nightMode)}
                className={`p-2 rounded-xl flex items-center gap-1.5 transition-all border ${
                  nightMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-space-cyan/20 text-space-cyan border-space-cyan/40 shadow-[0_0_20px_rgba(72,207,255,0.3)]'
                }`}
                aria-label="Toggle day or night mode on Earth"
              >
                {nightMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-space-cyan" />}
                <span className="font-mono text-[10px] font-bold">
                  {nightMode ? 'NIGHT' : 'DAY'}
                </span>
              </button>
            </div>
          </div>

          {/* Moon Button */}
          <div className="glass-panel p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <h4 className="font-heading font-bold text-sm text-white">
                Luna (The Moon)
              </h4>
              <p className="font-body text-[11px] text-space-muted">
                3,474 km • 384,400 km orbit
              </p>
            </div>
            <button
              onClick={() => setMoonModalOpen(true)}
              className="px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-[#03050B] bg-gradient-to-r from-space-white to-space-cyan hover:brightness-110 transition-all shadow-[0_0_15px_rgba(72,207,255,0.3)]"
            >
              EXPLORE
            </button>
          </div>

          {/* Reflection */}
          <div className="p-3 rounded-xl bg-space-blue/40 border border-space-cyan/20">
            <p className="font-body text-xs text-space-white/90 italic leading-relaxed">
              Seen from the outer reaches of the solar system, our entire world appears as a solitary speck of light suspended in a sunbeam.
            </p>
            <div className="text-right font-mono text-[10px] text-space-cyan mt-1">
              — Cosmic Perspective
            </div>
          </div>
        </div>

        {/* 4 Educational Pillars — 2x2 grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-panel p-2.5 rounded-xl border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Droplets className="w-3 h-3" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white">Oceans</h4>
            <p className="font-body text-[10px] text-space-muted leading-relaxed">
              Liquid oceans cover 70.8% of surface, moderating climate extremes.
            </p>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Shield className="w-3 h-3" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white">Magnetosphere</h4>
            <p className="font-body text-[10px] text-space-muted leading-relaxed">
              Liquid iron convection drives a geodynamo deflecting solar wind.
            </p>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Globe className="w-3 h-3" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white">Atmosphere</h4>
            <p className="font-body text-[10px] text-space-muted leading-relaxed">
              78% N₂ / 21% O₂ shield absorbing harmful cosmic radiation.
            </p>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Heart className="w-3 h-3" />
            </div>
            <h4 className="font-heading font-bold text-xs text-white">Life</h4>
            <p className="font-body text-[10px] text-space-muted leading-relaxed">
              Silicate-carbon cycles maintain temperature across billions of years.
            </p>
          </div>
        </div>
      </div>

      {/* Moon Modal */}
      {moonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-glow max-w-lg w-full rounded-3xl p-6 border border-space-cyan/40 relative">
            <button
              onClick={() => setMoonModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-space-muted hover:text-white glass-panel"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-space-cyan uppercase mb-2">
              <Moon className="w-4 h-4" />
              <span>Earth's Natural Satellite</span>
            </div>

            <h3 className="font-heading font-black text-2xl text-white mb-1">
              The Moon (Luna)
            </h3>
            <p className="font-mono text-xs text-space-cyan mb-3">
              Mean Orbital Distance: 384,400 km • Synodic Period: 29.53 Days
            </p>

            <div className="space-y-2 font-body text-xs text-space-muted mb-5">
              <p>
                <strong className="text-white">Giant Impact Origin:</strong> Formed ~4.5 billion years ago when a Mars-sized proto-planet named Theia collided with early Earth.
              </p>
              <p>
                <strong className="text-white">Tidal Locking:</strong> Luna is tidally locked to Earth. Gravitational interactions stabilize Earth's 23.4° axial tilt.
              </p>
              <p>
                <strong className="text-white">Exploration:</strong> Twelve humans walked on the lunar surface during Apollo (1969–1972). NASA Artemis will establish a permanent presence.
              </p>
            </div>

            <button
              onClick={() => setMoonModalOpen(false)}
              className="w-full py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider text-[#03050B] bg-space-cyan hover:brightness-110 transition-all"
            >
              CLOSE LUNAR OBSERVATION
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
