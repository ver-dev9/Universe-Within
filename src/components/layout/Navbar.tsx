import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, Menu, X, Compass, Orbit, Globe, Sparkles, Scale, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  currentSectionId: string;
  scrollProgress: number;
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
  scrollProgress,
  onNavigate,
  audioPlaying,
  onToggleAudio,
  audioVolume,
  onChangeVolume,
  isReducedMotion,
  onToggleReducedMotion,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'intro', label: 'Intro', icon: Sparkles },
    { id: 'deep-space', label: 'Deep Space', icon: Compass },
    { id: 'solar-system', label: 'Solar System', icon: Orbit },
    { id: 'planet-exploration', label: 'Planets', icon: Layers },
    { id: 'earth-special', label: 'Earth', icon: Globe },
    { id: 'beyond-planets', label: 'Phenomena', icon: Sparkles },
    { id: 'scale-universe', label: 'Scale', icon: Scale },
    { id: 'discoveries', label: 'Discoveries', icon: BookOpen },
    { id: 'final-vista', label: 'Sources', icon: BookOpen },
  ];

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
              const Icon = link.icon;
              const isActive = currentSectionId === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-space-cyan/15 text-space-cyan border border-space-cyan/30 shadow-[0_0_12px_rgba(72,207,255,0.2)]'
                      : 'text-space-muted hover:text-space-white hover:bg-space-blue/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
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

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-space-muted hover:text-white bg-space-blue/30 border border-white/10"
              aria-label="Toggle mobile menu"
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
                const Icon = link.icon;
                const isActive = currentSectionId === link.id;
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
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Scroll Progress Bar at Bottom of Navbar */}
      <div className="w-full h-[2px] bg-space-blue/40 mt-2">
        <div
          className="h-full bg-gradient-to-r from-space-cyan via-space-purple to-space-accent transition-all duration-150 ease-out shadow-[0_0_8px_#48CFFF]"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>
    </header>
  );
};
