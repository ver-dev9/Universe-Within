import React, { useState } from 'react';
import { Compass, Info, Radio } from 'lucide-react';
import { DEEP_SPACE_FACTS, DeepSpaceTopic } from '../../data/astronomicalFacts';

export const Section02DeepSpace: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<DeepSpaceTopic>(DEEP_SPACE_FACTS[0]);

  return (
    <section
      id="deep-space"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      {/* Content pinned to left side — right side stays transparent for 3D canvas */}
      <div className="max-w-xl w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Compass className="w-4 h-4" />
            <span>CHAPTER 02 // THE DEEP COSMIC VOID</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white">
            INFINITE. SILENT. EXTRAORDINARY.
          </h2>
          <p className="font-body text-space-muted text-sm sm:text-base">
            Beyond planetary atmospheres lies the boundless interstellar expanse—a tapestry of two trillion galaxies, cosmic filaments, and ancient starlight.
          </p>
        </div>

        {/* NASA Deep Field Reference Image */}
        <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/10 group">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Hubble_ultra_deep_field_high_rez_edit1.jpg/1280px-Hubble_ultra_deep_field_high_rez_edit1.jpg"
            alt="Hubble Ultra Deep Field — thousands of galaxies in a tiny patch of sky"
            className="w-full h-36 object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-space-cyan/90">
            Hubble Ultra Deep Field • NASA/ESA/STScI
          </div>
        </div>

        {/* Topic Selector Cards — compact vertical list */}
        <div className="space-y-2 mb-5">
          {DEEP_SPACE_FACTS.map((topic) => {
            const isSelected = activeTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 border ${
                  isSelected
                    ? 'glass-panel-glow border-space-cyan/50 -translate-y-0.5'
                    : 'glass-panel hover:bg-space-blue/30 border-white/10 hover:border-space-cyan/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-space-cyan tracking-wider">
                    {topic.subtitle}
                  </span>
                  <span className="font-mono text-xs text-space-muted">
                    {topic.value}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-space-white mb-0.5">
                  {topic.title}
                </h3>
                <p className="font-body text-xs text-space-muted line-clamp-1">
                  {topic.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed Scientific Panel for Active Topic */}
        <div className="glass-panel-glow rounded-2xl p-5 border border-space-cyan/30 relative overflow-hidden">
          <div className="flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase mb-3">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Astrophysical Telemetry Archive</span>
          </div>

          <div className="mb-3">
            <div className="font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-space-cyan via-white to-space-purple mb-1">
              {activeTopic.value}
            </div>
            <h4 className="font-heading font-bold text-lg text-white">
              {activeTopic.title}
            </h4>
            <p className="font-mono text-xs text-space-cyan/80">
              {activeTopic.subtitle}
            </p>
          </div>

          <div className="space-y-2.5 mb-4">
            <p className="font-body text-xs sm:text-sm text-space-white/90 leading-relaxed">
              {activeTopic.description}
            </p>

            <div className="p-3 rounded-xl bg-space-blue/50 border border-space-cyan/20">
              <div className="flex items-center gap-2 font-mono text-xs text-space-cyan mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>Scientific Framework</span>
              </div>
              <p className="font-body text-xs text-space-muted">
                {activeTopic.scientificContext}
              </p>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
            <div className="glass-panel p-2 rounded-xl border-white/10 text-center">
              <div className="font-mono text-[10px] text-space-muted">Density</div>
              <div className="font-heading font-bold text-xs text-space-cyan mt-0.5">10⁻²⁴ g/cm³</div>
            </div>
            <div className="glass-panel p-2 rounded-xl border-white/10 text-center">
              <div className="font-mono text-[10px] text-space-muted">Cosmic Age</div>
              <div className="font-heading font-bold text-xs text-space-purple mt-0.5">13.787 Gyr</div>
            </div>
            <div className="glass-panel p-2 rounded-xl border-white/10 text-center">
              <div className="font-mono text-[10px] text-space-muted">CMB Temp</div>
              <div className="font-heading font-bold text-xs text-white mt-0.5">2.725 K</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
