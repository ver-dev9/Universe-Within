import React, { useMemo } from 'react';
import { Radio, Activity, Navigation, Compass } from 'lucide-react';

interface HudTelemetryProps {
  currentSectionId: string;
  scrollProgress: number;
}

export const HudTelemetry: React.FC<HudTelemetryProps> = ({
  currentSectionId,
  scrollProgress,
}) => {
  const telemetry = useMemo(() => {
    switch (currentSectionId) {
      case 'intro':
        return {
          sector: 'SECTOR 00 // VOID PERIMETER',
          coords: 'RA: 00h 00m 00s | DEC: +00° 00′ 00″',
          velocity: '0.00 km/s',
          status: 'STANDBY',
          target: 'SOLAR SYSTEM',
        };
      case 'deep-space':
        return {
          sector: 'SECTOR 01 // INTERSTELLAR VOID',
          coords: 'RA: 18h 36m 56s | DEC: +38° 47′ 01″',
          velocity: '17.01 km/s (Voyager 1 Vector)',
          status: 'SCANNING ISM',
          target: 'LOCAL INTERSTELLAR CLOUD',
        };
      case 'solar-system':
        return {
          sector: 'SECTOR 02 // HELIOSPHERE CORE',
          coords: 'RA: 17h 57m 48s | DEC: +04° 41′ 36″',
          velocity: '29.78 km/s (Earth Orbit)',
          status: 'ORBITAL LOCK',
          target: 'SOL (YELLOW DWARF)',
        };
      case 'planet-exploration':
        return {
          sector: 'SECTOR 03 // PLANETARY OBSERVATORY',
          coords: 'RADIAL VECTOR: 1.00 AU',
          velocity: '35.02 km/s (Inner Orbital Plane)',
          status: 'SPECTROMETRY ACTIVE',
          target: 'TERRESTRIAL & GAS WORLDS',
        };
      case 'earth-special':
        return {
          sector: 'SECTOR 04 // TERRA-LUNA DIPLOMACY',
          coords: 'LAT: 00° 00′ N | LON: 00° 00′ E',
          velocity: '1,674 km/h (Equatorial Rotation)',
          status: 'BIOSPHERE NOMINAL',
          target: 'EARTH (PALE BLUE DOT)',
        };
      case 'beyond-planets':
        return {
          sector: 'SECTOR 05 // RELATIVISTIC SINGULARITY',
          coords: 'RA: 17h 45m 40s | DEC: -29° 00′ 28″',
          velocity: '0.45 c (ISCO Infall Accretion)',
          status: 'EVENT HORIZON CAUTION',
          target: 'SUPERMASSIVE SINGULARITY',
        };
      case 'scale-universe':
        return {
          sector: 'SECTOR 06 // LOGARITHMIC COSMIC GRID',
          coords: 'SCALE METRIC: 10⁰ m → 10²⁶ m',
          velocity: 'c = 299,792 km/s (Speed of Light)',
          status: 'EXPANDING CO-MOVING VOLUME',
          target: 'OBSERVABLE COSMOS',
        };
      case 'discoveries':
        return {
          sector: 'SECTOR 07 // SCIENCE HORIZON ARCHIVE',
          coords: 'LAGRANGE POINT L2 // DEEP SURVEY',
          velocity: '0.22 km/s (Halo Orbit)',
          status: 'TELEMETRY DOWNLINKING',
          target: 'JWST / HUBBLE / LIGO',
        };
      case 'final-vista':
      default:
        return {
          sector: 'SECTOR 08 // COSMIC HORIZON VISTA',
          coords: 'HUBBLE RADIUS: 46.5 BLY',
          velocity: 'H₀ = 67.4 km/s/Mpc',
          status: 'EXPANSION CONTINUOUS',
          target: 'UNIVERSE WITHIN',
        };
    }
  }, [currentSectionId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 hidden md:block overflow-hidden">
      {/* Top Left Status Corner */}
      <div className="absolute top-24 left-8 font-mono text-[11px] text-space-muted/80 glass-panel p-3 rounded-xl border border-space-cyan/15 space-y-1">
        <div className="flex items-center gap-2 text-space-cyan">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-bold tracking-widest">{telemetry.sector}</span>
        </div>
        <div className="text-space-white/90">{telemetry.coords}</div>
        <div className="flex items-center gap-2 text-[10px] text-space-muted">
          <span>TARGET:</span>
          <span className="text-space-cyan">{telemetry.target}</span>
        </div>
      </div>

      {/* Top Right Velocity & Telemetry */}
      <div className="absolute top-24 right-8 font-mono text-[11px] text-space-muted/80 glass-panel p-3 rounded-xl border border-space-cyan/15 text-right space-y-1">
        <div className="flex items-center justify-end gap-2 text-space-purple">
          <Activity className="w-3.5 h-3.5" />
          <span className="font-bold tracking-widest">{telemetry.status}</span>
        </div>
        <div className="text-space-white/90">VELOCITY: {telemetry.velocity}</div>
        <div className="text-[10px] text-space-cyan">
          PROGRESS: {Math.round(scrollProgress * 100)}%
        </div>
      </div>

      {/* Bottom Left Compass Coordinates */}
      <div className="absolute bottom-8 left-8 font-mono text-[10px] text-space-muted/60 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-space-cyan/70" />
          <span>SYS.VER: 3.8.4-R3F</span>
        </div>
        <span>|</span>
        <span>LATENCY: 0.04 ms</span>
        <span>|</span>
        <span>RENDERER: WEBGL 2.0</span>
      </div>

      {/* Bottom Right Scroll Indicator */}
      <div className="absolute bottom-8 right-8 font-mono text-[10px] text-space-muted/60 flex items-center gap-2">
        <Navigation className="w-3.5 h-3.5 text-space-purple/70" />
        <span>SCROLL TO NAVIGATE THE COSMOS</span>
      </div>
    </div>
  );
};
