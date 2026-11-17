import React, { useState } from 'react';
import { Compass, Info, Sparkles, Orbit, Radio } from 'lucide-react';
import { DEEP_SPACE_FACTS, DeepSpaceTopic } from '../../data/astronomicalFacts';

export const Section02DeepSpace: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<DeepSpaceTopic>(DEEP_SPACE_FACTS[0]);

  return (
    <section
      id="deep-space"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Compass className="w-4 h-4" />
            <span>CHAPTER 02 // THE DEEP COSMIC VOID</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-white">
            INFINITE. SILENT. EXTRAORDINARY.
          </h2>
          <p className="max-w-2xl font-body text-space-muted text-base sm:text-lg">
            Beyond the protective bubble of planetary atmospheres lies the boundless interstellar expanse—a tapestry woven with two trillion galaxies, cosmic filaments, and ancient starlight.
          </p>
        </div>

        {/* Interactive Deep Space Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Topic Selector Cards */}
          <div className="lg:col-span-5 space-y-3">
            {DEEP_SPACE_FACTS.map((topic) => {
              const isSelected = activeTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
                    isSelected
                      ? 'glass-panel-glow border-space-cyan/50 -translate-y-1'
                      : 'glass-panel hover:bg-space-blue/30 border-white/10 hover:border-space-cyan/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-space-cyan tracking-wider">
                      {topic.subtitle}
                    </span>
                    <span className="font-mono text-xs text-space-muted">
                      {topic.value}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-space-white mb-2">
                    {topic.title}
                  </h3>
                  <p className="font-body text-xs text-space-muted line-clamp-2">
                    {topic.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Scientific Observatory Panel */}
          <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-space-cyan/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-space-cyan/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase mb-4">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Astrophysical Telemetry Archive</span>
            </div>

            <div className="mb-6">
              <div className="font-mono text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-space-cyan via-white to-space-purple mb-2">
                {activeTopic.value}
              </div>
              <h4 className="font-heading font-bold text-2xl sm:text-3xl text-white">
                {activeTopic.title}
              </h4>
              <p className="font-mono text-xs text-space-cyan/80 mt-1">
                {activeTopic.subtitle}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="font-body text-sm sm:text-base text-space-white/90 leading-relaxed">
                {activeTopic.description}
              </p>

              <div className="p-4 rounded-xl bg-space-blue/50 border border-space-cyan/20">
                <div className="flex items-center gap-2 font-mono text-xs text-space-cyan mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Scientific Framework & Verification</span>
                </div>
                <p className="font-body text-xs text-space-muted">
                  {activeTopic.scientificContext}
                </p>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              <div className="glass-panel p-3 rounded-xl border-white/10 text-center">
                <div className="font-mono text-xs text-space-muted">Density</div>
                <div className="font-heading font-bold text-sm text-space-cyan mt-1">10⁻²⁴ g/cm³</div>
              </div>
              <div className="glass-panel p-3 rounded-xl border-white/10 text-center">
                <div className="font-mono text-xs text-space-muted">Cosmic Age</div>
                <div className="font-heading font-bold text-sm text-space-purple mt-1">13.787 Gyr</div>
              </div>
              <div className="glass-panel p-3 rounded-xl border-white/10 text-center">
                <div className="font-mono text-xs text-space-muted">CMB Temp</div>
                <div className="font-heading font-bold text-sm text-white mt-1">2.725 Kelvin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
