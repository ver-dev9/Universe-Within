import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, Menu, X, Gauge } from 'lucide-react';
import { liveChapters, chapterForSection } from '../../data/chapters';
import { useCosmosStore } from '../../store/useCosmosStore';
import type { QualityLevel } from '../../utils/quality';

interface NavbarProps {
  currentSectionId: string;
  onNavigate: (sectionId: string) => void;
  audioPlaying: boolean;
  onToggleAudio: () => void;
  audioVolume: number;
  onChangeVolume: (vol: number) => void;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSectionId,
  onNavigate,
  audioPlaying,
  onToggleAudio,
  audioVolume,
  onChangeVolume,
  isReducedMotion,
  onToggleReducedMotion,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const quality = useCosmosStore((st) => st.quality);
  const setQuality = useCosmosStore((st) => st.setQuality);
  const activeChapter = chapterForSection(currentSectionId)?.number;

  // Navigation is generated from the chapter registry; only built chapters appear.
  const navLinks = liveChapters().map((c) => ({
    id: c.sectionId,
    number: c.number,
    label: c.label,
  }));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Glass Top Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="glass-panel rounded-2xl px-5 py-3.5 flex items-center justify-between border border-space-cyan/20">
          {/* Logo & Identity */}
          <button
            onClick={() => onNavigate('intro')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-space-blue/80 border border-space-cyan/40 flex items-center justify-center relative overflow-hidden group-hover:border-space-cyan transition-colors shadow-[0_0_15px_rgba(72,207,255,0.25)]">
              <span className="w-3.5 h-3.5 rounded-full bg-space-cyan animate-pulse-slow"></span>
              <span className="absolute inset-0 border border-space-purple/30 rounded-xl transform rotate-45"></span>
            </div>
            <div>
              <div className="font-heading font-bold text-sm tracking-[0.2em] text-space-white group-hover:text-space-cyan transition-colors">
                UNIVERSE WITHIN
              </div>
              <div className="text-[10px] font-mono tracking-wider text-space-muted">
                A JOURNEY BEYOND THE VISIBLE
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeChapter === link.number;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-baseline gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-cosmos-white' : 'text-cosmos-muted hover:text-cosmos-white'
                  }`}
                >
                  <span className={isActive ? 'text-cosmos-cyan' : 'text-cosmos-muted/60'}>{String(link.number).padStart(2, '0')}</span>
                  <span className="hidden 2xl:inline">{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Controls: Audio + Reduced Motion */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={onToggleAudio}
                className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
                  audioPlaying
                    ? 'bg-space-cyan/15 text-space-cyan border-space-cyan/40 shadow-[0_0_15px_rgba(72,207,255,0.25)]'
                    : 'bg-space-blue/30 text-space-muted border-white/10 hover:text-white'
                }`}
                title={audioPlaying ? 'Mute ambient space drone' : 'Enable ambient cosmic sound'}
                aria-label="Toggle ambient cosmic sound"
              >
                {audioPlaying ? (
                  <>
                    <Volume2 className="w-4 h-4 text-space-cyan animate-pulse" />
                    <span className="hidden sm:inline font-mono text-[11px]">AUDIO ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span className="hidden sm:inline font-mono text-[11px]">MUTED</span>
                  </>
                )}
              </button>

              {/* Volume Slider (shows when audio is playing on desktop) */}
              {audioPlaying && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="hidden md:block w-16 h-1 bg-space-blue rounded-lg accent-space-cyan cursor-pointer"
                  title="Adjust ambient volume"
                />
              )}
            </div>

            {/* Accessibility: Reduced Motion Toggle */}
            <button
              onClick={onToggleReducedMotion}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
                isReducedMotion
                  ? 'bg-space-purple/20 text-space-purple border-space-purple/40'
                  : 'bg-space-blue/30 text-space-muted border-white/10 hover:text-white'
              }`}
              title={isReducedMotion ? 'Reduced motion enabled' : 'Toggle reduced motion'}
              aria-label="Toggle reduced motion"
            >
              {isReducedMotion ? (
                <>
                  <EyeOff className="w-4 h-4 text-space-purple" />
                  <span className="hidden sm:inline font-mono text-[11px]">REDUCED MOTION</span>
                </>
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            {/* Rendering quality */}
            <label className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl border border-white/10 bg-space-blue/30 text-space-muted">
              <Gauge className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Rendering quality</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as QualityLevel, true)}
                className="bg-transparent font-mono text-[11px] uppercase tracking-wider text-cosmos-white focus:outline-none cursor-pointer"
              >
                <option value="high" className="bg-cosmos-deep">High</option>
                <option value="medium" className="bg-cosmos-deep">Medium</option>
                <option value="low" className="bg-cosmos-deep">Low</option>
              </select>
            </label>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-space-muted hover:text-white bg-space-blue/30 border border-white/10"
              aria-label="Toggle chapter menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 glass-panel rounded-2xl p-4 border border-space-cyan/20 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = activeChapter === link.number;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-mono tracking-wider transition-colors ${
                      isActive
                        ? 'bg-space-cyan/20 text-space-cyan border border-space-cyan/30'
                        : 'text-space-muted hover:text-white hover:bg-space-blue/30'
                    }`}
                  >
                    <span className="text-cosmos-cyan/80">{String(link.number).padStart(2, '0')}</span>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </header>
  );
};
