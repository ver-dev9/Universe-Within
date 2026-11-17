import React from 'react';
import { ArrowDown, Sparkles, Compass } from 'lucide-react';

interface Section01IntroProps {
  onEnter: () => void;
  onExploreClick: () => void;
}

export const Section01Intro: React.FC<Section01IntroProps> = ({
  onEnter,
  onExploreClick,
}) => {
  return (
    <section
      id="intro"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-auto"
    >
      <div className="max-w-4xl mx-auto space-y-6 pt-20">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-space-blue/60 border border-space-cyan/30 text-space-cyan font-mono text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(72,207,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive 3D Astrophotographic Odyssey</span>
        </div>

        {/* Master Heading */}
        <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-space-white to-space-muted drop-shadow-[0_0_35px_rgba(72,207,255,0.35)]">
          UNIVERSE WITHIN
        </h1>

        {/* Core Tagline */}
        <p className="font-heading font-semibold text-xl sm:text-2xl lg:text-3xl tracking-[0.25em] text-space-cyan uppercase text-glow-cyan">
          A Journey Beyond the Visible
        </p>

        {/* Cinematic Introductory Statement */}
        <p className="max-w-2xl mx-auto font-body text-base sm:text-lg text-space-muted font-light leading-relaxed">
          &ldquo;Somewhere in the infinite darkness, an extraordinary universe is waiting to be explored.
          Look closer. Explore deeper. Discover the extraordinary.&rdquo;
        </p>

        {/* Main Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              onEnter();
              onExploreClick();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-heading font-bold text-sm tracking-widest text-[#03050B] bg-gradient-to-r from-space-cyan via-space-accent to-space-purple hover:brightness-110 transition-all duration-300 shadow-[0_0_30px_rgba(72,207,255,0.4)] flex items-center justify-center gap-3 group"
          >
            <span>ENTER THE UNIVERSE</span>
            <Sparkles className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </button>

          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-xs tracking-wider text-space-white glass-panel hover:bg-space-blue/40 border border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-space-cyan" />
            <span>DISCOVER CHAPTERS</span>
          </button>
        </div>

        {/* Scientific Credential Tag */}
        <div className="pt-8 flex items-center justify-center gap-6 text-[11px] font-mono text-space-muted/70">
          <span>NASA & ESA VERIFIED DATA</span>
          <span>•</span>
          <span>REALISTIC CELESTIAL MECHANICS</span>
          <span>•</span>
          <span>GPU SHADER VFX</span>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <button
        onClick={onExploreClick}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-space-muted hover:text-space-cyan transition-colors group cursor-pointer"
        aria-label="Scroll to begin journey"
      >
        <span className="font-mono text-[10px] tracking-widest uppercase">Begin Exploration</span>
        <div className="w-8 h-12 rounded-full border border-space-cyan/30 flex items-start justify-center p-1.5 group-hover:border-space-cyan transition-colors">
          <div className="w-1.5 h-3 rounded-full bg-space-cyan animate-bounce" />
        </div>
        <ArrowDown className="w-3.5 h-3.5 animate-pulse text-space-cyan" />
      </button>
    </section>
  );
};
