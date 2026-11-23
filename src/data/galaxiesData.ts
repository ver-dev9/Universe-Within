/**
 * Chapter 09 — Galaxies. Facts checked on 2026-11-21/22 against the page in each
 * `source`. `estimate: true` marks values the source itself gives as rounded,
 * approximate or model-dependent.
 */

export type GalaxyKind = 'milky-way' | 'andromeda' | 'elliptical' | 'irregular' | 'interacting';

export interface GalaxyFact {
  label: string;
  value: string;
  estimate?: boolean;
  /** Overrides the object's main source for this one line. */
  source?: { name: string; url: string };
}

export interface GalaxyProfile {
  id: GalaxyKind;
  /** Short selector label. */
  label: string;
  name: string;
  classification: string;
  summary: string;
  facts: GalaxyFact[];
  source: { name: string; url: string };
}

const S = {
  nasaGalaxies: { name: 'NASA Science — Galaxies', url: 'https://science.nasa.gov/universe/galaxies/' },
  nasaTypes: { name: 'NASA Science — Galaxy Types', url: 'https://science.nasa.gov/universe/galaxies/types/' },
  nasaImagineMw: {
    name: 'NASA Imagine the Universe — The Milky Way Galaxy',
    url: 'https://imagine.gsfc.nasa.gov/science/featured_science/milkyway',
  },
  esaGaiaGuide: { name: 'ESA Gaia — Guide to our Galaxy', url: 'https://sci.esa.int/web/gaia/-/53147-guide-to-our-galaxy' },
  nasaMwArms: { name: 'NASA — The Milky Way Galaxy (Spitzer)', url: 'https://science.nasa.gov/resource/the-milky-way-galaxy/' },
  ehtSgrA: {
    name: 'Event Horizon Telescope — Sgr A* (2022)',
    url: 'https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy',
  },
  hubbleM31: {
    name: 'NASA Hubble — Messier 31',
    url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/',
  },
  esaM31: { name: 'ESA/Hubble heic2501 — Andromeda mosaic', url: 'https://esahubble.org/news/heic2501/' },
  esaCollision: { name: 'ESA/Hubble heic2508 — Milky Way–Andromeda collision odds', url: 'https://esahubble.org/news/heic2508/' },
  hubbleM87: {
    name: 'NASA Hubble — Messier 87',
    url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-87/',
  },
  ehtM87: {
    name: 'Event Horizon Telescope — M87* (2019)',
    url: 'https://eventhorizontelescope.org/press-release-april-10-2019-astronomers-capture-first-image-black-hole',
  },
  nasaLmc: { name: 'NASA Earth Observatory — The Galaxy Next Door', url: 'https://science.nasa.gov/earth/earth-observatory/the-galaxy-next-door' },
  hubbleAntennae: {
    name: 'NASA Hubble — Caldwell 60/61 (Antennae)',
    url: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-60-61/',
  },
} as const;

export const GALAXY_SOURCES = S;

