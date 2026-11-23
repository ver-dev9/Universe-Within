/**
 * Chapter 11 — The Architecture of the Universe.
 *
 * Every size below is a published estimate and is shown with "≈". The 3D web
 * in the chapter is procedural (not survey data) and the zoom between scales
 * is logarithmic, not to scale.
 */

export interface CosmicScale {
  id: string;
  name: string;
  kicker: string;
  /** Approximate diameter in light-years, as stated by the source. */
  sizeLy: number;
  sizeLabel: string;
  body: string;
  detail: string;
  sources: { label: string; url: string }[];
  accent: string;
}

export const COSMIC_SCALES: CosmicScale[] = [
  {
    id: 'local-group',
    name: 'The Local Group',
    kicker: 'Our galactic neighbourhood',
    sizeLy: 10e6,
    sizeLabel: '≈ 10 million ly across',
    body:
      'The Milky Way and Andromeda (M31) are the two most massive members of a gravitationally bound group of more than 30 galaxies, spread over a diameter of nearly 10 million light-years. Triangulum (M33) is third; most of the rest are dwarfs.',
    detail: 'Andromeda lies about 2.3 million light-years away — and is approaching us rather than receding.',
    sources: [
      { label: 'NASA Imagine the Universe — The Local Group', url: 'https://imagine.gsfc.nasa.gov/features/cosmic/local_group_info.html' },
    ],
    accent: '#69D9EF',
  },
  {
    id: 'virgo',
    name: 'Virgo Supercluster',
    kicker: 'A cluster of clusters',
    sizeLy: 100e6,
    sizeLabel: '≈ 100 million ly across',
    body:
      'Some 50 small groups like ours gather around the giant Virgo Cluster, about 65 million light-years away, in a flattened “cluster of clusters” called the Local or Virgo Supercluster. The Local Group sits near its edge.',
    detail: 'The supercluster’s collective mass is estimated at about 10¹⁵ times the mass of the Sun.',
    sources: [
      { label: 'NASA Imagine the Universe — Local Supercluster', url: 'https://imagine.gsfc.nasa.gov/features/cosmic/local_supercluster_info.html' },
    ],
    accent: '#3478D4',
  },
  {
    id: 'laniakea',
    name: 'Laniakea',
    kicker: '“Immense heaven” — our home supercluster',
    sizeLy: 520e6,
    sizeLabel: '≈ 520 million ly across (160 Mpc)',
    body:
      'In 2014, Tully, Courtois, Hoffman and Pomarède mapped how galaxies move after removing cosmic expansion, and traced the watershed where flows diverge. Inside it lies Laniakea: about 160 megaparsecs across, with the mass of some 10¹⁷ Suns and 100,000 large galaxies.',
    detail: 'Virgo is only one lobe of Laniakea, which also includes the Norma, Hydra and Centaurus clusters (the Great Attractor) and the Pavo-Indus filament.',
    sources: [
      { label: 'Tully et al. 2014, Nature 513, 71–73', url: 'https://www.nature.com/articles/nature13674' },
    ],
    accent: '#8A5BCA',
  },
  {
    id: 'observable',
    name: 'The Observable Universe',
    kicker: 'As far as light lets us see',
    sizeLy: 93e9,
    sizeLabel: '≈ 93 billion ly across',
    body:
      'The universe is about 13.8 billion years old, yet the visible universe is about 93 billion light-years across: space kept expanding while the oldest light travelled to us. Galaxies congregate in clusters and along filaments, and are missing from vast regions called voids — the cosmic web.',
    detail: 'There could be much more universe beyond this horizon that is simply too far away for its light to have reached us.',
    sources: [
      { label: 'ESA — Universe', url: 'https://www.esa.int/what-we-do/explore-discover-space/universe' },
      { label: 'ESA — Planck: age ≈ 13.8 billion years', url: 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_reveals_an_almost_perfect_Universe' },
      { label: 'Tully et al. 2014 — clusters, filaments and voids', url: 'https://www.nature.com/articles/nature13674' },
    ],
    accent: '#E7B86B',
  },
];

/**
 * Composition of the Universe (mass–energy density) from Planck's 2013 results.
 * ESA gives ordinary matter 4.9% and dark matter 26.8%; dark energy is the
 * remainder (≈ 68.3%). Rounded to ~5 / ~27 / ~68 in the UI.
 */
export const COSMIC_COMPOSITION = [
  { id: 'ordinary', label: 'Ordinary matter', pct: 4.9, rounded: '≈ 5%', color: '#E7B86B', note: 'Everything made of atoms: stars, planets, gas, us.' },
  { id: 'dark-matter', label: 'Dark matter', pct: 26.8, rounded: '≈ 27%', color: '#8A5BCA', note: 'Detected only by its gravity; it forms the scaffolding of the web.' },
  { id: 'dark-energy', label: 'Dark energy', pct: 68.3, rounded: '≈ 68%', color: '#3478D4', note: 'Thought to drive the accelerating expansion of the Universe.' },
] as const;

export const COMPOSITION_SOURCE = {
  label: 'ESA — Planck reveals an almost perfect Universe (2013)',
  url: 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_reveals_an_almost_perfect_Universe',
};

export const COSMIC_WEB_DISCLAIMER =
  'Artistic interpretation: the web is generated procedurally to show filaments, nodes and voids — it is not a map of real galaxies. The zoom between scales is logarithmic; sizes are published estimates.';

/** Per-quality particle budgets for the procedural web. */
export const WEB_BUDGET = {
  high: { macroParticles: 30000, microParticles: 9000, nodes: 90, lineNeighbors: 3 },
  medium: { macroParticles: 17000, microParticles: 5500, nodes: 70, lineNeighbors: 3 },
  low: { macroParticles: 7000, microParticles: 2500, nodes: 48, lineNeighbors: 2 },
} as const;
