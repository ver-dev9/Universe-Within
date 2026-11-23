/**
 * Chapter 10 — The Search for Other Worlds.
 *
 * Planet and star parameters are copied from the NASA Exoplanet Archive
 * "Planetary Systems Composite Parameters" table (pscomppars), queried via TAP
 * on 2026-11-22, and cross-checked against the NASA Science exoplanet catalog
 * pages linked per system. Distances are given in the archive in parsecs and
 * converted here with 1 pc = 3.26156 ly. All measured values carry
 * uncertainties; the UI marks derived or rounded values with "≈".
 *
 * Nothing here is invented: where the archive has no value (e.g. a mass for
 * a planet only detected by transit), the field is left undefined.
 */

export const ARCHIVE_TAP_URL =
  'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,pl_rade,pl_masse,pl_orbper,pl_orbsmax,pl_eqt,sy_dist,st_rad+from+pscomppars';
export const ARCHIVE_HOME = 'https://exoplanetarchive.ipac.caltech.edu/';
export const ARCHIVE_PSCOMP = 'https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PSCompPars';

/**
 * Confirmed exoplanet count, read from the NASA Exoplanet Archive home page
 * banner ("6,473 Confirmed Planets — 11/19/2026") and confirmed by
 * `select count(*) from pscomppars` returning 6473 on 2026-11-22.
 * The archive updates weekly; this is a snapshot, not a live value.
 */
export const CONFIRMED_COUNT = {
  value: 6473,
  asOf: '19 November 2026',
  asOfIso: '2026-11-19',
  retrieved: '2026-11-22',
  source: ARCHIVE_HOME,
} as const;

/** Physical constants used by the transit demo (km). */
export const EARTH_RADIUS_KM = 6371; // NASA Earth fact sheet (volumetric mean)
export const SUN_RADIUS_KM = 695700; // IAU 2015 nominal solar radius
export const JUPITER_RADIUS_KM = 69911; // NASA Jupiter fact sheet (volumetric mean)
export const EARTH_PER_SUN_RADIUS = EARTH_RADIUS_KM / SUN_RADIUS_KM; // ≈ 0.009158
export const JUPITER_IN_EARTH_RADII = JUPITER_RADIUS_KM / EARTH_RADIUS_KM; // ≈ 10.97

export const CONSTANT_SOURCES = {
  earth: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
  jupiter: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html',
  sun: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html',
} as const;

export const PC_TO_LY = 3.26156;
export const pcToLy = (pc: number) => pc * PC_TO_LY;

/** Transit depth for a planet of radius rpEarth (Earth radii) crossing a star of rsSun (solar radii). */
export const transitDepth = (rpEarth: number, rsSun: number) => {
  const k = (rpEarth * EARTH_PER_SUN_RADIUS) / rsSun;
  return Math.min(1, k * k);
};

/** Host stars offered in the transit demo. Radii from pscomppars (st_rad). */
export const DEMO_STARS = [
  {
    id: 'sun',
    label: 'Sun-like star',
    radiusSun: 1,
    tempK: 5772,
    color: '#FFE2A8',
    note: 'One solar radius — the Sun itself.',
  },
  {
    id: 'trappist',
    label: 'Red dwarf (TRAPPIST-1)',
    radiusSun: 0.1192,
    tempK: 2566,
    color: '#FF8A4C',
    note: 'TRAPPIST-1: 0.1192 solar radii, 2,566 K (NASA Exoplanet Archive).',
  },
] as const;

export type DemoStarId = (typeof DEMO_STARS)[number]['id'];

/** Planet radius slider range, in Earth radii. */
export const RADIUS_SLIDER = { min: 0.5, max: 15, step: 0.1, initial: 1 } as const;

export const DETECTION_SOURCES = {
  howWeFind: 'https://science.nasa.gov/exoplanets/how-we-find-and-characterize/',
  rvFactSheet: 'https://science.nasa.gov/resource/the-search-for-other-earths-fact-sheet',
  exoFacts: 'https://science.nasa.gov/exoplanets/facts',
} as const;

export const TRANSIT_EXPLAINER =
  'When a planet crosses the face of its star, it blocks a sliver of starlight. The fraction blocked is the ratio of the two disc areas: depth ≈ (Rₚ / R★)². Measure the dip, know the star, and you know the planet’s size — this is how the large majority of known exoplanets were found.';

export const RV_EXPLAINER =
  'A planet and its star both orbit their shared centre of mass. As the star is tugged toward us its light shifts slightly blue; as it moves away, slightly red. The size of that Doppler wobble reveals a lower limit on the planet’s mass (M sin i), because we usually cannot see the orbit’s tilt.';

