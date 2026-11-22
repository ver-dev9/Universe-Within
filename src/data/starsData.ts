/**
 * Chapter 06 — The Life and Death of Stars.
 *
 * Every factual sentence here is paraphrased from the NASA pages listed in
 * STAR_SOURCES and carries the URL it came from. Numbers are only the ones those
 * pages state. Surface temperatures in the 3D scene are *relative* (a colour
 * model), not measured values, and the UI says so.
 */

export const STAR_SOURCES = {
  starBasics: {
    label: 'NASA Science — Stars: Birth, Life, Death',
    url: 'https://science.nasa.gov/universe/stars/',
  },
  heavyElements: {
    label: 'NASA — Where Does Gold Come From? NASA Data Has Clues (2025)',
    url: 'https://science.nasa.gov/universe/stars/neutron-stars/magnetars/where-does-gold-come-from-nasa-data-has-clues',
  },
  kilonova: {
    label: 'NASA — NASA Missions Catch First Light from a Gravitational-Wave Event (2017)',
    url: 'https://www.nasa.gov/news-release/nasa-missions-catch-first-light-from-a-gravitational-wave-event',
  },
  massThreshold: {
    label: 'NASA HEASARC — Finding a Pulse in a Dead Star (massive stars > ~8 solar masses → core-collapse)',
    url: 'https://heasarc.gsfc.nasa.gov/docs/objects/heapow/archive/compact_objects/lsi61303_fast.html',
  },
} as const;

export type MassPath = 'low' | 'high' | 'veryHigh';

export interface MassOption {
  id: MassPath;
  label: string;
  short: string;
  description: string;
  sourceUrl: string;
}

