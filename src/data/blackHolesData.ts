/**
 * Chapter 08 — Black Holes. Every figure here was checked on 2026-11-21/22 against
 * the page in its `source` field. Values the sources give as rounded or
 * approximate are flagged `estimate: true` so the UI can mark them.
 */

export interface SourcedFact {
  label: string;
  value: string;
  detail?: string;
  estimate?: boolean;
  source: { name: string; url: string };
}

export const BH_SOURCES = {
  nasaTypes: { name: 'NASA Science — Black Hole Types', url: 'https://science.nasa.gov/universe/black-holes/types/' },
  nasaAnatomy: { name: 'NASA Science — Black Hole Anatomy', url: 'https://science.nasa.gov/universe/black-holes/anatomy/' },
  apodPhotonSphere: {
    name: 'NASA APOD (2 Jul 2013) — Circling a Black Hole at its Photon Sphere',
    url: 'https://science.nasa.gov/image-article/apod-2013-july-2-circling-a-black-hole-at-its-photon-sphere/',
  },
  ehtSgrA: {
    name: 'Event Horizon Telescope — First image of Sgr A* (12 May 2022)',
    url: 'https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy',
  },
  ehtM87: {
    name: 'Event Horizon Telescope — First image of M87* (10 Apr 2019)',
    url: 'https://eventhorizontelescope.org/press-release-april-10-2019-astronomers-capture-first-image-black-hole',
  },
  esoSgrA: {
    name: 'ESO eso2208 — First image of the black hole at the heart of our galaxy',
    url: 'https://www.eso.org/public/news/eso2208-eht-mw/',
  },
  esoSpotDifference: {
    name: 'ESOblog — Spot the difference: imaging Sgr A* and M87*',
    url: 'https://www.eso.org/public/blog/spot-the-difference-sagittarius-a-m87/',
  },
  nasaIsco: {
    name: 'NASA HEASARC — ISCO Facto? (2 Apr 2012)',
    url: 'https://heasarc.gsfc.nasa.gov/docs/objects/heapow/archive/compact_objects/isco_rxte.html',
  },
  nasaSvsDisk: { name: 'NASA SVS — Black Hole Accretion Disk', url: 'https://svs.gsfc.nasa.gov/10139/' },
} as const;

/** Scroll beats of the chapter, in order. */
export interface BlackHoleBeat {
  id: string;
  kicker: string;
  title: string;
  body: string;
  facts?: SourcedFact[];
}

export const BLACK_HOLE_BEATS: BlackHoleBeat[] = [
  {
    id: 'formation',
    kicker: 'Formation',
    title: 'When a giant star dies',
    body:
      'A star with more than eight times the Sun’s mass ends its life in a supernova. If the star had around twenty solar masses or more, its core keeps collapsing until nothing — not even light — can climb back out.',
    facts: [
      {
        label: 'Collapse threshold',
        value: '≈ 20 solar masses',
        detail: 'Stars near 8 M☉ leave neutron stars; ≈20 M☉ or more leave black holes.',
        estimate: true,
        source: BH_SOURCES.nasaTypes,
      },
    ],
  },
  {
    id: 'horizon',
    kicker: 'Event horizon',
    title: 'The point of no return',
    body:
      'Inside the event horizon the escape speed exceeds the speed of light. The black hole emits nothing itself; the dark disc you see is its shadow — light captured or bent away — which appears roughly twice the size of the horizon.',
    facts: [
      { label: 'Shadow size', value: '≈ 2× the horizon', estimate: true, source: BH_SOURCES.nasaAnatomy },
    ],
  },
  {
    id: 'photon-sphere',
    kicker: 'Photon sphere',
    title: 'Where light can orbit',
    body:
      'At 1.5 Schwarzschild radii — 50 % farther out than the horizon — gravity bends light into circular orbits. Light that skims this sphere wraps around the hole before escaping, stacking thin rings at the edge of the shadow.',
    facts: [
      { label: 'Photon sphere radius', value: '1.5 R_s', detail: 'Non-rotating (Schwarzschild) black hole.', source: BH_SOURCES.apodPhotonSphere },
    ],
  },
  {
    id: 'isco',
    kicker: 'ISCO',
    title: 'The last stable orbit',
    body:
      'Around a non-spinning black hole there is a minimum distance inside which matter cannot keep orbiting: the innermost stable circular orbit. Gas that drifts inside it plunges toward the horizon, so the ISCO sets the inner edge of the accretion disk — the gap you see between the glowing gas and the shadow. A spinning black hole lets the disk reach closer.',
    facts: [
      {
        label: 'ISCO radius (non-spinning)',
        value: '6 GM/c² = 3 R_s',
        detail: 'Shown here as the disk’s inner edge at 3 Schwarzschild radii.',
        source: BH_SOURCES.nasaIsco,
      },
      { label: 'Spinning black holes', value: 'Inner edge moves closer', source: BH_SOURCES.nasaSvsDisk },
    ],
  },
  {
    id: 'accretion',
    kicker: 'Accretion',
    title: 'A disk bent over the top',
    body:
      'Infalling gas settles into a hot, fast-spinning disk. Lensing lifts the far side of the disk into a hump above the shadow and another below it. The side turning toward us is brighter and bluer — Doppler beaming — while the receding side dims and reddens.',
    facts: [
      { label: 'Brighter side', value: 'Approaching gas', detail: 'Doppler beaming', source: BH_SOURCES.nasaAnatomy },
    ],
  },
  {
    id: 'scale',
    kicker: 'Stellar-mass vs supermassive',
    title: 'From a few Suns to billions',
    body:
      'Stellar-mass black holes range from a few to hundreds of solar masses. Supermassive black holes sit in the centres of almost every large galaxy, with hundreds of thousands to billions of solar masses.',
    facts: [
      {
        label: 'Stellar-mass black holes in the Milky Way',
        value: '≈ 50 known · up to 100 million estimated',
        estimate: true,
        source: BH_SOURCES.nasaTypes,
      },
    ],
  },
  {
    id: 'giants',
    kicker: 'Sgr A* & M87*',
    title: 'The two we have imaged',
    body:
      'The Event Horizon Telescope links radio dishes across Earth into one planet-sized telescope. It photographed the shadow of M87* in 2019 and of Sagittarius A*, at the heart of our own galaxy, in 2022. Their rings look about the same size on the sky: M87* is far bigger but also far more distant.',
    facts: [
      {
        label: 'Sagittarius A* (Milky Way centre)',
        value: '≈ 4 million M☉ · ≈ 27,000 light-years away',
        detail: 'Image released 12 May 2022. From Earth it looks about the size of a doughnut on the Moon.',
        estimate: true,
        source: BH_SOURCES.esoSgrA,
      },
      {
        label: 'M87* (galaxy Messier 87)',
        value: '≈ 6.5 billion M☉ · ≈ 55 million light-years away',
        detail: 'First image of a black hole, released 10 April 2019.',
        estimate: true,
        source: BH_SOURCES.ehtM87,
      },
      {
        label: 'Same-size rings',
        value: 'Bigger but farther vs smaller but closer',
        source: BH_SOURCES.esoSpotDifference,
      },
    ],
  },
];

export const BLACK_HOLE_DISCLAIMER =
  'Approximate visualization: light paths are bent by a simplified Schwarzschild ray tracer running on your GPU. It is not a numerical-relativity simulation; disk colours and brightness are stylised.';
