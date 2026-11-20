/**
 * Rendering quality tiers. Every scene reads its budget from here instead of
 * hard-coding particle counts or pixel ratios.
 */
export type QualityLevel = 'high' | 'medium' | 'low';

export interface QualityProfile {
  dpr: [number, number];
  starCount: number;
  nebulaParticles: number;
  postprocessing: 'full' | 'lite' | 'off';
  antialias: boolean;
  /** Segment multiplier for procedural sphere geometry. */
  geometryDetail: number;
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  high: { dpr: [1, 2], starCount: 9000, nebulaParticles: 1.0, postprocessing: 'full', antialias: true, geometryDetail: 1 },
  medium: { dpr: [1, 1.5], starCount: 5000, nebulaParticles: 0.6, postprocessing: 'lite', antialias: true, geometryDetail: 0.75 },
  low: { dpr: [0.75, 1], starCount: 2200, nebulaParticles: 0.3, postprocessing: 'off', antialias: false, geometryDetail: 0.5 },
};

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/** Best-effort initial guess; PerformanceMonitor refines it at runtime. */
export function detectQuality(): QualityLevel {
  if (typeof window === 'undefined') return 'medium';
  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;

  if (coarse && small) return cores >= 8 && memory >= 6 ? 'medium' : 'low';
  if (cores >= 8 && memory >= 8) return 'high';
  if (cores <= 2 || memory <= 2) return 'low';
  return 'medium';
}

export const QUALITY_ORDER: QualityLevel[] = ['low', 'medium', 'high'];
