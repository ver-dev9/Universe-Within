/**
 * Cosmic Lab (Phase 8) reference data.
 *
 * Planet physical figures are NOT duplicated here: they come from
 * `planetsData.ts` (NASA NSSDCA, verified 2026-11-20). This file only adds
 * what the lab needs on top of that: orbital elements, the Moon / Pluto,
 * stellar presets, distance milestones and black-hole constants.
 * Every block carries its source; values flagged `estimate: true` are
 * model-dependent or quoted with large uncertainty by the source.
 */
import { PLANETS_DATA, SUN_DATA, EARTH_DIAMETER_KM, type DataSource } from './planetsData';

export type LabToolId =
  | 'planet-explorer'
  | 'solar-system'
  | 'scale-comparison'
  | 'stellar-explorer'
  | 'black-hole'
  | 'cosmic-distance';

export interface LabToolMeta {
  id: LabToolId;
  index: string;
  name: string;
  short: string;
  blurb: string;
}

export const LAB_TOOLS: LabToolMeta[] = [
  { id: 'planet-explorer', index: '01', name: 'Planet Explorer', short: 'Planets', blurb: 'Turn any world in your hands: atmosphere, rings, tilt and spin.' },
  { id: 'solar-system', index: '02', name: 'Solar System Explorer', short: 'Orbits', blurb: 'Real orbital periods and eccentric ellipses, solved with Kepler’s equation.' },
  { id: 'scale-comparison', index: '03', name: 'Planetary Scale', short: 'Scale', blurb: 'Line worlds up side by side at their true diameter ratio.' },
  { id: 'stellar-explorer', index: '04', name: 'Stellar Explorer', short: 'Stars', blurb: 'Dial a star’s temperature and radius; physics does the rest.' },
  { id: 'black-hole', index: '05', name: 'Black Hole Explorer', short: 'Black hole', blurb: 'Bend light around a Schwarzschild black hole.' },
  { id: 'cosmic-distance', index: '06', name: 'Cosmic Distance', short: 'Distance', blurb: 'Slide from the Moon to the edge of the observable universe.' },
];

/* ───────────────────────── Physical constants ───────────────────────── */

/** Speed of light, m/s (exact, SI). */
export const C_M_S = 299_792_458;
/** Light-year in metres (IAU: 9.4607304725808e15 m). */
export const LY_M = 9.4607304725808e15;
/** Astronomical unit in metres (IAU 2012, exact). */
export const AU_M = 149_597_870_700;
/** Gravitational constant (CODATA 2018), m³ kg⁻¹ s⁻². */
export const G_SI = 6.6743e-11;
/** Nominal solar mass (IAU 2015 B3 via GM☉ = 1.3271244e20 m³/s²). */
export const SOLAR_MASS_KG = 1.988_409_87e30;
/** Nominal solar effective temperature (IAU 2015 B3). */
export const SUN_TEFF_K = 5772;
/** Nominal solar luminosity, W (IAU 2015 B3; NASA Sun fact sheet 3.828e26 W). */
export const SUN_LUMINOSITY_W = 3.828e26;
/** Nominal solar radius, km (IAU 2015 B3). */
export const SUN_RADIUS_KM = 695_700;
/** Wien displacement constant, m·K (CODATA 2018). */
export const WIEN_B = 2.897_771_955e-3;

/* ─────────────────────── Orbital elements (JPL) ─────────────────────── */

export interface OrbitalElements {
  id: string;
  /** Semi-major axis, au */
  a: number;
  /** Eccentricity */
  e: number;
  /** Inclination to the J2000 ecliptic, degrees */
  I: number;
  /** Mean longitude at J2000.0, degrees */
  L: number;
  /** Longitude of perihelion, degrees */
  varpi: number;
  /** Longitude of ascending node, degrees */
  Omega: number;
}