export const MASS_OPTIONS: MassOption[] = [
  {
    id: 'low',
    label: 'Sun-like star',
    short: '~1 M☉',
    description:
      'A low-mass star like the Sun swells into a giant, sheds its outer layers as a planetary nebula, and leaves an Earth-sized white dwarf.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    id: 'high',
    label: 'Massive star',
    short: '> ~8 M☉',
    description:
      'Stars above roughly eight solar masses fuse elements all the way to iron, then their cores collapse in a supernova that can leave a neutron star.',
    sourceUrl: STAR_SOURCES.massThreshold.url,
  },
  {
    id: 'veryHigh',
    label: 'Most massive stars',
    short: 'black-hole path',
    description:
      'For the most massive stars the collapsing core survives not as a neutron star but as a black hole.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
];

export interface StarStage {
  id: string;
  index: number;
  title: string;
  /** Short line for the stage rail. */
  kicker: string;
  /** Body text shared by all masses. */
  body: string;
  /** Optional mass-specific override of the body. */
  byMass?: Partial<Record<MassPath, string>>;
  sourceUrl: string;
  /** Second source for a mass-specific detail (e.g. neutron-star density). */
  alsoSourceUrl?: string;
}

export const STAR_STAGES: StarStage[] = [
  {
    id: 'nebula',
    index: 0,
    title: 'Stellar nursery',
    kicker: 'Cold molecular cloud',
    body:
      'Stars form in molecular clouds of gas and dust — from 1,000 to 10 million times the mass of the Sun and up to hundreds of light-years across. The cold gas clumps; some clumps grow until gravity makes them collapse.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    id: 'protostar',
    index: 1,
    title: 'Protostar',
    kicker: 'Collapse heats the core',
    body:
      'As a clump collapses, the material heats up and a protostar — a baby star — forms. At first most of its energy comes from the heat released by that collapse, not from fusion.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    id: 'main-sequence',
    index: 2,
    title: 'Main sequence',
    kicker: 'Hydrogen → helium fusion',
    body:
      'Immense pressure and temperature in the core squeeze hydrogen nuclei together into helium. This nuclear fusion releases the energy that stops the star collapsing. It is the longest phase of a star’s life — the Sun is roughly midway through it.',
    byMass: {
      high:
        'Fusion of hydrogen into helium holds the star up against gravity. Massive stars must burn their fuel far faster to support their own weight, so they shine hotter and bluer and may live only a few million years.',
      veryHigh:
        'Fusion of hydrogen into helium holds the star up against gravity. The most massive stars burn through their fuel fastest of all — some live only a few million years.',
    },
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    id: 'giant',
    index: 3,
    title: 'Giant',
    kicker: 'Core hydrogen runs out',
    body:
      'When the core runs out of hydrogen it contracts and heats up, and the star slowly puffs up. A low-mass star becomes a giant while fusing helium into carbon in its core — the fate of our Sun in several billion years.',
    byMass: {
      high:
        'A massive star swells into a supergiant and goes further: carbon fuses into oxygen, neon and magnesium, and in the largest stars the chain continues until silicon fuses into iron. Each new fuel buys less time — the last step lasts only days.',
      veryHigh:
        'The core builds onion-like shells of ever-heavier elements, ending with silicon fusing into iron. Fusing iron would consume energy instead of releasing it, so the core has nothing left to burn.',
    },
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    id: 'death',
    index: 4,
    title: 'Death',
    kicker: 'Mass decides the ending',
    body:
      'Some giants pulsate and eject parts of their atmosphere. Eventually all the outer layers blow away, forming an expanding cloud of gas and dust called a planetary nebula.',
    byMass: {
      high:
        'The iron core collapses until forces between nuclei push back, then rebounds. The shock wave tears outward through the star in a supernova explosion.',
      veryHigh:
        'The iron core collapses and rebounds, driving a shock wave through the star: a supernova. The material it throws out enriches the clouds that will form the next stars.',
    },
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    id: 'remnant',
    index: 5,
    title: 'Remnant',
    kicker: 'What is left behind',
    body:
      'All that remains is the core: a white dwarf, a roughly Earth-sized stellar cinder that gradually cools over billions of years.',
    byMass: {
      high:
        'The core survives as an incredibly dense neutron star. One teaspoon of its material would weigh about a billion tons on Earth.',
      veryHigh: 'Instead of a neutron star, the collapsed core survives as a black hole.',
    },
    sourceUrl: STAR_SOURCES.starBasics.url,
    alsoSourceUrl: STAR_SOURCES.heavyElements.url,
  },
];

export interface ElementFact {
  title: string;
  body: string;
  sourceUrl: string;
}

export const ELEMENT_FACTS: ElementFact[] = [
  {
    title: 'Fusion powers every star',
    body: 'In the core, hydrogen nuclei fuse into helium. The energy released creates pressure that balances gravity.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    title: 'Cores forge elements up to iron',
    body: 'Massive stars fuse carbon into oxygen, neon and magnesium, then silicon into iron. Fusing iron would cost energy, so the chain stops there.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
  {
    title: 'Heavier than iron needs extremes',
    body: 'Neutron-rich explosions such as neutron-star mergers can rapidly build elements like gold, platinum and uranium. The 2017 merger confirmed this can happen; magnetar flares may contribute too.',
    sourceUrl: STAR_SOURCES.heavyElements.url,
  },
  {
    title: 'Stardust recycles',
    body: 'Material cast out by supernovae and other stellar events enriches future molecular clouds and is built into the next generation of stars.',
    sourceUrl: STAR_SOURCES.starBasics.url,
  },
];

/**
 * Visual keyframes (artistic model, not to scale). `temp` is a relative colour
 * temperature in kelvin fed to the blackbody approximation in the surface
 * shader; `radius` is in scene units. Index matches STAR_STAGES.
 */
export interface StarVisualKey {
  temp: number;
  radius: number;
}

export const STAR_VISUAL_KEYS: Record<MassPath, StarVisualKey[]> = {
  low: [
    { temp: 2200, radius: 0.0 },
    { temp: 3200, radius: 0.55 },
    { temp: 5800, radius: 0.9 },
    { temp: 3300, radius: 2.3 },
    { temp: 9000, radius: 0.35 },
    { temp: 20000, radius: 0.16 },
  ],
  high: [
    { temp: 2200, radius: 0.0 },
    { temp: 4200, radius: 0.8 },
    { temp: 22000, radius: 1.35 },
    { temp: 3500, radius: 2.9 },
    { temp: 30000, radius: 0.2 },
    { temp: 40000, radius: 0.1 },
  ],
  veryHigh: [
    { temp: 2200, radius: 0.0 },
    { temp: 4800, radius: 0.95 },
    { temp: 30000, radius: 1.6 },
    { temp: 3600, radius: 3.1 },
    { temp: 30000, radius: 0.2 },
    { temp: 30000, radius: 0.0 },
  ],
};

/** Stage boundaries along the 0..1 scroll progress of the chapter. */
export const STAGE_COUNT = STAR_STAGES.length;
export const stageFromProgress = (p: number) => Math.min(STAGE_COUNT - 1, Math.max(0, Math.floor(p * STAGE_COUNT)));
