import { create } from 'zustand';
import { detectQuality, QualityLevel } from '../utils/quality';

/**
 * Global UI state. High-frequency values (scroll progress, velocity) live in
 * `scrollState` — a plain mutable object read inside useFrame / rAF — so that
 * scrolling never triggers React re-renders.
 */
export const scrollState = {
  /** 0..1 progress through the whole page. */
  progress: 0,
  /** Lenis velocity (px per frame), useful for motion-blur style effects. */
  velocity: 0,
  /** 0..1 progress through the currently active section. */
  sectionProgress: 0,
};

const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export type ScaleMode = 'cinematic' | 'relative';

interface CosmosState {
  activeSection: string;
  quality: QualityLevel;
  qualityLocked: boolean;
  /** null = follow the OS preference */
  reducedMotionOverride: boolean | null;
  systemReducedMotion: boolean;
  hasLoaded: boolean;
  /** Chapter 02 layout: compressed cinematic view or true size ratios. */
  scaleMode: ScaleMode;
  /** Planet the Chapter 02 camera is flying to / tracking (null = overview). */
  focusedPlanetId: string | null;

  setActiveSection: (id: string) => void;
  setQuality: (q: QualityLevel, lock?: boolean) => void;
  toggleReducedMotion: () => void;
  setSystemReducedMotion: (v: boolean) => void;
  setLoaded: () => void;
  setScaleMode: (m: ScaleMode) => void;
  setFocusedPlanet: (id: string | null) => void;
}

export const useCosmosStore = create<CosmosState>((set, get) => ({
  activeSection: 'intro',
  quality: detectQuality(),
  qualityLocked: false,
  reducedMotionOverride: null,
  systemReducedMotion: prefersReduced(),
  hasLoaded: false,
  scaleMode: 'cinematic',
  focusedPlanetId: null,

  setActiveSection: (id) => {
    if (get().activeSection !== id) set({ activeSection: id });
  },
  setQuality: (quality, lock = false) => set({ quality, qualityLocked: lock || get().qualityLocked }),
  toggleReducedMotion: () => {
    const current = get().reducedMotionOverride ?? get().systemReducedMotion;
    set({ reducedMotionOverride: !current });
  },
  setSystemReducedMotion: (v) => set({ systemReducedMotion: v }),
  setLoaded: () => set({ hasLoaded: true }),
  setScaleMode: (scaleMode) => set({ scaleMode }),
  setFocusedPlanet: (focusedPlanetId) => {
    if (get().focusedPlanetId !== focusedPlanetId) set({ focusedPlanetId });
  },
}));

export const selectReducedMotion = (s: CosmosState) => s.reducedMotionOverride ?? s.systemReducedMotion;