export const ORBIT_SOURCE: DataSource = {
  name: 'JPL Solar System Dynamics — Approximate Positions of the Planets (Standish & Williams), Table 1',
  url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
  fields: ['a', 'e', 'I', 'L', 'long. perihelion', 'long. node (J2000 values; rates ignored)'],
  checked: '2026-11-21',
  note: 'Elements are a best fit for 1800–2050 AD. The lab uses the J2000 values with a constant mean motion from the NASA sidereal period, so positions drift outside that window.',
};

/** J2000 elements (rates omitted). "EM Bary" used for Earth. */
export const ORBITAL_ELEMENTS: Record<string, OrbitalElements> = {
  mercury: { id: 'mercury', a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.2503235, varpi: 77.45779628, Omega: 48.33076593 },
  venus: { id: 'venus', a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.9790995, varpi: 131.60246718, Omega: 76.67984255 },
  earth: { id: 'earth', a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, varpi: 102.93768193, Omega: 0 },
  mars: { id: 'mars', a: 1.52371034, e: 0.0933941, I: 1.84969142, L: -4.55343205, varpi: -23.94362959, Omega: 49.55953891 },
  jupiter: { id: 'jupiter', a: 5.202887, e: 0.04838624, I: 1.30439695, L: 34.39644051, varpi: 14.72847983, Omega: 100.47390909 },
  saturn: { id: 'saturn', a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, varpi: 92.59887831, Omega: 113.66242448 },
  uranus: { id: 'uranus', a: 19.18916464, e: 0.04725744, I: 0.77263783, L: 313.23810451, varpi: 170.9542763, Omega: 74.01692503 },
  neptune: { id: 'neptune', a: 30.06992276, e: 0.00859048, I: 1.77004347, L: -55.12002969, varpi: 44.96476227, Omega: 131.78422574 },
};

/* ───────────────────── Bodies for scale comparison ───────────────────── */

export const NSSDC_SUMMARY_SOURCE: DataSource = {
  name: 'NASA NSSDCA Planetary Fact Sheet — Metric (D. R. Williams)',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
  fields: ['Moon diameter 3,475 km', 'Pluto diameter 2,376 km', 'Moon distance 0.384 × 10⁶ km', 'eccentricities'],
  checked: '2026-11-21',
};

export interface ScaleBody {
  id: string;
  name: string;
  diameterKm: number;
  /** Texture key for getPlanetTexture; null uses a flat colour. */
  texture: string | null;
  color: string;
  kind: 'star' | 'planet' | 'moon' | 'dwarf';
}

export const SCALE_BODIES: ScaleBody[] = [
  { id: 'sun', name: 'Sun', diameterKm: SUN_DATA.actualDiameterKm, texture: 'sun', color: '#FFB347', kind: 'star' },
  ...PLANETS_DATA.map<ScaleBody>((p) => ({
    id: p.id,
    name: p.name,
    diameterKm: p.actualDiameterKm,
    texture: p.id,
    color: p.color,
    kind: 'planet',
  })),
  { id: 'moon', name: 'Moon', diameterKm: 3475, texture: 'moon', color: '#B8B5AE', kind: 'moon' },
  { id: 'pluto', name: 'Pluto', diameterKm: 2376, texture: null, color: '#C9A98A', kind: 'dwarf' },
];

export { EARTH_DIAMETER_KM };

/* ───────────────────────────── Stars ───────────────────────────── */

export interface StarPreset {
  id: string;
  name: string;
  temperatureK: number;
  radiusSolar: number;
  spectralType: string;
  /** Luminosity the source quotes (L☉), for comparison with the computed value. */
  quotedLuminosity?: string;
  estimate: boolean;
  note: string;
  source: { name: string; url: string };
}

