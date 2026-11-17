import React, { useState } from 'react';
import { Layers, ArrowLeft, ArrowRight, Compass, Shield, Wind, Thermometer, Orbit, Disc, CheckCircle } from 'lucide-react';
import { PLANETS_DATA, PlanetData } from '../../data/planetsData';

interface Section04PlanetExplorationProps {
  selectedPlanet: PlanetData;
  onSelectPlanet: (planet: PlanetData) => void;
  onReturnToSolarSystem: () => void;
}

export const Section04PlanetExploration: React.FC<Section04PlanetExplorationProps> = ({
  selectedPlanet,
  onSelectPlanet,
  onReturnToSolarSystem,
}) => {
  const currentIndex = PLANETS_DATA.findIndex((p) => p.id === selectedPlanet.id);

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + PLANETS_DATA.length) % PLANETS_DATA.length;
    onSelectPlanet(PLANETS_DATA[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % PLANETS_DATA.length;
    onSelectPlanet(PLANETS_DATA[nextIdx]);
  };

  return (
    <section
      id="planet-exploration"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 pointer-events-auto"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Navigation Bar between Planets & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={onReturnToSolarSystem}
            className="glass-panel px-4 py-2 rounded-xl text-xs font-mono text-space-cyan hover:text-white border border-space-cyan/20 flex items-center gap-2 hover:border-space-cyan transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO SOLAR SYSTEM OVERVIEW</span>
          </button>

          {/* Quick Planet Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 max-w-full">
            {PLANETS_DATA.map((planet) => {
              const active = planet.id === selectedPlanet.id;
              return (
                <button
                  key={planet.id}
                  onClick={() => onSelectPlanet(planet)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-space-cyan text-[#03050B] font-bold border-space-cyan shadow-[0_0_12px_rgba(72,207,255,0.4)]'
                      : 'glass-panel text-space-muted hover:text-white border-white/10'
                  }`}
                >
                  {planet.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Planet Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Highlight Card & Controls */}
          <div className="lg:col-span-5 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-space-cyan/30 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-space-cyan tracking-widest uppercase">
                  PLANET 0{currentIndex + 1} OF 08
                </span>
                <span className="font-mono text-xs text-space-muted">
                  {selectedPlanet.classification}
                </span>
              </div>

              <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-2">
                {selectedPlanet.name}
              </h2>
              <p className="font-mono text-sm text-space-cyan tracking-wider mb-6">
                &ldquo;{selectedPlanet.tagline}&rdquo;
              </p>

              {/* Visual Highlights Box */}
              <div className="p-4 rounded-2xl bg-space-blue/50 border border-space-cyan/20 mb-6">
                <div className="flex items-center gap-2 font-mono text-xs text-space-cyan mb-2">
                  <Compass className="w-4 h-4" />
                  <span>Unique Visual Signatures</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-space-white/90 leading-relaxed">
                  {selectedPlanet.visualHighlights}
                </p>
              </div>

              {/* Scientific Summary */}
              <p className="font-body text-xs sm:text-sm text-space-muted leading-relaxed">
                {selectedPlanet.scientificSummary}
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
              <button
                onClick={handlePrev}
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-mono text-space-white hover:text-space-cyan flex items-center gap-2 border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>PREVIOUS</span>
              </button>
              <span className="font-mono text-xs text-space-muted">
                {selectedPlanet.name.toUpperCase()}
              </span>
              <button
                onClick={handleNext}
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-mono text-space-white hover:text-space-cyan flex items-center gap-2 border border-white/10"
              >
                <span>NEXT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: In-depth Scientific Parameters & Data Table */}
          <div className="lg:col-span-7 space-y-6">
            {/* Key Physical Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-4 rounded-2xl border-white/10">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-space-muted mb-1">
                  <Orbit className="w-3.5 h-3.5 text-space-cyan" />
                  <span>Sun Distance</span>
                </div>
                <div className="font-heading font-bold text-base sm:text-lg text-white">
                  {selectedPlanet.distanceFromSunMillionKm}M km
                </div>
                <div className="text-[10px] font-mono text-space-cyan mt-0.5">
                  {(selectedPlanet.distanceFromSunMillionKm / 149.6).toFixed(2)} AU
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-white/10">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-space-muted mb-1">
                  <Disc className="w-3.5 h-3.5 text-space-purple" />
                  <span>Diameter</span>
                </div>
                <div className="font-heading font-bold text-base sm:text-lg text-white">
                  {selectedPlanet.actualDiameterKm.toLocaleString()} km
                </div>
                <div className="text-[10px] font-mono text-space-purple mt-0.5">
                  {(selectedPlanet.actualDiameterKm / 12742).toFixed(2)} × Earth
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-white/10">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-space-muted mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Avg Temp</span>
                </div>
                <div className="font-heading font-bold text-base sm:text-lg text-white">
                  {selectedPlanet.averageTemperatureC}°C
                </div>
                <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                  {selectedPlanet.averageTemperatureC + 273.15} K
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-white/10">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-space-muted mb-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Known Moons</span>
                </div>
                <div className="font-heading font-bold text-base sm:text-lg text-white">
                  {selectedPlanet.moonsCount}
                </div>
                <div className="text-[10px] font-mono text-emerald-300 mt-0.5">
                  2024–2026 IAU
                </div>
              </div>
            </div>

            {/* Orbit & Rotation Detailed Metrics */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-mono text-xs text-space-muted">Orbital Period (Year Length):</span>
                <div className="font-heading font-bold text-xl text-space-white mt-1">
                  {selectedPlanet.orbitPeriodDays.toLocaleString()} Earth Days
                </div>
                <p className="font-mono text-[11px] text-space-cyan mt-0.5">
                  {(selectedPlanet.orbitPeriodDays / 365.25).toFixed(2)} Earth Years
                </p>
              </div>
              <div>
                <span className="font-mono text-xs text-space-muted">Sidereal Rotation Period (Day Length):</span>
                <div className="font-heading font-bold text-xl text-space-white mt-1">
                  {Math.abs(selectedPlanet.rotationPeriodHours).toFixed(1)} Hours
                </div>
                <p className="font-mono text-[11px] text-space-purple mt-0.5">
                  {selectedPlanet.rotationPeriodHours < 0 ? 'Retrograde (Clockwise)' : 'Prograde (Counter-Clockwise)'}
                </p>
              </div>
            </div>

            {/* Atmospheric Composition Breakdown */}
            <div className="glass-panel p-5 rounded-2xl border-white/10">
              <div className="flex items-center gap-2 font-mono text-xs text-space-cyan mb-3">
                <Wind className="w-4 h-4" />
                <span>Atmospheric Spectroscopic Composition</span>
              </div>
              {selectedPlanet.atmosphere.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedPlanet.atmosphere.map((gas) => (
                    <div key={gas.gas} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-space-white">{gas.gas}</span>
                        <span className="text-space-cyan font-bold">{gas.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-space-blue/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-space-cyan to-space-purple rounded-full"
                          style={{ width: `${Math.min(gas.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="font-mono text-xs text-space-muted italic">
                  Minimal atmospheric exosphere trace atoms only (surface exposed to space vacuum).
                </div>
              )}
            </div>

            {/* Key Discoveries & Exploration Missions */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-4">
              <div>
                <span className="font-mono text-xs text-space-cyan tracking-wider uppercase mb-2 block">
                  Groundbreaking Scientific Discoveries
                </span>
                <ul className="space-y-2">
                  {selectedPlanet.keyDiscoveries.map((discovery, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-body text-space-white/90">
                      <CheckCircle className="w-4 h-4 text-space-cyan shrink-0 mt-0.5" />
                      <span>{discovery}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="font-mono text-xs text-space-muted block mb-1">
                  Primary Exploration Missions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPlanet.explorationMissions.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-space-blue/60 text-[11px] font-mono text-space-white border border-white/10">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
