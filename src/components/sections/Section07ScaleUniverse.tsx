import React, { useState } from 'react';
import { Scale, Clock, Zap, ArrowLeft, ArrowRight, User, Globe, Disc, Sun, Orbit, Sparkles, Compass, Share2, Eye } from 'lucide-react';
import { SCALE_TIERS, ScaleTier } from '../../data/scaleData';

export const Section07ScaleUniverse: React.FC = () => {
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);
  const activeTier: ScaleTier = SCALE_TIERS[activeTierIndex];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-4 h-4 text-space-cyan" />;
      case 'Globe': return <Globe className="w-4 h-4 text-space-cyan" />;
      case 'Disc': return <Disc className="w-4 h-4 text-space-purple" />;
      case 'Sun': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Orbit': return <Orbit className="w-4 h-4 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-space-cyan" />;
      case 'Compass': return <Compass className="w-4 h-4 text-space-purple" />;
      case 'Share2': return <Share2 className="w-4 h-4 text-amber-300" />;
      case 'Eye': return <Eye className="w-4 h-4 text-space-cyan" />;
      default: return <Scale className="w-4 h-4 text-space-cyan" />;
    }
  };

  return (
    <section
      id="scale-universe"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      {/* Content pinned left ~45% max-w-xl — right side transparent for 3D canvas */}
      <div className="max-w-xl w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Scale className="w-4 h-4" />
            <span>CHAPTER 07 // LOGARITHMIC COSMIC ORDERS</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white">
            THE SCALE OF THE UNIVERSE
          </h2>
          <p className="font-body text-space-muted text-sm sm:text-base">
            From a 1.7-meter person to the 93-billion-light-year observable horizon, step through 27 orders of magnitude.
          </p>
        </div>

        {/* Scale Step Selector — scrollable horizontal */}
        <div className="glass-panel p-2.5 rounded-xl border border-space-cyan/20 mb-4 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-[480px]">
            {SCALE_TIERS.map((tier, idx) => {
              const isActive = idx === activeTierIndex;
              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveTierIndex(idx)}
                  className={`flex-1 py-1.5 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-0.5 border ${
                    isActive
                      ? 'bg-space-cyan text-[#03050B] font-bold border-space-cyan shadow-[0_0_15px_rgba(72,207,255,0.4)]'
                      : 'text-space-muted hover:text-white hover:bg-space-blue/30 border-transparent'
                  }`}
                >
                  <span className="font-mono text-[9px] uppercase">
                    10^{tier.exponentMeters.toFixed(0)}m
                  </span>
                  <span className="font-heading text-[10px] font-semibold truncate w-full text-center">
                    {tier.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tier Card */}
        <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 border border-space-cyan/30 space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-space-blue/60 border border-space-cyan/30">
                {getIcon(activeTier.visualIconName)}
              </div>
              <span className="font-mono text-xs text-space-cyan tracking-wider uppercase">
                STEP 0{activeTierIndex + 1} OF 09
              </span>
            </div>
            <span className="font-mono text-[10px] text-space-muted">
              10^{activeTier.exponentMeters.toFixed(1)}m
            </span>
          </div>

          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-space-cyan via-white to-space-purple mb-0.5">
              {activeTier.formattedScale}
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-white">
              {activeTier.name}
            </h3>
          </div>

          <p className="font-body text-xs sm:text-sm text-space-white/90 leading-relaxed">
            {activeTier.description}
          </p>

          {/* Facts */}
          <div className="space-y-1 border-t border-white/10 pt-2.5">
            {activeTier.facts.map((fact, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs font-body text-space-muted">
                <span className="text-space-cyan mt-0.5">•</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>

          {/* Previous / Next */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <button
              disabled={activeTierIndex === 0}
              onClick={() => setActiveTierIndex((prev) => Math.max(0, prev - 1))}
              className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-space-white hover:text-space-cyan disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>SMALLER</span>
            </button>
            <button
              disabled={activeTierIndex === SCALE_TIERS.length - 1}
              onClick={() => setActiveTierIndex((prev) => Math.min(SCALE_TIERS.length - 1, prev + 1))}
              className="glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-space-white hover:text-space-cyan disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 border border-white/10"
            >
              <span>LARGER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Comparative Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-panel p-3 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-space-cyan uppercase">
              <Clock className="w-3.5 h-3.5" />
              <span>Photon Travel Time</span>
            </div>
            <div className="font-heading font-black text-base text-white">
              {activeTier.lightTravelTime}
            </div>
            <p className="font-body text-[10px] text-space-muted">
              At 299,792 km/s
            </p>
          </div>

          <div className="glass-panel p-3 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-space-purple uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Human Ratio</span>
            </div>
            <div className="font-mono text-xs font-bold text-space-cyan">
              {activeTier.metricComparison}
            </div>
            <p className="font-body text-[10px] text-space-muted">
              vs 1.7m human
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
