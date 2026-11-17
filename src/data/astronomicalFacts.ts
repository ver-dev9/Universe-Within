export interface DeepSpaceTopic {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  description: string;
  scientificContext: string;
}

export const DEEP_SPACE_FACTS: DeepSpaceTopic[] = [
  {
    id: 'observable-universe',
    title: 'The Observable Universe',
    subtitle: 'Cosmic Horizon of Light',
    value: '93 Billion Light-Years',
    description: 'The observable universe is a sphere with a co-moving diameter of approximately 93 billion light-years (28.5 gigaparsecs). Because spacetime itself expands continuously, objects whose light originated 13.8 billion years ago are currently over 46.5 billion light-years distant.',
    scientificContext: 'Calculated using the Lambda-CDM cosmological concordance model constrained by Planck satellite cosmic microwave background (CMB) measurements.'
  },
  {
    id: 'galaxies-count',
    title: 'Galactic Abundance',
    subtitle: 'Islands of Stars in the Void',
    value: '2 Trillion Galaxies',
    description: 'Deep-field photographic integration and mathematical modeling estimate between 100 billion and 2 trillion galaxies populate the observable universe. The Milky Way is a barred spiral galaxy spanning ~100,000 light-years with over 100 to 400 billion stars.',
    scientificContext: 'Derived from Hubble Ultra-Deep Field 3D census analysis led by Christopher Conselice et al. (University of Nottingham).'
  },
  {
    id: 'interstellar-space',
    title: 'Interstellar Medium (ISM)',
    subtitle: 'The Matter Between Suns',
    value: '1 Atom per cm³',
    description: 'Interstellar space is far from completely empty: it contains low-density gas (99% hydrogen and helium) and microscopic silicate/carbonaceous dust grains that absorb and scatter starlight, creating dark absorption nebulae and reflective molecular clouds.',
    scientificContext: 'Direct in-situ interstellar density measured by NASA Voyager 1 after crossing the heliopause in August 2012.'
  },
  {
    id: 'cosmic-web',
    title: 'The Cosmic Web',
    subtitle: 'Large-Scale Structure of Spacetime',
    value: 'Filaments & Voids',
    description: 'Galaxies are not scattered randomly: they are organized along vast gravitational filaments woven around immense cosmological voids (such as the Boötes void, 330 million light-years across), tracing primordial quantum fluctuations amplified by inflation.',
    scientificContext: 'Observed by the Sloan Digital Sky Survey (SDSS) and DESI (Dark Energy Spectroscopic Instrument).'
  }
];

export interface CosmicPhenomenon {
  id: string;
  name: string;
  type: string;
  tagline: string;
  scientificExplanation: string;
  keyPhysics: string[];
  visualDescription: string;
}

export const COSMIC_PHENOMENA: CosmicPhenomenon[] = [
  {
    id: 'black-hole',
    name: 'Supermassive Black Hole',
    type: 'Gravitational Singularity',
    tagline: 'Where Spacetime Bends to Infinity',
    scientificExplanation: 'A region of spacetime where gravitational acceleration is so intense that nothing—no particles or even electromagnetic radiation such as light—can escape. Defined by the Schwarzschild radius Rs = 2GM/c², the event horizon marks the boundary of causal disconnection from the external universe.',
    keyPhysics: [
      'Schwarzschild Event Horizon: Critical radius where escape velocity equals light speed.',
      'Accretion Disk Relativistic Beaming: Gas orbiting near c heats to millions of Kelvin via viscous friction, exhibiting Doppler blue/red shifting.',
      'Gravitational Lensing: Extreme curvature bends background light photons, projecting an apparent "shadow" ring double the physical horizon diameter.'
    ],
    visualDescription: 'Pitch-black spherical shadow enveloped in a blinding golden-cyan photon ring with warped accretion arcs and polar relativistic jets.'
  },
  {
    id: 'stellar-nebula',
    name: 'Emission & Reflection Nebula',
    type: 'Stellar Nursery',
    tagline: 'Cradle of New Solar Systems',
    scientificExplanation: 'Interstellar clouds of ionized gas (primarily H II regions) and cosmic dust where gravitational collapse under Jeans instability compresses matter to ignite thermonuclear protostars.',
    keyPhysics: [
      'Photoionization: Ultraviolet radiation from massive O and B stars excites hydrogen gas, radiating iconic 656.3 nm H-alpha red/pink glow.',
      'Bok Globules: Dense, dark pockets of dust and molecular gas undergoing gravitational collapse into young stellar objects.',
      'Stellar Winds: High-velocity radiation pressure carving vast cavities and elephant trunk pillars inside the nebula.'
    ],
    visualDescription: 'Luminescent billows of translucent purple, cyan, and magenta gas threaded with intricate silhouetted dust pillars.'
  },
  {
    id: 'supernova-remnant',
    name: 'Type II Supernova Remnant',
    type: 'Core-Collapse Stellar Explosion',
    tagline: 'Cosmic Crucible of Heavy Elements',
    scientificExplanation: 'The cataclysmic terminal detonation of a star greater than 8 solar masses when core iron fusion cannot yield exothermic pressure, precipitating core collapse within milliseconds and rebounding in a blast wave exceeding 30,000 km/s.',
    keyPhysics: [
      'Nucleosynthesis: Shock-wave r-process neutron capture forging elements heavier than iron, such as gold, platinum, and uranium.',
      'Neutron Star / Pulsar remnant: Stellar core collapses into degenerate neutron matter spinning hundreds of times per second.',
      'Synchrotron Shock Front: High-energy relativistic electrons gyrating through compressed magnetic fields emitting diffuse X-ray and radio photons.'
    ],
    visualDescription: 'Expanding filaments of glowing ejecta in concentric shockwaves, with a pulsing blue magnetic lighthouse at its epicenter.'
  },
  {
    id: 'asteroid-kuiper-belts',
    name: 'Asteroid & Kuiper Belts',
    type: 'Primordial Debris Disks',
    tagline: 'Fossilized Remnants of Planetary Creation',
    scientificExplanation: 'The Main Asteroid Belt (between Mars and Jupiter) and Kuiper Belt (beyond Neptune, 30-55 AU) preserve primordial planetesimals prevented from accreting into planets by Jupiter and Neptune’s gravitational resonances.',
    keyPhysics: [
      'Kirkwood Gaps: Depleted orbital lanes cleared by mean-motion gravitational resonance with Jupiter.',
      'Volatile Preservation: Kuiper belt objects (KBOs) retain frozen methane, ammonia, and water ices from the presolar nebula.',
      'Dwarf Planet Classification: Bodies like Ceres and Pluto possessing sufficient hydrostatic equilibrium to become spherical.'
    ],
    visualDescription: 'Swirling rings of jagged carbonaceous and silicate asteroids illuminated by the distant golden Sun.'
  }
];
