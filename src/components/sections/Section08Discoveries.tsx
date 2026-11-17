import React, { useState } from 'react';
import { BookOpen, ExternalLink, CheckCircle, Award } from 'lucide-react';
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
      {/* Content pinned left ~45% max-w-xl — right side transparent for 3D canvas */}
      <div className="max-w-xl w-full">
        {/* Section Header */}
        <div className="space-y-3 mb-5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase">
            <BookOpen className="w-4 h-4" />
            <span>CHAPTER 08 // FRONTIERS OF HUMAN INQUIRY</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white">
            COSMIC DISCOVERIES
          </h2>
          <p className="font-body text-space-muted text-sm sm:text-base">
            Instruments and theoretical breakthroughs that redefined our place in the cosmos.
          </p>
        </div>

        {/* JWST Pillars of Creation Reference Image */}
        <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10 group">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Webb%27s_NIRCam_image_of_the_Pillars_of_Creation.png/1200px-Webb%27s_NIRCam_image_of_the_Pillars_of_Creation.png"
            alt="Pillars of Creation — JWST NIRCam"
            className="w-full h-36 object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-space-cyan/90">
            Pillars of Creation • JWST / NASA / ESA / CSA
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 flex-wrap mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                selectedCategory === cat
                  ? 'bg-space-cyan text-[#03050B] font-bold border-space-cyan shadow-[0_0_12px_rgba(72,207,255,0.3)]'
                  : 'glass-panel text-space-muted hover:text-white border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Discovery Cards — single column list optimized for sidebar layout */}
        <div className="space-y-3">
          {filteredDiscoveries.map((discovery) => (
            <div
              key={discovery.id}
              className="glass-panel glass-card-hover rounded-2xl p-4 border border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-space-cyan uppercase tracking-wider">
                  {discovery.agency} • {discovery.yearLaunchedOrDiscovered}
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-space-blue/80 text-space-muted border border-white/10">
                  {discovery.status}
                </span>
              </div>

              <h3 className="font-heading font-bold text-sm sm:text-base text-white mb-2">
                {discovery.title}
              </h3>

              {/* Metric */}
              <div className="p-2.5 rounded-xl bg-space-blue/50 border border-space-cyan/20 mb-2.5 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-space-muted">{discovery.metricLabel}</div>
                  <div className="font-heading font-black text-sm text-space-cyan">{discovery.highlightMetric}</div>
                </div>
                <Award className="w-4 h-4 text-space-cyan/60" />
              </div>

              <p className="font-body text-xs text-space-white/90 leading-relaxed mb-2.5">
                {discovery.summary}
              </p>

              {/* Breakthroughs */}
              <div className="space-y-1 border-t border-white/10 pt-2 mb-2.5">
                <span className="font-mono text-[9px] text-space-cyan tracking-wider uppercase block mb-1">
                  Verified Breakthroughs:
                </span>
                {discovery.scientificBreakthroughs.map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] font-body text-space-muted">
                    <CheckCircle className="w-3.5 h-3.5 text-space-cyan shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Link */}
              <div className="border-t border-white/10 pt-2">
                <a
                  href={discovery.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-space-cyan hover:underline group"
                >
                  <span>Official Mission Archives</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
