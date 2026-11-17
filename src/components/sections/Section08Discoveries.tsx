import React, { useState } from 'react';
import { BookOpen, ExternalLink, CheckCircle, Radio, Filter, Award } from 'lucide-react';
import { COSMIC_DISCOVERIES, CosmicDiscovery } from '../../data/discoveriesData';

export const Section08Discoveries: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Observatory', 'Deep Space Probe', 'Planetary Mission', 'Astrophysics Discovery'];

  const filteredDiscoveries = selectedCategory === 'All'
    ? COSMIC_DISCOVERIES
    : COSMIC_DISCOVERIES.filter((d) => d.category === selectedCategory);

  return (
    <section
      id="discoveries"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
              <BookOpen className="w-4 h-4" />
              <span>CHAPTER 08 // FRONTIERS OF HUMAN INQUIRY</span>
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-white">
              COSMIC DISCOVERIES
            </h2>
            <p className="font-body text-space-muted text-base sm:text-lg">
              Instruments and theoretical breakthroughs that redefined our place in the cosmos. Every discovery distinguishes empirical observations from ongoing theoretical investigations.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedCategory === cat
                    ? 'bg-space-cyan text-[#03050B] font-bold border-space-cyan shadow-[0_0_12px_rgba(72,207,255,0.3)]'
                    : 'glass-panel text-space-muted hover:text-white border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Discovery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscoveries.map((discovery) => (
            <div
              key={discovery.id}
              className="glass-panel glass-card-hover rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] text-space-cyan uppercase tracking-wider">
                    {discovery.agency} • {discovery.yearLaunchedOrDiscovered}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-space-blue/80 text-space-muted border border-white/10">
                    {discovery.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-xl text-white mb-2">
                  {discovery.title}
                </h3>

                {/* Highlight Metric Pill */}
                <div className="p-3 rounded-2xl bg-space-blue/50 border border-space-cyan/20 mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-space-muted">
                      {discovery.metricLabel}
                    </div>
                    <div className="font-heading font-black text-lg text-space-cyan">
                      {discovery.highlightMetric}
                    </div>
                  </div>
                  <Award className="w-5 h-5 text-space-cyan/60" />
                </div>

                {/* Summary */}
                <p className="font-body text-xs sm:text-sm text-space-white/90 leading-relaxed mb-4">
                  {discovery.summary}
                </p>

                {/* Breakthroughs List */}
                <div className="space-y-1.5 border-t border-white/10 pt-3 mb-4">
                  <span className="font-mono text-[10px] text-space-cyan tracking-wider uppercase block mb-1">
                    Verified Breakthroughs:
                  </span>
                  {discovery.scientificBreakthroughs.map((breakthrough, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-body text-space-muted">
                      <CheckCircle className="w-3.5 h-3.5 text-space-cyan shrink-0 mt-0.5" />
                      <span>{breakthrough}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clickable NASA / Science Reference Link */}
              <div className="border-t border-white/10 pt-3">
                <a
                  href={discovery.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-space-cyan hover:underline group"
                >
                  <span>Official Mission Archives</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
