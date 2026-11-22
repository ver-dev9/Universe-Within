/**
 * Chapter 07 — Nebulae: Cosmic Nurseries.
 *
 * Type, distance and constellation are copied from the NASA Hubble Messier /
 * Caldwell catalogue page linked in `sourceUrl` for each object. Distances to
 * nebulae are estimates; the UI marks them with "≈". The 3D volumes are
 * artistic interpretations driven by `visual`, not reconstructions.
 */

export type NebulaShape = 'cavity' | 'pillars' | 'cloud' | 'filaments' | 'shell';

export interface NebulaVisual {
  shape: NebulaShape;
  /** Three palette stops, dark → bright (hex). */
  palette: [string, string, string];
  /** Embedded star tint. */
  starColor: string;
  /** Overall brightness multiplier. */
  intensity: number;
  /** Noise frequency. */
  scale: number;
}

export interface Nebula {
  id: string;
  name: string;
  catalog: string;
  type: string;
  /** Distance in light-years as published on the source page (an estimate). */
  distanceLy: number;
  constellation: string;
  apparentMagnitude: number;
  /** What the object teaches us — paraphrased from the source page. */
  science: string;
  /** One extra sourced detail. */
  highlight: string;
  sourceUrl: string;
  sourceLabel: string;
  /** What the colours in the referenced Hubble image represent (per source). */
  imageColours?: string;
  visual: NebulaVisual;
}

export const NEBULAE: Nebula[] = [
  {
    id: 'orion',
    name: 'Orion Nebula',
    catalog: 'Messier 42',
    type: 'Nebula — stellar nursery',
    distanceLy: 1500,
    constellation: 'Orion',
    apparentMagnitude: 4.0,
    science:
      'The closest large star-forming region to Earth. Four massive young stars at its heart — the Trapezium — flood it with ultraviolet light that carves a cavity in the cloud and disrupts the growth of hundreds of smaller stars.',
    highlight:
      'Hubble has seen dusty protoplanetary disks around newborn stars here — possibly planetary systems in the making, like the disk our solar system likely formed from.',
    sourceUrl:
      'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/',
    sourceLabel: 'NASA Hubble — Messier 42',
    imageColours: 'Orange ≈ hydrogen, green ≈ oxygen, red ≈ sulfur + infrared (Hubble mosaic).',
    visual: { shape: 'cavity', palette: ['#2a0f2e', '#d9566b', '#7fe0d8'], starColor: '#cfe6ff', intensity: 1.05, scale: 1.4 },
  },
  {
    id: 'eagle',
    name: 'Eagle Nebula',
    catalog: 'Messier 16',
    type: 'Emission nebula',
    distanceLy: 7000,
    constellation: 'Serpens',
    apparentMagnitude: 6.0,
    science:
      'Home of the Pillars of Creation — towers of cold gas and dust, roughly 4 to 5 light-years tall, that hide newborn stars. Ultraviolet light and winds from a nearby young cluster are slowly eroding them.',
    highlight: 'The whole nebula spans about 70 by 55 light-years; the famous pillars are only a small part of it.',
    sourceUrl:
      'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-16/',
    sourceLabel: 'NASA Hubble — Messier 16',
    imageColours: 'Blue ≈ oxygen, red ≈ sulfur, green ≈ nitrogen + hydrogen (Hubble image).',
    visual: { shape: 'pillars', palette: ['#1d1408', '#c8873a', '#7cc9c9'], starColor: '#fff1d6', intensity: 1.0, scale: 1.2 },
  },
  {
    id: 'carina',
    name: 'Carina Nebula',
    catalog: 'Caldwell 92 · NGC 3372',
    type: 'Emission nebula',
    distanceLy: 7500,
    constellation: 'Carina',
    apparentMagnitude: 4.8,
    science:
      'A turbulent stellar nursery sculpted by winds and ultraviolet radiation from monster stars. Their blast compresses the surrounding cold hydrogen, triggering a second wave of star formation.',
    highlight:
      'Near its heart is Eta Carinae, a system of at least two stars; the largest is around 100 times the Sun’s mass and 5 million times as luminous.',
    sourceUrl:
      'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-92',
    sourceLabel: 'NASA Hubble — Caldwell 92',
    imageColours: 'Red ≈ sulfur, green ≈ hydrogen, blue ≈ oxygen (Hubble/CTIO mosaic).',
    visual: { shape: 'cloud', palette: ['#26100a', '#e0703a', '#8fb8ff'], starColor: '#e6efff', intensity: 1.1, scale: 1.0 },
  },
  {
    id: 'crab',
    name: 'Crab Nebula',
    catalog: 'Messier 1',
    type: 'Supernova remnant',
    distanceLy: 6500,
    constellation: 'Taurus',
    apparentMagnitude: 8.4,
    science:
      'The six-light-year-wide wreckage of a supernova that Chinese astronomers saw as a “guest star” in 1054. Its filaments are the tattered remains of the star, carrying elements expelled in the explosion.',
    highlight:
      'A neutron star at its centre spins so fast its twin beams appear to pulse 30 times per second; electrons spiralling in its magnetic field make the eerie blue inner glow.',
    sourceUrl:
      'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-1/',
    sourceLabel: 'NASA Hubble — Messier 1',
    imageColours: 'Orange filaments ≈ mostly hydrogen; blue ≈ neutral oxygen; green ≈ ionised sulfur; red ≈ doubly ionised oxygen.',
    visual: { shape: 'filaments', palette: ['#0b1230', '#e8833f', '#6ea8ff'], starColor: '#bfe0ff', intensity: 1.0, scale: 1.6 },
  },
  {
    id: 'ring',
    name: 'Ring Nebula',
    catalog: 'Messier 57',
    type: 'Planetary nebula',
    distanceLy: 2000,
    constellation: 'Lyra',
    apparentMagnitude: 8.8,
    science:
      'The glowing remains of a Sun-like star — a preview of our Sun’s fate. Hubble showed it is not a simple ring: a football-shaped blue core seen end-on pierces a red, doughnut-shaped shell.',
    highlight: 'Dark knots of dense gas line the inner rim — clumps the stellar wind has not yet blown away — looking like bicycle spokes.',
    sourceUrl:
      'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-57/',
    sourceLabel: 'NASA Hubble — Messier 57',
    imageColours: 'Deep blue ≈ helium; light blue ≈ hydrogen + oxygen; red outer ring ≈ nitrogen + sulfur.',
    visual: { shape: 'shell', palette: ['#14081c', '#e0563e', '#5fc4f0'], starColor: '#ffffff', intensity: 1.0, scale: 1.8 },
  },
];

export const formatLy = (ly: number) => `≈ ${ly.toLocaleString('en-US')} light-years`;