export const STAR_PRESETS: StarPreset[] = [
  {
    id: 'sun',
    name: 'Sun',
    temperatureK: 5772,
    radiusSolar: 1,
    spectralType: 'G2V',
    quotedLuminosity: '1 (3.828 × 10²⁶ W)',
    estimate: false,
    note: 'Nominal IAU 2015 values; the reference every other star is measured against.',
    source: { name: 'NASA NSSDCA Sun Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html' },
  },
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    temperatureK: 3040,
    radiusSolar: 0.145,
    spectralType: 'M5.5Ve',
    quotedLuminosity: '0.000138 in the ESO 2003 table; 0.00151 bolometric (Ribas et al. 2017)',
    estimate: false,
    note: 'Interferometric radius from the VLT (Ségransan et al. 2003). Later papers give 0.146–0.154 R☉ and 2,980–3,042 K.',
    source: { name: 'ESO eso0307 — A Family Portrait of the Alpha Centauri System', url: 'https://www.eso.org/public/news/eso0307/' },
  },
  {
    id: 'sirius-a',
    name: 'Sirius A',
    temperatureK: 9940,
    radiusSolar: 1.711,
    spectralType: 'A1V',
    quotedLuminosity: '25.4',
    estimate: false,
    note: 'Radius from VLTI interferometry (Kervella et al. 2003, A&A 408, 681); temperature is the commonly adopted spectroscopic value.',
    source: { name: 'Kervella et al. 2003, A&A — interferometric diameter of Sirius A', url: 'https://doi.org/10.1051/0004-6361:20030994' },
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    temperatureK: 3600,
    radiusSolar: 764,
    spectralType: 'M1–M2 Ia–ab',
    quotedLuminosity: '≈ 87,000 (+20,500 / −11,200)',
    estimate: true,
    note: 'Estimate. Radius 764 (+116/−62) R☉ from seismic modelling (Joyce et al. 2020, ApJ 902, 63); NASA quotes “about 700 times the size of the Sun”. Temperature 3,600 ± 25 K measured during the 2020 Great Dimming (Levesque & Massey 2020).',
    source: { name: 'Joyce et al. 2020, ApJ 902, 63', url: 'https://iopscience.iop.org/article/10.3847/1538-4357/abb8db' },
  },
  {
    id: 'rigel',
    name: 'Rigel',
    temperatureK: 12100,
    radiusSolar: 78.9,
    spectralType: 'B8Ia',
    quotedLuminosity: '≈ 120,000 (log L = 5.08)',
    estimate: true,
    note: 'Estimate. Radius 78.9 ± 7.4 R☉ depends on the adopted Hipparcos distance (264 ± 24 pc); temperature 12,100 ± 150 K (Przybilla et al. 2010), both via Moravveji et al. 2012.',
    source: { name: 'Moravveji et al. 2012, ApJ 747, 108', url: 'https://iopscience.iop.org/article/10.1088/0004-637X/747/2/108' },
  },
  {
    id: 'sirius-b',
    name: 'Sirius B (white dwarf)',
    temperatureK: 25369,
    radiusSolar: 0.008098,
    spectralType: 'DA2',
    quotedLuminosity: '0.02448',
    estimate: false,
    note: 'The nearest white dwarf: about the Sun’s mass (1.018 M☉) squeezed into a body smaller than Earth (≈ 5,630 km radius). Radius and temperature from HST STIS spectra (Bond et al. 2017); ESA/Hubble 2005 rounds them to 12,000 km across and 25,000 °C.',
    source: { name: 'Bond et al. 2017, ApJ 840, 70 (arXiv:1703.10625)', url: 'https://arxiv.org/abs/1703.10625' },
  },
];

export interface SpectralClass {
  letter: string;
  minK: number;
  maxK: number;
  colour: string;
  examples: string;
}

