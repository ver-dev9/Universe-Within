import React, { useState, useCallback } from 'react';
import { LoadingScreen } from './components/loading/LoadingScreen';
import { ScrollProgressBar } from './components/navigation/ScrollProgressBar';
import { ChapterRail } from './components/navigation/ChapterRail';
import { CustomCursor } from './components/interactive/CustomCursor';
import { CosmicCanvas } from './scenes/CosmicCanvas';
import { Navbar } from './components/layout/Navbar';
import { HudTelemetry } from './components/layout/HudTelemetry';
import { Section01Intro } from './components/sections/Section01Intro';
import { Section02DeepSpace } from './components/sections/Section02DeepSpace';
import { Section03SolarSystem } from './components/sections/Section03SolarSystem';
import { Section04PlanetExploration } from './components/sections/Section04PlanetExploration';
import { Section05EarthSpecial } from './components/sections/Section05EarthSpecial';
import { Section06BeyondPlanets } from './components/sections/Section06BeyondPlanets';
import { Section07ScaleUniverse } from './components/sections/Section07ScaleUniverse';
import { Section08Discoveries } from './components/sections/Section08Discoveries';
import { Section09FinalVista } from './components/sections/Section09FinalVista';
import { PLANETS_DATA, PlanetData } from './data/planetsData';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useCosmosStore } from './store/useCosmosStore';

export function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData>(PLANETS_DATA[2]); // Default to Earth

  const { isReducedMotion, toggleReducedMotion } = useReducedMotion();
  const { currentSectionId, scrollToSection } = useScrollProgress();
  const audioEngine = useAudioEngine();

  const handleEnterUniverse = useCallback(() => {
    setHasEntered(true);
    audioEngine.playWarpSound();
  }, [audioEngine]);

  /**
   * Planet selection from the 3D scene or the Chapter 02 selector.
   * In Chapter 02 it flies the camera to the planet; in the planet chapter it
   * just switches planet; anywhere else it brings the visitor to Chapter 02.
   */
  const handleSelectPlanet = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
    audioEngine.playClickFeedback();
    const { activeSection, setFocusedPlanet } = useCosmosStore.getState();
    setFocusedPlanet(planet.id);
    if (activeSection !== 'solar-system' && activeSection !== 'planet-exploration') {
      scrollToSection('solar-system');
    }
  }, [audioEngine, scrollToSection]);

  /** Section 04 switcher: change planet without leaving the section. */
  const handleSwitchPlanet = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
    audioEngine.playClickFeedback();
    useCosmosStore.getState().setFocusedPlanet(planet.id);
  }, [audioEngine]);

  const handleDeepDive = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
    scrollToSection('planet-exploration');
  }, [scrollToSection]);

  const handleExploreAgain = useCallback(() => {
    audioEngine.playWarpSound();
    scrollToSection('solar-system');
  }, [audioEngine, scrollToSection]);

  const handleBackToTop = useCallback(() => {
    audioEngine.playClickFeedback();
    scrollToSection('intro');
  }, [audioEngine, scrollToSection]);

  return (
    <div className="relative min-h-screen bg-cosmos-void text-cosmos-white selection:bg-cosmos-cyan/30">
      <a
        href="#main-journey"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:px-4 focus:py-2 focus:bg-cosmos-deep focus:text-cosmos-white"
      >
        Skip to content
      </a>
      <LoadingScreen />
      <ScrollProgressBar />
      <CustomCursor />
      {/* Three.js 3D Cosmic Background Canvas */}
      <CosmicCanvas
        selectedPlanet={selectedPlanet}
        onSelectPlanet={handleSelectPlanet}
        reducedMotion={isReducedMotion}
      />

      {/* Floating HUD Telemetry Overlay */}
      <HudTelemetry currentSectionId={currentSectionId} />
      <ChapterRail onNavigate={scrollToSection} />

      {/* Navigation Header */}
      <Navbar
        currentSectionId={currentSectionId}
        onNavigate={scrollToSection}
        audioPlaying={audioEngine.isPlaying}
        onToggleAudio={audioEngine.toggleSound}
        audioVolume={audioEngine.volume}
        onChangeVolume={audioEngine.setVolume}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={toggleReducedMotion}
      />

      {/* Main Scroll Journey Container */}
      {/* pointer-events-none lets clicks in empty areas reach the 3D canvas; sections opt back in */}
      <main id="main-journey" className="relative z-10 pointer-events-none">
        {/* Section 01: Cinematic Introduction */}
        <Section01Intro onEnter={handleEnterUniverse} />

        {/* Section 02: Deep Space & Interstellar Void */}
        <Section02DeepSpace />

        {/* Section 03: The Solar System Revealed */}
        <Section03SolarSystem onSelectPlanet={handleSelectPlanet} onDeepDive={handleDeepDive} />

        {/* Section 04: Individual Planet Exploration */}
        <Section04PlanetExploration
          selectedPlanet={selectedPlanet}
          onSelectPlanet={handleSwitchPlanet}
          onReturnToSolarSystem={() => scrollToSection('solar-system')}
        />

        {/* Section 05: Earth: Our Pale Blue Dot */}
        <Section05EarthSpecial />

        {/* Section 06: Beyond the Planets & Relativistic Black Hole */}
        <Section06BeyondPlanets />

        {/* Section 07: The Scale of the Universe */}
        <Section07ScaleUniverse />

        {/* Section 08: Cosmic Discoveries */}
        <Section08Discoveries />

        {/* Section 09: Final Experience & Scientific Sources */}
        <Section09FinalVista
          onBackToTop={handleBackToTop}
          onExploreAgain={handleExploreAgain}
        />
      </main>
    </div>
  );
}

export default App;
