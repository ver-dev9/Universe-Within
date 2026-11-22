/**
 * Chapter 03 — The Power of the Sun.
 * Every number below was read from the cited NASA page (fetched 2026-11-20).
 * "approx" marks values NASA itself gives as rounded / "about".
 */

export interface SourcedFact {
  label: string;
  value: string;
  note?: string;
  /** true when the source states the value as an approximation or a model value. */
  approx?: boolean;
  source: string;
}

export const SUN_SOURCES = {
  nasaFacts: 'https://science.nasa.gov/sun/facts/',
  nssdc: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html',
  msfcInterior: 'https://solarscience.msfc.nasa.gov/interior.shtml',
} as const;

export const SUN_KEY_FACTS: SourcedFact[] = [
  {
    label: 'Core temperature',
    value: '~15 million °C',
    note: 'NSSDC solar model: 1.571 × 10⁷ K at the centre',
    approx: true,
    source: SUN_SOURCES.nasaFacts,
  },
  {
    label: 'Photosphere',
    value: '~5,500 °C',
    note: 'Effective temperature 5,772 K (NSSDC)',
    approx: true,
    source: SUN_SOURCES.nasaFacts,
  },
  {
    label: 'Corona',
    value: 'up to ~2 million °C',
    note: 'Hotter than the surface below it — an unsolved puzzle',
    approx: true,
    source: SUN_SOURCES.nasaFacts,
  },
  {
    label: 'Mean radius',
    value: '695,700 km',
    note: '109.2 × Earth',
    source: SUN_SOURCES.nssdc,
  },
  {
    label: 'Luminosity',
    value: '3.828 × 10²⁶ W',
    note: 'NSSDC: 382.8 × 10²⁴ J/s',
    source: SUN_SOURCES.nssdc,
  },
  {
    label: 'Mass converted to energy',
    value: '4.26 million t / s',
    note: 'NSSDC mass conversion rate 4260 × 10⁶ kg/s',
    source: SUN_SOURCES.nssdc,
  },
];

/** The proton–proton chain as described by NASA MSFC. */
export const PP_CHAIN_STEPS: { step: string; detail: string }[] = [
  { step: 'p + p → ²H + e⁺ + ν', detail: 'Two protons collide to produce deuterium, a positron and a neutrino.' },
  { step: '²H + p → ³He + γ', detail: 'A proton collides with the deuterium to produce helium-3 and a gamma ray.' },
  { step: '³He + ³He → ⁴He + 2p', detail: 'Two helium-3 nuclei collide to make helium-4, releasing two protons.' },
];

export const SUN_STORY = {
  fusion: {
    kicker: 'Fusion',
    title: 'A star burning hydrogen into helium',
    body:
      'In the core, nuclear reactions fuse hydrogen into helium through the proton–proton chain. The outward pressure from that energy holds up the star’s enormous mass against its own gravity. Energy then takes about 170,000 years to work its way through the radiative zone before convection carries it to the surface.',
    source: SUN_SOURCES.nasaFacts,
  },
  surface: {
    kicker: 'The photosphere',
    title: 'A surface made of light',
    body:
      'The Sun has no solid surface. What we see is the photosphere, a layer of plasma roughly 500 km thick that emits most of the visible light. Its mottled “granulation” is the top of the convection zone: hot plasma rises in cells and sinks again along darker lanes.',
    source: SUN_SOURCES.nasaFacts,
  },
  sunspots: {
    kicker: 'Magnetic activity',
    title: 'Sunspots and the solar cycle',
    body:
      'Sunspots look like holes but are regions slightly cooler than the surrounding photosphere, where the Sun’s magnetic field pokes through. Fields there reach about 3,000 gauss (NSSDC). Roughly every 11 years the Sun’s magnetic poles swap, and activity swings from quiet to violently active.',
    source: SUN_SOURCES.nasaFacts,
  },
  eruptions: {
    kicker: 'Prominences & flares',
    title: 'Loops of plasma held by magnetism',
    body:
      'Prominences are snakelike structures of cooler, denser plasma suspended above the surface by strong local magnetic fields. Solar flares are sudden releases of magnetic energy — the most powerful explosions in the solar system.',
    source: SUN_SOURCES.nasaFacts,
  },
} as const;

export const SUN_ARTISTIC_DISCLAIMER =
  'Artistic visualisation: granulation, sunspots, prominence loops and particle emission are procedurally generated to illustrate the physics. They are not simulations or observations of real solar events.';
