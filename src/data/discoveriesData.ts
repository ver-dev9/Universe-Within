export interface CosmicDiscovery {
  id: string;
  title: string;
  agency: string;
  yearLaunchedOrDiscovered: string;
  category: 'Observatory' | 'Deep Space Probe' | 'Planetary Mission' | 'Astrophysics Discovery';
  highlightMetric: string;
  metricLabel: string;
  summary: string;
  scientificBreakthroughs: string[];
  referenceUrl: string;
  status: 'Operational' | 'Interstellar Flight' | 'Ongoing Research';
}

export const COSMIC_DISCOVERIES: CosmicDiscovery[] = [
  {
    id: 'jwst',
    title: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    yearLaunchedOrDiscovered: '2021',
    category: 'Observatory',
    highlightMetric: '1.5M km',
    metricLabel: 'Distance at Sun-Earth L2 Orbit',
    summary: 'Equipped with a 6.5-meter gold-coated beryllium primary mirror and cryogenically cooled infrared instruments, JWST peers through obscuring cosmic dust to observe the earliest stars and galaxies formed after the Big Bang and characterize exoplanet atmospheres.',
    scientificBreakthroughs: [
      'Discovered galaxies dating to just 300 million years after the Big Bang (e.g., JADES-GS-z14-0).',
      'First unambiguous molecular detection of carbon dioxide (CO2) and methane (CH4) in exoplanet atmospheres (WASP-39b and K2-18b).',
      'Revealed unprecedented dynamic stellar nursery details in the Carina and Tarantula Nebulae.'
    ],
    referenceUrl: 'https://webb.nasa.gov',
    status: 'Operational'
  },
  {
    id: 'hubble',
    title: 'Hubble Space Telescope',
    agency: 'NASA / ESA',
    yearLaunchedOrDiscovered: '1990',
    category: 'Observatory',
    highlightMetric: '1.6M+',
    metricLabel: 'Science Observations Recorded',
    summary: 'Orbiting in Low Earth Orbit above Earth\'s distorting atmosphere, Hubble revolutionized modern astronomy over more than three decades with razor-sharp UV, optical, and near-IR vision.',
    scientificBreakthroughs: [
      'Determined the precise rate of universal expansion (Hubble Constant) via Cepheid variable star distance ladders.',
      'Proved that supermassive black holes reside in the centers of virtually every massive galaxy.',
      'The iconic Hubble Deep Field imaged thousands of nascent galaxies in an apparently blank patch of the sky.'
    ],
    referenceUrl: 'https://hubblesite.org',
    status: 'Operational'
  },
  {
    id: 'voyager',
    title: 'Voyager 1 & 2 Interstellar Mission',
    agency: 'NASA JPL',
    yearLaunchedOrDiscovered: '1977',
    category: 'Deep Space Probe',
    highlightMetric: '24+ Billion km',
    metricLabel: 'Current Distance from Earth',
    summary: 'The twin Voyager probes completed the "Grand Tour" of the outer planets (Jupiter, Saturn, Uranus, Neptune) before embarking into uncharted interstellar space, each carrying the Golden Record message for extraterrestrial civilizations.',
    scientificBreakthroughs: [
      'Voyager 1 crossed the heliopause in August 2012, becoming humanity\'s first artifact to sample pure interstellar medium.',
      'Discovered active volcanism on Jupiter’s moon Io and braided ringlets around Saturn.',
      'Captured the legendary "Pale Blue Dot" photograph of Earth from a distance of 6 billion kilometers in 1990.'
    ],
    referenceUrl: 'https://voyager.jpl.nasa.gov',
    status: 'Interstellar Flight'
  },
  {
    id: 'mars-rovers',
    title: 'Mars Exploration: Perseverance & Curiosity',
    agency: 'NASA JPL',
    yearLaunchedOrDiscovered: '2012 / 2020',
    category: 'Planetary Mission',
    highlightMetric: 'Jezero & Gale',
    metricLabel: 'Ancient Paleolake Craters Explored',
    summary: 'Equipped with nuclear power (MMRTG), mass spectrometers, sub-surface ground penetrating radar, and the first powered Martian aircraft (Ingenuity helicopter), these mobile robotic laboratories interrogate Mars for paleo-environmental habitability.',
    scientificBreakthroughs: [
      'Proved Gale Crater hosted a long-lived fresh water lake system with chemical building blocks necessary for microbial life.',
      'Perseverance collected hermetically sealed bedrock core samples for the upcoming Mars Sample Return mission.',
      'Discovered diverse organic carbon compounds preserved in mudstones dating back 3.5 billion years.'
    ],
    referenceUrl: 'https://mars.nasa.gov',
    status: 'Operational'
  },
  {
    id: 'exoplanets',
    title: 'The Exoplanet Revolution (Kepler & TESS)',
    agency: 'NASA / Kepler / TESS',
    yearLaunchedOrDiscovered: '2009 / 2018',
    category: 'Astrophysics Discovery',
    highlightMetric: '5,600+',
    metricLabel: 'Confirmed Worlds Beyond Sol',
    summary: 'High-precision photometric transit monitoring proved that planets are ubiquitous in the cosmos, averaging at least one planet per star in our galaxy, uncovering unexpected planet classes including "Super-Earths" and "Hot Jupiters".',
    scientificBreakthroughs: [
      'Discovery of the TRAPPIST-1 system: seven Earth-sized terrestrial worlds orbiting an ultra-cool red dwarf, three in the habitable zone.',
      'Demonstrated that rocky planets around the size of Earth are among the most statistically common in the galaxy.',
      'Atmospheric transmission spectroscopy characterizing weather, cloud composition, and water vapor on distant worlds.'
    ],
    referenceUrl: 'https://exoplanets.nasa.gov',
    status: 'Ongoing Research'
  },
  {
    id: 'gravitational-waves',
    title: 'Gravitational Waves & Spacetime Ripples',
    agency: 'LIGO / Virgo / KAGRA',
    yearLaunchedOrDiscovered: '2015',
    category: 'Astrophysics Discovery',
    highlightMetric: '10⁻¹⁸ meters',
    metricLabel: 'Laser Interferometer Sensitivity',
    summary: 'On September 14, 2015, the Laser Interferometer Gravitational-Wave Observatory (LIGO) made the historic first direct detection (GW150914) of gravitational waves—ripples in spacetime generated by two merging stellar-mass black holes 1.3 billion light-years distant.',
    scientificBreakthroughs: [
      'Confirmed Albert Einstein\'s 1916 General Theory of Relativity prediction of spacetime perturbations propagating at the speed of light.',
      'Inaugurated multi-messenger astrophysics with GW170817: the simultaneous detection of gravitational waves and gamma-ray bursts from a binary neutron star kilonova.',
      'Verified the creation of heavy cosmic elements (gold and platinum) forged during neutron star collisions.'
    ],
    referenceUrl: 'https://www.ligo.caltech.edu',
    status: 'Operational'
  },
  {
    id: 'dark-sector',
    title: 'The Dark Sector: Dark Matter & Dark Energy',
    agency: 'Global Astrophysics Consortium',
    yearLaunchedOrDiscovered: '1998 (Acceleration)',
    category: 'Astrophysics Discovery',
    highlightMetric: '95.1%',
    metricLabel: 'Percentage of Cosmic Energy Unknown',
    summary: 'Standard baryonic matter (atoms making up all stars, gas, and planets) accounts for only 4.9% of the total cosmic energy density. The remaining 95.1% consists of cold Dark Matter (26.8%) and Dark Energy (68.3%) driving cosmic acceleration.',
    scientificBreakthroughs: [
      'Type Ia supernova distance luminosity measurements in 1998 proved the universe’s expansion rate is accelerating under negative pressure (Dark Energy).',
      'Gravitational lensing of the Bullet Cluster directly separated the hot ordinary gas from the non-collisional dark matter mass distribution.',
      'Precision angular power spectrum peaks of the Cosmic Microwave Background by WMAP and Planck confirm precise cosmic percentages.'
    ],
    referenceUrl: 'https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy',
    status: 'Ongoing Research'
  }
];