/** Measured radial-velocity semi-amplitudes (pl_rvamp, m/s) — real archive values. */
export const RV_EXAMPLES = [
  { planet: '51 Pegasi b', kMs: 55.77, note: 'the 1995 discovery that opened the field' },
  { planet: 'WASP-39 b', kMs: 37.9, note: 'a puffy hot Saturn' },
  { planet: 'Proxima Centauri b', kMs: 1.226, note: 'an Earth-mass world — a wobble of about walking pace' },
] as const;

export interface ExoPlanet {
  name: string;
  radiusEarth?: number;
  /** True mass, or minimum mass (M sin i) when massIsMinimum is set. */
  massEarth?: number;
  massIsMinimum?: boolean;
  /** Mass estimated from a mass–radius relation rather than measured. */
  massFromRelation?: boolean;
  periodDays: number;
  semiMajorAu: number;
  eqTempK?: number;
  habitableZone?: boolean;
}

export interface ExoSystem {
  id: string;
  name: string;
  tagline: string;
  star: { name: string; spectralType?: string; tempK: number; radiusSun: number };
  distancePc: number;
  discoveryYear: number;
  method: 'Transit' | 'Radial Velocity';
  planets: ExoPlanet[];
  /** Index of the planet featured in the panel. */
  featured: number;
  story: string;
  highlight: string;
  /** Measured transit depth from the archive (pl_trandep, %), when transiting. */
  measuredDepthPct?: number;
  rvAmplitudeMs?: number;
  sources: string[];
  accent: string;
}

