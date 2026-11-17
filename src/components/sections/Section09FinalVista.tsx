import React from 'react';
import { Sparkles, RotateCcw, ExternalLink, Github, Code, Layers, ShieldCheck, Heart } from 'lucide-react';
import { SCIENTIFIC_SOURCES } from '../../data/sourcesData';

interface Section09FinalVistaProps {
  onBackToTop: () => void;
  onExploreAgain: () => void;
}

export const Section09FinalVista: React.FC<Section09FinalVistaProps> = ({
  onBackToTop,
  onExploreAgain,
}) => {
  return (
    <section
      id="final-vista"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Philosophical Cosmic Conclusion */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-space-blue/60 border border-space-cyan/30 text-space-cyan font-mono text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHAPTER 09 // COSMIC CONVERGENCE</span>
          </div>

          <h2 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-tight">
            WE ARE NOT JUST LOOKING AT THE UNIVERSE.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-space-cyan via-space-white to-space-purple text-glow-cyan">
              WE ARE PART OF IT.
            </span>
          </h2>

          <p className="max-w-2xl mx-auto font-body text-base sm:text-lg text-space-muted font-light leading-relaxed">
            &ldquo;Every star tells a story. Every planet holds a mystery. And every discovery reminds us how much remains unknown.&rdquo;
          </p>

          {/* Action Navigation Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreAgain}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-heading font-bold text-xs tracking-widest text-[#03050B] bg-space-cyan hover:brightness-110 transition-all shadow-[0_0_25px_rgba(72,207,255,0.4)] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>EXPLORE AGAIN</span>
            </button>

            <button
              onClick={onBackToTop}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-xs tracking-wider text-space-white glass-panel hover:bg-space-blue/40 border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>BACK TO BEGINNING</span>
            </button>
          </div>
        </div>

        {/* Dedicated Scientific Sources & References Section (Section 8 requirement) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-space-cyan/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-space-cyan tracking-widest uppercase mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Scientific Attribution</span>
              </div>
              <h3 className="font-heading font-bold text-2xl text-white">
                SOURCES & ASTRONOMICAL REFERENCES
              </h3>
            </div>
            <p className="font-mono text-xs text-space-muted max-w-sm">
              All astronomical values, orbital ephemerides, and chemical compositions are cross-referenced directly against published peer-reviewed datasets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCIENTIFIC_SOURCES.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-space-cyan/40 hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-space-cyan tracking-wider">
                      {source.organization}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-space-muted group-hover:text-space-cyan transition-colors" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-white group-hover:text-space-cyan transition-colors mb-2">
                    {source.name}
                  </h4>
                  <p className="font-body text-xs text-space-muted mb-3">
                    {source.purpose}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 border-t border-white/10 pt-2">
                  {source.verifiedFields.map((f, i) => (
                    <span key={i} className="text-[10px] font-mono text-space-cyan/80 bg-space-blue/60 px-1.5 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Technical Architecture & Portfolio Project Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Engineering Showcase & Technology Stack */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-space-purple tracking-widest uppercase">
              <Code className="w-4 h-4" />
              <span>Technical Engineering Architecture</span>
            </div>
            <h4 className="font-heading font-bold text-xl text-white">
              Built with Modern Creative Development Standards
            </h4>
            <p className="font-body text-xs sm:text-sm text-space-muted leading-relaxed">
              Designed as a major showcase for university admissions and technical engineering portfolios. Engineered with strict separation of concerns across 3D GPU shaders, procedural canvas textures, state machines, and real-time Web Audio API procedural synthesis.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-space-blue/40 border border-white/10 text-xs font-mono text-space-white">
                React 18 + Vite
              </div>
              <div className="p-2.5 rounded-xl bg-space-blue/40 border border-white/10 text-xs font-mono text-space-white">
                Three.js + R3F
              </div>
              <div className="p-2.5 rounded-xl bg-space-blue/40 border border-white/10 text-xs font-mono text-space-white">
                TypeScript Strict
              </div>
              <div className="p-2.5 rounded-xl bg-space-blue/40 border border-white/10 text-xs font-mono text-space-white">
                Custom GLSL Shaders
              </div>
              <div className="p-2.5 rounded-xl bg-space-blue/40 border border-white/10 text-xs font-mono text-space-white">
                Tailwind CSS 3
              </div>
              <div className="p-2.5 rounded-xl bg-space-blue/40 border border-white/10 text-xs font-mono text-space-white">
                Web Audio Synthesizer
              </div>
            </div>
          </div>

          {/* GitHub Repository & Developer Statement Card */}
          <div className="lg:col-span-5 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-space-cyan/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-space-cyan tracking-wider uppercase">
                <Github className="w-4 h-4" />
                <span>Open Source Repository</span>
              </div>
              <h4 className="font-heading font-bold text-2xl text-white">
                universe-within-3d
              </h4>
              <p className="font-body text-xs sm:text-sm text-space-muted leading-relaxed">
                Complete production source code, comprehensive architectural documentation, GLSL shader formulas, and performance tuning specifications ready for deployment.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="text-xs font-mono text-space-cyan">
                STATUS: PRODUCTION READY (60 FPS TARGET)
              </div>
              <div className="text-[11px] font-mono text-space-muted">
                MIT License • Zero Commercial Stock Imagery
              </div>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="text-center font-mono text-xs text-space-muted/60 pt-8 border-t border-white/10">
          <p>© 2026 UNIVERSE WITHIN — A Journey Beyond the Visible. All Astronomical Figures NASA & ESA Aligned.</p>
        </div>
      </div>
    </section>
  );
};