/** Approximate Harvard class boundaries — OpenStax Astronomy 2e, Table 17.2. */
export const SPECTRAL_CLASSES: SpectralClass[] = [
  { letter: 'O', minK: 30000, maxK: Infinity, colour: 'Blue', examples: '10 Lacertae' },
  { letter: 'B', minK: 10000, maxK: 30000, colour: 'Blue-white', examples: 'Rigel, Spica' },
  { letter: 'A', minK: 7500, maxK: 10000, colour: 'White', examples: 'Sirius, Vega' },
  { letter: 'F', minK: 6000, maxK: 7500, colour: 'Yellow-white', examples: 'Canopus, Procyon' },
  { letter: 'G', minK: 5200, maxK: 6000, colour: 'Yellow', examples: 'Sun, Capella' },
  { letter: 'K', minK: 3700, maxK: 5200, colour: 'Orange', examples: 'Arcturus, Aldebaran' },
  { letter: 'M', minK: 2400, maxK: 3700, colour: 'Red', examples: 'Betelgeuse, Proxima Centauri' },
];

export const SPECTRAL_SOURCE = {
  name: 'OpenStax Astronomy 2e, §17.3 Table 17.2 (spectral classes)',
  url: 'https://openstax.org/books/astronomy-2e/pages/17-3-the-spectra-of-stars-and-brown-dwarfs',
};

/* ───────────────────────────── Black holes ───────────────────────────── */

export interface BlackHolePreset {
  id: string;
  name: string;
  massSolar: number;
  note: string;
  source: { name: string; url: string };
}

export const BLACK_HOLE_PRESETS: BlackHolePreset[] = [
  {
    id: 'stellar',
    name: 'Stellar (10 M☉)',
    massSolar: 10,
    note: 'Illustrative stellar-mass black hole, the kind left by a massive star’s collapse.',
    source: { name: 'NASA Science — Black Holes', url: 'https://science.nasa.gov/universe/black-holes/' },
  },
  {
    id: 'sgr-a',
    name: 'Sagittarius A*',
    massSolar: 4.0e6,
    note: 'Milky Way centre, “roughly four million” solar masses (EHT 2022; ~4.15 × 10⁶ from GRAVITY stellar orbits).',
    source: { name: 'ESO — EHT size comparison of M87* and Sgr A*', url: 'https://www.eso.org/public/images/eso2208-eht-mwe/' },
  },
  {
    id: 'm87',
    name: 'M87*',
    massSolar: 6.5e9,
    note: 'Centre of the galaxy M87, 6.5 ± 0.7 billion solar masses (EHT 2019, paper VI).',
    source: { name: 'EHT Collaboration 2019, ApJL 875, L6', url: 'https://iopscience.iop.org/article/10.3847/2041-8213/ab1141' },
  },
];

/* ───────────────────────── Distance milestones ───────────────────────── */

export interface DistanceMilestone {
  id: string;
  name: string;
  /** Distance (or size, see `measure`) in metres. */
  meters: number;
  display: string;
  measure: 'distance' | 'diameter' | 'radius' | 'outer edge';
  /** What the light-travel readout means for this milestone. */
  lightNote?: string;
  blurb: string;
  estimate?: boolean;
  source: { name: string; url: string };
}

const ly = (n: number) => n * LY_M;
const au = (n: number) => n * AU_M;

