import React, { useState } from 'react';
import { Scale, Clock, Zap, ArrowLeft, ArrowRight, User, Globe, Disc, Sun, Orbit, Sparkles, Compass, Share2, Eye } from 'lucide-react';
import { SCALE_TIERS, ScaleTier } from '../../data/scaleData';

export const Section07ScaleUniverse: React.FC = () => {
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);
  const activeTier: ScaleTier = SCALE_TIERS[activeTierIndex];

  // Map icon names to Lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-5 h-5 text-space-cyan" />;
      case 'Globe': return <Globe className="w-5 h-5 text-space-cyan" />;
      case 'Disc': return <Disc className="w-5 h-5 text-space-purple" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Orbit': return <Orbit className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-space-cyan" />;
      case 'Compass': return <Compass className="w-5 h-5 text-space-purple" />;
      case 'Share2': return <Share2 className="w-5 h-5 text-amber-300" />;
      case 'Eye': return <Eye className="w-5 h-5 text-space-cyan" />;
      default: return <Scale className="w-5 h-5 text-space-cyan" />;
    }
  };

  return (
    <section
      id="scale-universe"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <Scale className="w-4 h-4" />
            <span>CHAPTER 07 // LOGARITHMIC COSMIC ORDERS</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-white">
            THE SCALE OF THE UNIVERSE
          </h2>
          <p className="font-body text-space-muted text-base sm:text-lg">
            Human intuition fails across cosmic dimensions. From a 1.7-meter person to the 93-billion-light-year observable cosmic horizon, step through 27 orders of magnitude of physical reality.
          </p>
        </div>

        {/* Interactive Scale Stepper / Track */}
        <div className="glass-panel p-4 rounded-2xl border border-space-cyan/20 mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {SCALE_TIERS.map((tier, idx) => {
              const isActive = idx === activeTierIndex;
              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveTierIndex(idx)}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-center transition-all flex flex-col items-center gap-1 border ${
                    isActive
                      ? 'bg-space-cyan text-[#03050B] font-bold border-space-cyan shadow-[0_0_15px_rgba(72,207,255,0.4)]'
                      : 'text-space-muted hover:text-white hover:bg-space-blue/30 border-transparent'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase">
                    10^{tier.exponentMeters.toFixed(0)}m
                  </span>
                  <span className="font-heading text-xs font-semibold truncate w-full text-center">
                    {tier.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Scale Tier Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Dimension Display */}
          <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 sm:p-10 border border-space-cyan/30 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-space-blue/60 border border-space-cyan/30">
                  {getIcon(activeTier.visualIconName)}
                </div>
                <span className="font-mono text-xs text-space-cyan tracking-wider uppercase">
                  STEP 0{activeTierIndex + 1} OF 09
                </span>
              </div>
              <span className="font-mono text-xs text-space-muted">
                10^{activeTier.exponentMeters.toFixed(1)} METERS
              </span>
            </div>

            <div>
              <div className="font-mono text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-space-cyan via-white to-space-purple mb-2">
                {activeTier.formattedScale}
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                {activeTier.name}
              </h3>
            </div>

            <p className="font-body text-sm sm:text-base text-space-white/90 leading-relaxed">
              {activeTier.description}
            </p>

            {/* Scientific Facts Bullets */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              {activeTier.facts.map((fact, i) => (
                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm font-body text-space-muted">
                  <span className="text-space-cyan mt-1">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>

            {/* Previous / Next Stepper Controls */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <button
                disabled={activeTierIndex === 0}
                onClick={() => setActiveTierIndex((prev) => Math.max(0, prev - 1))}
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-mono text-space-white hover:text-space-cyan disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ZOOM IN (SMALLER)</span>
              </button>
              <button
                disabled={activeTierIndex === SCALE_TIERS.length - 1}
                onClick={() => setActiveTierIndex((prev) => Math.min(SCALE_TIERS.length - 1, prev + 1))}
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-mono text-space-white hover:text-space-cyan disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 border border-white/10"
              >
                <span>ZOOM OUT (LARGER)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Comparative Metrics */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-space-cyan uppercase">
                <Clock className="w-4 h-4" />
                <span>Photon Travel Duration (Speed of Light)</span>
              </div>
              <div className="font-heading font-black text-2xl sm:text-3xl text-white">
                {activeTier.lightTravelTime}
              </div>
              <p className="font-body text-xs text-space-muted">
                At 299,792 km/s, a light photon takes this exact duration to traverse this scale boundary.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-space-purple uppercase">
                <Zap className="w-4 h-4" />
                <span>Human Proportional Ratio</span>
              </div>
              <div className="font-mono text-lg font-bold text-space-cyan">
                {activeTier.metricComparison}
              </div>
              <p className="font-body text-xs text-space-muted">
                Comparing the dimensions of a 1.7m human observer to this astronomical magnitude.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
