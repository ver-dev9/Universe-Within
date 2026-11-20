# Universe Within — v2 upgrade log

Work happens on the `upgrade/v2` branch. `main` (v1) is untouched until the upgrade is reviewed.
Each phase is only marked done after `npm run build` passes and the running site has been inspected in a headless browser.

## Phase 1 — Audit (done)
- v1 stack (React 18, TS, Vite 5, three r160, R3F 8, drei, Tailwind) already matches the brief → extended, not migrated.
- Kept: planet/scale/discovery/source data, procedural canvas textures, GLSL shaders, Web Audio engine, GitHub Pages workflow.
- Problems found: per-frame React re-renders from scroll, camera not scroll-driven, GSAP unused, no lazy loading / quality tiers / post-processing, single 1.07 MB bundle, placeholder README screenshots + hard-coded build badge, Android workflow with no Android project.

## Phase 2 — Design system & architecture (done)
- **Design system:** `cosmos.*` palette (#03040A, #080B16, #3478D4, #8A5BCA, #69D9EF, #E7B86B, #EEF2FA, #929CAF); v1 `space.*` tokens remapped onto it. Editorial type: Instrument Serif display + Inter body + JetBrains Mono labels (`.cinematic-heading`, `.chapter-label`).
- **State:** `src/store/useCosmosStore.ts` (zustand) for active section, quality, reduced motion, load state. High-frequency scroll values live in a mutable `scrollState` object read on the GSAP ticker / `useFrame`, so scrolling no longer re-renders React.
- **Scroll:** `src/animations/smoothScroll.ts` — Lenis driven by `gsap.ticker`, synced to ScrollTrigger; native scroll under reduced motion. One ScrollTrigger per section updates the active section only when it changes.
- **Chapters:** `src/data/chapters.ts` registry of the 12 chapters with `live`/`planned` status. Navigation only lists built chapters.
- **Global UI:** cinematic loading screen (star formation + real `useProgress`), scroll progress bar, chapter rail, numbered chapter nav, quality selector, skip link, visible focus states, desktop ring cursor (native cursor kept).
- **Rendering:** quality tiers (`src/utils/quality.ts`) set DPR, star count, AA and post-processing; drei `PerformanceMonitor` steps quality down on sustained frame drops; Bloom/Vignette/Noise via `@react-three/postprocessing`.
- **Build:** vendor chunk splitting (three / r3f / postfx / motion). Removed unused `isomorphic-git`, `canvas-confetti`.
- **Content fixes:** HUD "Hubble radius 46.5 Gly" → observable-universe comoving radius; removed invented latency/version telemetry.
- Android APK workflow switched to manual-only (it could not succeed: no Android project).

## Phase 3 — Chapter 01 opening & Chapter 02 solar system (done)
Checked with `npm run build` and headless Chromium (SwiftShader WebGL) screenshots of the production preview at 1440×900 and 390×844, including reduced motion. Headless ran on the **low** quality tier (no post-processing), so those captures don't show bloom.

**Chapter 01 — The Beginning** (`Section01Intro`, `scenes/IntroScene.tsx`, `scenes/rigState.ts`)
- 420vh section with a sticky viewport. One GSAP timeline, scrubbed by a ScrollTrigger over the section, animates the DOM copy *and* a mutable `introRig` object. `CameraRig` reads it in `useFrame`, so no React state changes while scrolling.
- Sequence: near-black with a glowing point under the title → stars form (opacity + inward settle, plus a local star shell around the shot) → the point condenses into Earth as the camera approaches → tagline "Explore the infinite. Discover the unknown." → camera skims the limb through an upper-atmosphere haze → pulls out into space ("Leaving the atmosphere", Kármán line note).
- The hero Earth sits at its own world origin (`INTRO_ORIGIN`), with the camera on the Sun-ward side looking outward. The solar system group is hidden during the intro.
- Earth realism: new noise-based procedural maps (`utils/earthMaps.ts`). They have domain-warped continents (≈29% land), climate-banded deserts, ice caps, banded clouds, city lights on habitable land, and an ocean/land roughness map. City lights are shader-masked to the night side, and a lit-limb scattering rim was added.
- Atmosphere shader fix (applies to every planet): the v1 back-face Fresnel was ≥1 everywhere and drew a solid ring. It now fades from the limb out to the shell edge.
- `EarthGlobe` extended with: sun direction, light target at the globe (three's default target was the world origin), ambient level, moon toggle, city lights and segment count.
- Reduced motion: no scrub and a 100vh section. It shows one static composition with title + tagline, and the camera cuts instead of gliding.
- "Begin the journey" glides to the close approach; "Skip to the Solar System" jumps to Chapter 02.

**Chapter 02 — Our Solar System** (`Section03SolarSystem`, `PlanetMesh`, `SunMesh`, `SaturnRing`, `scenes/CameraRig.tsx`)
- Sun + 8 planets with orbital motion and sidereal spin (retrograde for Venus/Uranus) and NASA axial tilts. Saturn's rings sit in the equatorial plane at true ratio (1.24–2.27 Rs). Also: faint Uranus rings, clearer Jupiter belts/zones, spread starting longitudes and 1-px orbit lines.
- Selection: click a planet, or use the keyboard selector (arrows / Home / End, roving tabindex, `aria-pressed`). Each planet has a generous invisible hit sphere so true-scale worlds stay clickable. Esc returns to the overview. The camera fly-to eases (GSAP) into a pose that then tracks the planet's live position, and orbits slow to 3% while a planet is focused.
- Info panel: name, classification, diameter (× Earth), distance (million km + AU), sidereal orbital period, rotation period (+ retrograde, axial tilt), mean temperature with context, moons, two facts, source link.
- Scale modes (zustand `scaleMode`):
  - **Cinematic**: compressed, with a "Not to scale" badge.
  - **Relative size**: Sun and planets at true diameter ratios (Sun ≈ 109× Earth). Distances are log-compressed and labelled as compressed; the panel computes and shows the factor (Neptune would really be ≈1,500× farther).
  - Geometry is unit-sized and scaled each frame from `solarState.scaleBlend`, so switching modes animates without rebuilding meshes. Relative scale only applies in Chapter 02 sections.
- 3D name labels (drei `Html`) appear only in Chapter 02, with opacity set imperatively.
- `main` is now `pointer-events-none` (sections opt back in) so empty areas pass clicks through to the canvas. In v1, sections blocked them.
- Camera poses for the planet and Earth sections now use the planet's real world position. v1 aimed at `(orbitRadius, 0, 0)` while the planet was elsewhere in its orbit.

**Data corrections** (`src/data/planetsData.ts`, checked 2026-11-20 against https://nssdc.gsfc.nasa.gov/planetary/factsheet/ and the per-planet sheets; every planet and the Sun now carry a `source` field)
- Diameters changed to the fact sheet's equatorial values: Earth 12,742→12,756; Mars 6,779→6,792; Jupiter 139,820→142,984; Saturn 116,460→120,536; Uranus 50,724→51,118; Neptune 49,244→49,528 km.
- Distance (semimajor axis): Mars 227.9→228.0; Jupiter 778.6→778.5; Saturn 1,433.5→1,432.0; Uranus 2,872.5→2,867.0; Neptune 4,495.1→4,515.0 million km.
- Sidereal orbit: Saturn 10,759.22→10,755.7 d. Earth 365.25→365.256 and Mercury 87.97→87.969 are precision changes only.
- Rotation: Saturn 10.57→10.656 h. Jupiter 9.93→9.925, Mars 24.62→24.6229 and Earth 23.934→23.9345 are precision changes.
- Mean temperature: Mars −63→−65 °C; Neptune −201→−200 °C. Gas/ice giant means are labelled as 1-bar values.
- Saturn moons 146→274 (fact sheet count).
- Sun: diameter 1,392,700→1,391,400 km; core 15.0→15.7 million °C (1.571×10⁷ K); luminosity 3.846→3.828×10²⁶ W.
- Added `axialTiltDeg` (obliquity), `temperatureContext`, `EARTH_DIAMETER_KM` and `AU_MILLION_KM`. The "× Earth", AU and years figures in Section 04 now use them.
- Not on the fact sheet and left unverified: temperature *ranges*, atmosphere percentages, discovery/mission text.

**Lifecycle & quality:**
- Sphere segment counts follow the quality tier.
- Geometries and materials created outside JSX are disposed on unmount: orbit lines, ring geometry, atmosphere/rim/point materials and the Earth surface material.
- The intro timeline lives in a `gsap.context` that is reverted on unmount, which kills its ScrollTrigger. The fly-to tween is killed on unmount.
- Cached canvas textures are shared app-wide and intentionally not disposed.

**Chapters:** `ChapterStatus` gains `complete` (rebuilt to the v2 brief and inspected). Chapters 01 and 02 are `complete`; carried-over v1 chapters stay `live`. Section labels in the legacy Chapter 01/02 sections were renumbered.

**Known gaps**
- Earth maps are 1024×512, so the closest approach looks soft. A 2048 map on the high tier would sharpen it.
- On phones, the focused planet sits behind the Chapter 02 text column and the info panel is below the fold.
- The v1 black-hole system stays visible in the background of the Chapter 02 overview.
- Sections 04–09 still carry v1 copy and v1 chapter numbering in their headers.
- Google Fonts are blocked in the sandbox, so captures show fallback fonts.
- The bloom/high-tier look isn't captured, because headless ran on the low tier.

## Next — Phase 4
Chapter 03 (The Power of the Sun) and the remaining chapter rebuilds.