export const EXO_SYSTEMS: ExoSystem[] = [
  {
    id: 'trappist-1',
    name: 'TRAPPIST-1',
    tagline: 'Seven rocky worlds around an ultracool dwarf',
    star: { name: 'TRAPPIST-1', spectralType: 'M8.0 V', tempK: 2566, radiusSun: 0.1192 },
    distancePc: 12.42988881,
    discoveryYear: 2016,
    method: 'Transit',
    planets: [
      { name: 'b', radiusEarth: 1.116, massEarth: 1.374, periodDays: 1.510826, semiMajorAu: 0.01154, eqTempK: 397.6 },
      { name: 'c', radiusEarth: 1.097, massEarth: 1.308, periodDays: 2.421937, semiMajorAu: 0.0158, eqTempK: 339.7 },
      { name: 'd', radiusEarth: 0.788, massEarth: 0.388, periodDays: 4.049219, semiMajorAu: 0.02227, eqTempK: 286.2 },
      { name: 'e', radiusEarth: 0.92, massEarth: 0.692, periodDays: 6.101013, semiMajorAu: 0.02925, eqTempK: 249.7, habitableZone: true },
      { name: 'f', radiusEarth: 1.045, massEarth: 1.039, periodDays: 9.20754, semiMajorAu: 0.03849, eqTempK: 217.7, habitableZone: true },
      { name: 'g', radiusEarth: 1.129, massEarth: 1.321, periodDays: 12.352446, semiMajorAu: 0.04683, eqTempK: 197.3, habitableZone: true },
      { name: 'h', radiusEarth: 0.755, massEarth: 0.326, periodDays: 18.772866, semiMajorAu: 0.06189, eqTempK: 171.7 },
    ],
    featured: 3,
    story:
      'The most studied planetary system after our own. All seven Earth-sized planets would fit inside the orbit of Mercury, and three of them — e, f and g — orbit in the star’s habitable zone.',
    highlight:
      'JWST’s first TRAPPIST-1 result (March 2023) measured the dayside of planet b and found little evidence of an atmosphere.',
    measuredDepthPct: 0.5012,
    sources: [
      'https://science.nasa.gov/exoplanets/trappist1/',
      ARCHIVE_PSCOMP,
    ],
    accent: '#FF8A4C',
  },
  {
    id: 'proxima-b',
    name: 'Proxima Centauri b',
    tagline: 'The closest known exoplanet',
    star: { name: 'Proxima Centauri', spectralType: 'M5.5 V', tempK: 2900, radiusSun: 0.141 },
    distancePc: 1.30119,
    discoveryYear: 2016,
    method: 'Radial Velocity',
    planets: [{ name: 'b', radiusEarth: 1.02, massEarth: 1.055, massIsMinimum: true, periodDays: 11.18465, semiMajorAu: 0.04848, eqTempK: 218 }],
    featured: 0,
    story:
      'Found by the wobble it induces in the nearest star to the Sun. It does not transit, so its radius is only an estimate and its mass is a minimum value (M sin i).',
    highlight: 'Its star’s Doppler wobble is only about 1.2 m/s — roughly walking pace, measured from more than 4 light-years away.',
    rvAmplitudeMs: 1.226,
    sources: ['https://science.nasa.gov/exoplanet-catalog/proxima-centauri-b/', ARCHIVE_PSCOMP],
    accent: '#E7B86B',
  },
  {
    id: 'kepler-186f',
    name: 'Kepler-186f',
    tagline: 'An Earth-size world in the habitable zone',
    star: { name: 'Kepler-186', spectralType: 'M1', tempK: 3755, radiusSun: 0.523 },
    distancePc: 177.594,
    discoveryYear: 2014,
    method: 'Transit',
    planets: [{ name: 'f', radiusEarth: 1.17, massEarth: 1.71, massFromRelation: true, periodDays: 129.9441, semiMajorAu: 0.432, eqTempK: 177 }],
    featured: 0,
    story:
      'Announced in 2014 from NASA’s Kepler data, the first Earth-size planet found in the habitable zone of another star. It orbits every 130 days and receives about one-third the energy Earth gets from the Sun, placing it near the outer edge of that zone.',
    highlight: 'Its mass has never been measured — the archive’s 1.71 Earth masses comes from a mass–radius relation.',
    measuredDepthPct: 0.04666,
    sources: [
      'https://science.nasa.gov/exoplanet-catalog/kepler-186-f/',
      'https://www.nasa.gov/news-release/nasas-kepler-telescope-discovers-first-earth-size-planet-in-habitable-zone/',
      ARCHIVE_PSCOMP,
    ],
    accent: '#69D9EF',
  },
  {
    id: '51-peg-b',
    name: '51 Pegasi b',
    tagline: 'The first planet found around a Sun-like star',
    star: { name: '51 Pegasi', spectralType: 'G5V', tempK: 5761, radiusSun: 1.19 },
    distancePc: 15.4614,
    discoveryYear: 1995,
    method: 'Radial Velocity',
    planets: [{ name: 'b', radiusEarth: 14.1, massEarth: 148.738, massIsMinimum: true, periodDays: 4.2307966, semiMajorAu: 0.052, eqTempK: 1328.93 }],
    featured: 0,
    story:
      'Confirmed in 1995, a “hot Jupiter” about half Jupiter’s mass racing around its star in just over four days. It proved the radial-velocity method and launched the modern search for exoplanets.',
    highlight: 'It tugs its star at about 56 m/s. The archive radius is an estimate — 51 Peg b does not transit.',
    rvAmplitudeMs: 55.77,
    sources: [
      'https://science.nasa.gov/exoplanets/how-we-find-and-characterize/',
      'https://science.nasa.gov/universe/exoplanets/whats-out-there-the-exoplanet-sky-so-far/',
      ARCHIVE_PSCOMP,
    ],
    accent: '#E7B86B',
  },
  {
    id: 'wasp-39b',
    name: 'WASP-39b',
    tagline: 'JWST’s first clear detection of CO₂ on an exoplanet',
    star: { name: 'WASP-39', tempK: 5485, radiusSun: 0.939 },
    distancePc: 213.982,
    discoveryYear: 2011,
    method: 'Transit',
    planets: [{ name: 'b', radiusEarth: 14.336311, massEarth: 89.31023, periodDays: 4.0552941, semiMajorAu: 0.04828, eqTempK: 1166 }],
    featured: 0,
    story:
      'A hot, puffy gas giant with about Saturn’s mass but 1.3 times Jupiter’s diameter. In 2022 Webb’s NIRSpec caught a “hill” between 4.1 and 4.6 microns in its transmission spectrum — the first clear evidence of carbon dioxide in a planet outside the solar system.',
    highlight: 'During transit, starlight filters through the planet’s atmosphere; gases absorb specific colours, revealing what the air is made of.',
    measuredDepthPct: 2.34348052,
    rvAmplitudeMs: 37.9,
    sources: ['https://science.nasa.gov/missions/webb/nasas-webb-detects-carbon-dioxide-in-exoplanet-atmosphere/', ARCHIVE_PSCOMP],
    accent: '#8A5BCA',
  },
];

export const EXO_ARTISTIC_DISCLAIMER =
  'Artistic interpretation: star and planet colours, surfaces and the orbit radius are illustrative. The planet-to-star size ratio and the light curve follow the real geometry (uniform stellar disc, central transit; real stars are limb-darkened).';

export const formatLy = (ly: number) =>
  ly < 10 ? `≈ ${ly.toFixed(2)} ly` : ly < 100 ? `≈ ${ly.toFixed(1)} ly` : `≈ ${Math.round(ly).toLocaleString('en-US')} ly`;

export const formatDepth = (depth: number) => {
  const pct = depth * 100;
  const ppm = depth * 1e6;
  const pctStr = pct >= 1 ? pct.toFixed(2) : pct >= 0.1 ? pct.toFixed(3) : pct.toFixed(4);
  return { pct: `${pctStr}%`, ppm: `${Math.round(ppm).toLocaleString('en-US')} ppm` };
};