export const GALAXIES: GalaxyProfile[] = [
  {
    id: 'milky-way',
    label: 'Milky Way',
    name: 'The Milky Way',
    classification: 'Barred spiral',
    summary:
      'Our home galaxy. Two major arms, Scutum–Centaurus and Perseus, wrap off the ends of a thick central bar of stars; the Norma and Sagittarius arms are fainter.',
    facts: [
      { label: 'Diameter', value: '≈ 100,000 light-years', estimate: true, source: S.nasaImagineMw },
      { label: 'Sun’s distance from the centre', value: '≈ 26,000 light-years', estimate: true, source: S.esaGaiaGuide },
      { label: 'Stars', value: '≈ 100 billion', estimate: true, source: S.esaGaiaGuide },
      { label: 'Major arms', value: 'Scutum–Centaurus and Perseus', source: S.nasaMwArms },
      { label: 'Central black hole', value: 'Sgr A*, ≈ 4 million M☉', estimate: true, source: S.ehtSgrA },
    ],
    source: S.nasaGalaxies,
  },
  {
    id: 'andromeda',
    label: 'Andromeda',
    name: 'Andromeda (M31)',
    classification: 'Barred spiral',
    summary:
      'Our nearest large galactic neighbour. On a very clear autumn night it can be seen with the naked eye as a faint, cigar-shaped glow.',
    facts: [
      { label: 'Distance', value: '≈ 2.5 million light-years', estimate: true, source: S.hubbleM31 },
      { label: 'Stars', value: '≈ 1 trillion (estimate)', estimate: true, source: S.esaM31 },
      { label: 'Size on our sky', value: '≈ 6× the full Moon’s diameter', estimate: true, source: S.hubbleM31 },
      {
        label: 'Collision with the Milky Way',
        value: '≈ 50–50 chance within 10 billion years (Hubble + Gaia, 2025)',
        estimate: true,
        source: S.esaCollision,
      },
    ],
    source: S.hubbleM31,
  },
  {
    id: 'elliptical',
    label: 'Elliptical',
    name: 'Messier 87',
    classification: 'Giant elliptical',
    summary:
      'Ellipticals hold little gas or dust and show little structure; scientists think they originate from collisions and mergers. M87 is home to a supermassive black hole and a swarm of globular clusters.',
    facts: [
      { label: 'Distance', value: '≈ 54 million light-years (EHT gives ≈ 55 million)', estimate: true, source: S.hubbleM87 },
      { label: 'Stars', value: 'several trillion', estimate: true, source: S.hubbleM87 },
      { label: 'Globular clusters', value: '≈ 15,000', estimate: true, source: S.hubbleM87 },
      { label: 'Central black hole', value: 'M87*, ≈ 6.5 billion M☉', estimate: true, source: S.ehtM87 },
    ],
    source: S.hubbleM87,
  },
  {
    id: 'irregular',
    label: 'Irregular',
    name: 'Large Magellanic Cloud',
    classification: 'Irregular dwarf',
    summary:
      'No spiral or elliptical order — clumps of stars and glowing star-forming gas. Irregular galaxies range from about 100 million to 10 billion solar masses.',
    facts: [
      { label: 'Distance', value: '≈ 160,000 light-years', estimate: true, source: S.nasaLmc },
      { label: 'Stars', value: 'billions', estimate: true, source: S.nasaLmc },
      { label: 'Irregulars’ mass range', value: '≈ 10⁸ – 10¹⁰ M☉', estimate: true, source: S.nasaTypes },
    ],
    source: S.nasaLmc,
  },
  {
    id: 'interacting',
    label: 'Interacting',
    name: 'The Antennae (NGC 4038/4039)',
    classification: 'Interacting spirals',
    summary:
      'Two spirals in a collision. Tides have pulled long streamers of stars into space, and the gas is collapsing into a starburst. Their cores will coalesce into one large elliptical.',
    facts: [
      { label: 'Distance', value: '≈ 65 million light-years', estimate: true, source: S.hubbleAntennae },
      { label: 'Star formation', value: 'Starburst', source: S.hubbleAntennae },
      { label: 'Fate', value: 'Merge into one elliptical', source: S.hubbleAntennae },
    ],
    source: S.hubbleAntennae,
  },
];

/** Copy for the scroll journey that zooms out from single stars to a whole galaxy. */
export const GALAXY_JOURNEY = [
  {
    id: 'stars',
    kicker: 'Zoom 1 · Stars',
    title: 'Every point is a sun',
    body: 'Start among the stars of a spiral arm. Each point of light is a sun, separated from its neighbours by light-years of empty space.',
  },
  {
    id: 'arm',
    kicker: 'Zoom 2 · A spiral arm',
    title: 'Arms of young blue stars',
    body: 'Pull back and the stars line up into arms, lit by young blue stars and pink star-forming gas, edged by dark lanes of dust.',
  },
  {
    id: 'galaxy',
    kicker: 'Zoom 3 · A galaxy',
    title: 'A disk of stars more than 100,000 light-years across',
    body: 'Galaxies range from a few thousand stars spanning a few hundred light-years to trillions of stars more than a million light-years across. Most are 10 to 13.6 billion years old.',
  },
] as const;

export const GALAXY_DISCLAIMER =
  'Procedural point models, not survey data: shapes follow published descriptions; star counts, colours and proportions are illustrative.';