export const DISTANCE_MILESTONES: DistanceMilestone[] = [
  {
    id: 'moon',
    name: 'The Moon',
    meters: 384_400e3,
    display: '384,400 km (mean)',
    measure: 'distance',
    blurb: 'The farthest place humans have stood. Radio signals to Apollo crews took about 1.3 s each way.',
    source: { name: 'NASA NSSDCA Moon Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
  },
  {
    id: 'sun',
    name: 'The Sun',
    meters: au(1),
    display: '1 au = 149.6 million km',
    measure: 'distance',
    blurb: 'Sunlight you feel now left the photosphere a little over eight minutes ago.',
    source: { name: 'IAU 2012 Resolution B2 (au); NASA Oort Cloud facts', url: 'https://science.nasa.gov/solar-system/oort-cloud/facts/' },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    meters: au(30.07),
    display: '30.07 au (semi-major axis)',
    measure: 'distance',
    blurb: 'The outermost planet. NASA: sunlight takes about 4.5 hours to reach Neptune’s orbit.',
    source: { name: 'JPL SSD Approximate Positions of the Planets', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html' },
  },
  {
    id: 'oort',
    name: 'Oort Cloud (outer edge)',
    meters: au(100_000),
    display: 'up to ~100,000 au',
    measure: 'outer edge',
    estimate: true,
    blurb: 'A theorised shell of icy bodies. NASA puts the inner edge at 2,000–5,000 au and the outer edge somewhere between 10,000 and 100,000 au.',
    source: { name: 'NASA Science — Oort Cloud facts', url: 'https://science.nasa.gov/solar-system/oort-cloud/facts/' },
  },
  {
    id: 'light-year',
    name: 'One light-year',
    meters: LY_M,
    display: '9.46 trillion km (≈ 63,240 au)',
    measure: 'distance',
    blurb: 'Not a time but a distance: how far light travels in one Julian year. Even this is less than a quarter of the way to the nearest star.',
    source: { name: 'NASA Science — What is a light-year?', url: 'https://science.nasa.gov/exoplanets/what-is-a-light-year' },
  },
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    meters: ly(4.2),
    display: '~4.2 light-years',
    measure: 'distance',
    blurb: 'The nearest star to the Sun, a small red dwarf with at least one planet in its habitable zone.',
    source: { name: 'ESO — How small are small stars really? (eso0232)', url: 'https://www.eso.org/public/news/eso0232/' },
  },
  {
    id: 'milky-way',
    name: 'Milky Way (disk)',
    meters: ly(100_000),
    display: '~100,000 light-years across',
    measure: 'diameter',
    estimate: true,
    blurb: 'Our galaxy’s stellar disk; the Sun sits roughly halfway out from the centre and takes ~240 million years per orbit.',
    source: { name: 'NASA Science — Galaxies', url: 'https://science.nasa.gov/universe/galaxies/' },
  },
  {
    id: 'andromeda',
    name: 'Andromeda (M31)',
    meters: ly(2.5e6),
    display: '2.5 million light-years',
    measure: 'distance',
    blurb: 'The nearest large spiral, and the most distant object most people can see with the naked eye.',
    source: { name: 'NASA Hubble — Messier 31', url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31' },
  },
  {
    id: 'virgo',
    name: 'Virgo Cluster',
    meters: ly(54e6),
    display: '~54 million light-years',
    measure: 'distance',
    estimate: true,
    blurb: 'Over 2,000 galaxies; the nearest large galaxy cluster. ESA/Hubble lists ~55 million ly; published estimates span ~48–65.',
    source: { name: 'NASA Hubble — Globular clusters in the Virgo cluster', url: 'https://science.nasa.gov/missions/hubble/globular-clusters-tell-tale-of-star-formation-in-nearby-galaxy-metropolis/' },
  },
  {
    id: 'laniakea',
    name: 'Laniakea Supercluster',
    meters: ly(520e6),
    display: '~520 million light-years across',
    measure: 'diameter',
    estimate: true,
    blurb: 'Our home supercluster, ~100,000 galaxies defined by where galaxy flows diverge (Tully et al. 2014). NASA APOD rounds it to “about 500 million ly”.',
    source: { name: 'Tully et al. 2014, Nature 513, 71', url: 'https://www.nature.com/articles/nature13674' },
  },
  {
    id: 'observable',
    name: 'Observable universe',
    meters: ly(46.5e9),
    display: '~46.5 billion light-years (comoving radius)',
    measure: 'radius',
    lightNote: 'Light from the edge has travelled ~13.8 billion years; space expanded meanwhile, so the source is now ~46.5 billion ly away.',
    blurb: 'Everything whose light has had time to reach us. ESA: “93 billion light-years across”.',
    source: { name: 'ESA — The Universe', url: 'https://www.esa.int/what-we-do/explore-discover-space/universe' },
  },
];

export const DISTANCE_RANGE = {
  minMeters: DISTANCE_MILESTONES[0].meters,
  maxMeters: DISTANCE_MILESTONES[DISTANCE_MILESTONES.length - 1].meters,
};
