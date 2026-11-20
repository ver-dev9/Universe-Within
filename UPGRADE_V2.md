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

## Next — Phase 3
Cinematic Earth opening (Chapter 01) with scroll-scrubbed camera, then Chapter 02 solar system with scale modes.
