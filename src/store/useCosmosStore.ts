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

interface CosmosState {
  activeSection: string;
  quality: QualityLevel;
  qualityLocked: boolean;
  /** null = follow the OS preference */
  reducedMotionOverride: boolean | null;
  systemReducedMotion: boolean;
  hasLoaded: boolean;

  setActiveSection: (id: string) => void;
  setQuality: (q: QualityLevel, lock?: boolean) => void;
  toggleReducedMotion: () => void;
  setSystemReducedMotion: (v: boolean) => void;
  setLoaded: () => void;
}

export const useCosmosStore = create<CosmosState>((set, get) => ({
  activeSection: 'intro',
  quality: detectQuality(),
  qualityLocked: false,
  reducedMotionOverride: null,
  systemReducedMotion: prefersReduced(),
  hasLoaded: false,

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
}));

export const selectReducedMotion = (s: CosmosState) => s.reducedMotionOverride ?? s.systemReducedMotion;
