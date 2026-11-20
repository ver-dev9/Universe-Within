export interface PlanetData {
  id: string;
  name: string;
  classification: string;
  tagline: string;
  color: string;
  secondaryColor: string;
  orbitRadius: number; // visual scale in scene units
  orbitPeriodDays: number;
  rotationPeriodHours: number;
  actualDiameterKm: number;
  relativeSize: number; // visual 3D scale
  distanceFromSunMillionKm: number;
  averageTemperatureC: number;
  temperatureRange: string;
  moonsCount: number;
  moonsNote?: string;
  atmosphere: { gas: string; percentage: number }[];
  keyDiscoveries: string[];
  visualHighlights: string;
  explorationMissions: string[];
  scientificSummary: string;
  /** Obliquity to orbit in degrees (NASA fact sheet). Values > 90 mean retrograde spin. */
  axialTiltDeg: number;
  /** One-line context for the temperature figures (what the mean actually measures). */
  temperatureContext: string;
  /** Where the numeric fields were checked, with the date of the check. */
  source: DataSource;
}

export interface DataSource {
  name: string;
  url: string;
  /** Fields verified against this source. */
  fields: string[];
  checked: string;
  note?: string;
}

const NSSDC_SUMMARY = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
const nssdc = (planet: string, extraNote?: string): DataSource => ({
  name: 'NASA NSSDCA Planetary Fact Sheet (D. R. Williams, GSFC)',
  url: `https://nssdc.gsfc.nasa.gov/planetary/factsheet/${planet}fact.html`,
  fields: [
    'actualDiameterKm (equatorial)',
    'distanceFromSunMillionKm (semimajor axis)',
    'orbitPeriodDays (sidereal)',
    'rotationPeriodHours (sidereal)',
    'averageTemperatureC (mean)',
    'moonsCount',
    'axialTiltDeg (obliquity to orbit)',
  ],
  checked: '2026-11-20 against ' + NSSDC_SUMMARY,
  note: extraNote,
});

/** Earth's equatorial diameter (NASA fact sheet) — used for "× Earth" ratios. */
export const EARTH_DIAMETER_KM = 12756;
/** 1 astronomical unit in million km (IAU 2012: 149,597,870.7 km). */
export const AU_MILLION_KM = 149.5978707;

export const PLANETS_DATA: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    classification: 'Terrestrial Planet',
    tagline: 'The Scorched Messenger',
    color: '#A0A0A0',
    secondaryColor: '#6B6865',
    orbitRadius: 18,
    orbitPeriodDays: 87.969,
    rotationPeriodHours: 1407.6, // 58.6 Earth days (sidereal); a solar day lasts 176 Earth days
    actualDiameterKm: 4879,
    relativeSize: 0.9,
    distanceFromSunMillionKm: 57.9,
    averageTemperatureC: 167,
    temperatureRange: '-180°C (night) to 430°C (day)',
    moonsCount: 0,
    atmosphere: [
      { gas: 'Oxygen', percentage: 42.0 },
      { gas: 'Sodium', percentage: 29.0 },
      { gas: 'Hydrogen', percentage: 22.0 },
      { gas: 'Helium', percentage: 6.0 },
      { gas: 'Potassium', percentage: 0.5 }
    ],
    keyDiscoveries: [
      'Discovery of water ice in permanently shadowed polar craters by NASA MESSENGER (2012).',
      'High core-to-mantle ratio: iron core constitutes ~85% of planetary radius.',
      'Global contraction cliffs (lobate scarps) indicating the planet shrank by ~7 km as it cooled.'
    ],
    visualHighlights: 'Heavily cratered basaltic crust, Caloris impact basin, extreme shadow contrasts, no substantial atmospheric haze.',
    explorationMissions: ['Mariner 10 (1974-1975)', 'MESSENGER (2011-2015)', 'BepiColombo (ESA/JAXA, en route 2026)'],
    scientificSummary: 'Mercury is the smallest planet in the Solar System and closest to the Sun. Due to its minimal exosphere, it experiences the most dramatic diurnal temperature variations of any Solar System planet.',
    axialTiltDeg: 0.034,
    temperatureContext: 'Mean of a world with no air to hold heat: the dayside bakes while the nightside plunges, the widest swing of any planet.',
    source: nssdc('mercury'),
  },
  {
    id: 'venus',
    name: 'Venus',
    classification: 'Terrestrial Planet',
    tagline: 'The Runaway Greenhouse',
    color: '#E3BB76',
    secondaryColor: '#C49746',
    orbitRadius: 26,
    orbitPeriodDays: 224.7,
    rotationPeriodHours: -5832.5, // Retrograde rotation 243 Earth days
    actualDiameterKm: 12104,
    relativeSize: 1.4,
    distanceFromSunMillionKm: 108.2,
    averageTemperatureC: 464,
    temperatureRange: '464°C isothermal across surface',
    moonsCount: 0,
    atmosphere: [
      { gas: 'Carbon Dioxide', percentage: 96.5 },
      { gas: 'Nitrogen', percentage: 3.5 },
      { gas: 'Sulfur Dioxide', percentage: 0.015 },
      { gas: 'Water Vapor', percentage: 0.002 }
    ],
    keyDiscoveries: [
      'Super-rotating atmosphere: upper sulfuric cloud decks orbit planet in only 4 Earth days.',
      'Surface atmospheric pressure of 92 bar (~equivalent to 900m underwater on Earth).',
      'Ongoing active volcanism indicated by recent radar analysis from Magellan and Venus Express data.'
    ],
    visualHighlights: 'Dense opaque sulfuric acid cloud blankets, yellowish-amber convective bands, extreme greenhouse glow.',
    explorationMissions: ['Venera series (USSR, 1961-1984)', 'Magellan (NASA, 1990-1994)', 'Akatsuki (JAXA, 2015-present)', 'DAVINCI & VERITAS (Upcoming)'],
    scientificSummary: 'Often termed Earth\'s "evil twin", Venus possesses similar size, mass, and bulk composition, but diverged catastrophically into a runaway greenhouse state with scorching surface conditions and clouds of sulfuric acid.',
    axialTiltDeg: 177.4,
    temperatureContext: 'Hottest planet despite being second from the Sun — its CO₂ atmosphere traps heat so the surface is the same temperature day and night.',
    source: nssdc('venus'),
  },
  {
    id: 'earth',
    name: 'Earth',
    classification: 'Terrestrial Planet / Habitable World',
    tagline: 'The Pale Blue Dot',
    color: '#2B82C9',
    secondaryColor: '#4CA64C',
    orbitRadius: 36,
    orbitPeriodDays: 365.256,
    rotationPeriodHours: 23.9345,
    actualDiameterKm: 12756,
    relativeSize: 1.5,
    distanceFromSunMillionKm: 149.6,
    averageTemperatureC: 15,
    temperatureRange: '-89.2°C (Antarctica) to 56.7°C (Death Valley)',
    moonsCount: 1,
    moonsNote: 'The Moon (Luna) — diameter 3,474 km',
    atmosphere: [
      { gas: 'Nitrogen', percentage: 78.08 },
      { gas: 'Oxygen', percentage: 20.95 },
      { gas: 'Argon', percentage: 0.93 },
      { gas: 'Carbon Dioxide', percentage: 0.042 }
    ],
    keyDiscoveries: [
      'Only confirmed celestial body harboring life and vast liquid surface oceans (71% coverage).',
      'Dynamic plate tectonics recycling carbon and sustaining a stable climate balance for billions of years.',
      'Strong geomagnetic dynamo driven by convective liquid iron outer core shielding the biosphere from solar wind.'
    ],
    visualHighlights: 'Vibrant azure oceans, swirling white cyclonic cloud vortices, green/brown continental landmasses, glowing electric-cyan Rayleigh atmosphere, nocturnal bioluminescent city lights.',
    explorationMissions: ['Landsat Program', 'Terra & Aqua (NASA)', 'Copernicus Sentinel (ESA)', 'ISS (International Space Station)'],
    scientificSummary: 'Our home world represents an oasis in the cosmic wilderness, maintained in delicate equilibrium through atmospheric, oceanic, and biological feedback systems.',
    axialTiltDeg: 23.4,
    temperatureContext: 'Global mean surface temperature; liquid water is stable across most of the surface.',
    source: nssdc('earth'),
  },
  {
    id: 'mars',
    name: 'Mars',
    classification: 'Terrestrial Planet',
    tagline: 'The Rust-Stained Frontier',
    color: '#D15838',
    secondaryColor: '#8C341F',
    orbitRadius: 46,
    orbitPeriodDays: 686.98,
    rotationPeriodHours: 24.6229,
    actualDiameterKm: 6792,
    relativeSize: 1.1,
    distanceFromSunMillionKm: 228.0,
    averageTemperatureC: -65,
    temperatureRange: '-125°C to 20°C',
    moonsCount: 2,
    moonsNote: 'Phobos and Deimos (captured carbonaceous asteroids)',
    atmosphere: [
      { gas: 'Carbon Dioxide', percentage: 95.32 },
      { gas: 'Nitrogen', percentage: 2.6 },
      { gas: 'Argon', percentage: 1.9 },
      { gas: 'Oxygen', percentage: 0.13 }
    ],
    keyDiscoveries: [
      'Ancient lacustrine and river delta geological strata confirming standing liquid water in the Noachian era.',
      'Perseverance rover extracted core samples documenting organic molecules in Jezero crater.',
      'Home to Olympus Mons (21.9 km high shield volcano) and Valles Marineris canyon system (4,000 km long).'
    ],
    visualHighlights: 'Iron oxide (ferric dust) reddish mantle, polar dry ice / water ice caps, gigantic volcanic shield calderas, dusty ochre sky gradient.',
    explorationMissions: ['Viking 1 & 2 (1976)', 'Curiosity Rover (2012-present)', 'Perseverance & Ingenuity (2021-present)', 'Mars Express (ESA)'],
    scientificSummary: 'Mars is a cold, desert world with a thin atmosphere. Past magnetic field collapse ~4 billion years ago stripped its dense atmosphere, leaving a fossilized hydrological record now scrutinized for ancient biosignatures.',
    axialTiltDeg: 25.2,
    temperatureContext: 'Mean surface temperature; the thin CO₂ air holds little heat, so days and nights swing widely.',
    source: nssdc('mars'),
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    classification: 'Gas Giant',
    tagline: 'The Monarch of the Solar System',
    color: '#D8A070',
    secondaryColor: '#A3683C',
    orbitRadius: 60,
    orbitPeriodDays: 4332.589, // 11.86 Earth years (sidereal)
    rotationPeriodHours: 9.925,
    actualDiameterKm: 142984,
    relativeSize: 3.2,
    distanceFromSunMillionKm: 778.5,
    averageTemperatureC: -110,
    temperatureRange: '-145°C (cloud tops) to ~24,000°C (metallic core)',
    moonsCount: 95,
    moonsNote: '95 recognized moons (4 Galilean moons: Io, Europa, Ganymede, Callisto)',
    atmosphere: [
      { gas: 'Hydrogen', percentage: 89.8 },
      { gas: 'Helium', percentage: 10.2 },
      { gas: 'Methane', percentage: 0.3 },
      { gas: 'Ammonia', percentage: 0.026 }
    ],
    keyDiscoveries: [
      'Great Red Spot: an anticyclonic storm larger than Earth persisting for over 350 recorded years.',
      'Juno spacecraft revealed deep zonal jet streams extending 3,000 km into the atmosphere.',
      'Europa harbors a subsurface saltwater ocean beneath an icy crust containing twice the volume of Earth\'s oceans.'
    ],
    visualHighlights: 'Alternating counter-rotating light zones and dark belts, Great Red Spot vortex, complex turbulent cyclonic eddies, faint dust ring.',
    explorationMissions: ['Voyager 1 & 2 (1979)', 'Galileo (1995-2003)', 'Juno (2016-present)', 'JUICE (ESA, en route 2031)'],
    scientificSummary: 'Jupiter contains over twice the combined mass of all other planets in the Solar System combined. Acting as a gravitational shepherd, it shields inner rocky planets from cometary bombardments.',
    axialTiltDeg: 3.1,
    temperatureContext: 'Measured where the pressure is 1 bar in the atmosphere — there is no solid surface.',
    source: nssdc('jupiter', 'Mean temperature is at the 1-bar level.'),
  },
  {
    id: 'saturn',
    name: 'Saturn',
    classification: 'Gas Giant',
    tagline: 'The Crown Jewel of the Heavens',
    color: '#E4CD9E',
    secondaryColor: '#B69661',
    orbitRadius: 76,
    orbitPeriodDays: 10755.7, // 29.45 Earth years
    rotationPeriodHours: 10.656,
    actualDiameterKm: 120536,
    relativeSize: 2.8,
    distanceFromSunMillionKm: 1432.0,
    averageTemperatureC: -140,
    temperatureRange: '-178°C (upper clouds)',
    moonsCount: 274,
    moonsNote: '274 moons on the NASA fact sheet — most are small irregular moons announced since 2023 (Titan has a dense nitrogen atmosphere and liquid methane lakes)',
    atmosphere: [
      { gas: 'Hydrogen', percentage: 96.3 },
      { gas: 'Helium', percentage: 3.25 },
      { gas: 'Methane', percentage: 0.45 },
      { gas: 'Ammonia', percentage: 0.012 }
    ],
    keyDiscoveries: [
      'Cassini spacecraft discovered water ice plumes erupting from the south polar ocean of Enceladus.',
      'Spectacular planetary ring system spans up to 282,000 km wide yet averages only 10 to 30 meters thick.',
      'Persistent hexagonal wave pattern surrounding the north pole rotating synchronously with the planet\'s radio emissions.'
    ],
    visualHighlights: 'Extensive multi-tiered ring system composed of pure water ice chunks, muted golden atmospheric latitude banding, north polar hexagon.',
    explorationMissions: ['Pioneer 11 (1979)', 'Voyager 1 & 2 (1980-1981)', 'Cassini-Huygens (NASA/ESA, 2004-2017)'],
    scientificSummary: 'Saturn is the least dense planet in the Solar System (0.687 g/cm³—less dense than water). Its majestic ring system is young (~10-100 million years old) and actively eroding via "ring rain".',
    axialTiltDeg: 26.7,
    temperatureContext: 'Measured at the 1-bar level in the atmosphere — there is no solid surface.',
    source: nssdc('saturn', 'Mean temperature is at the 1-bar level. Moon count follows the fact sheet (274).'),
  },
  {
    id: 'uranus',
    name: 'Uranus',
    classification: 'Ice Giant',
    tagline: 'The Sideways Wanderer',
    color: '#70D7D7',
    secondaryColor: '#459E9E',
    orbitRadius: 90,
    orbitPeriodDays: 30685.4, // 84.0 Earth years
    rotationPeriodHours: -17.24, // Retrograde
    actualDiameterKm: 51118,
    relativeSize: 2.0,
    distanceFromSunMillionKm: 2867.0,
    averageTemperatureC: -195,
    temperatureRange: '-224°C (lowest recorded temperature of any Solar System planet)',
    moonsCount: 28,
    moonsNote: '28 known moons (named after Shakespearean characters: Titania, Oberon, Miranda)',
    atmosphere: [
      { gas: 'Hydrogen', percentage: 82.5 },
      { gas: 'Helium', percentage: 15.2 },
      { gas: 'Methane', percentage: 2.3 },
      { gas: 'Hydrogen Deuteride', percentage: 0.009 }
    ],
    keyDiscoveries: [
      'Extreme 97.8° axial tilt: effectively rolls on its side along its orbital plane, likely due to a primordial giant impact.',
      'Lowest intrinsic internal heat radiance of any giant planet; radiates almost no excess heat into space.',
      'Complex tilted and offset magnetic dipole: magnetic axis is inclined 59° to rotational axis and off-center by a third of planetary radius.'
    ],
    visualHighlights: 'Featureless cyan-aquamarine appearance caused by methane absorption of red light wavelengths, 13 faint charcoal-dark vertical rings.',
    explorationMissions: ['Voyager 2 flyby (January 1986)', 'Hubble & JWST ongoing spectrographic observations'],
    scientificSummary: 'Uranus is the third largest planet by diameter. Classified as an Ice Giant, its mantle consists of a dense supercritical fluid slurry of water, ammonia, and methane ices over a small rocky core.',
    axialTiltDeg: 97.8,
    temperatureContext: 'Measured at the 1-bar level; Uranus radiates almost no internal heat, making it the coldest planetary atmosphere measured.',
    source: nssdc('uranus', 'Mean temperature is at the 1-bar level.'),
  },
  {
    id: 'neptune',
    name: 'Neptune',
    classification: 'Ice Giant',
    tagline: 'The Supersonic Storm',
    color: '#3F6CE0',
    secondaryColor: '#22409A',
    orbitRadius: 104,
    orbitPeriodDays: 60189.0, // 164.8 Earth years
    rotationPeriodHours: 16.11,
    actualDiameterKm: 49528,
    relativeSize: 1.9,
    distanceFromSunMillionKm: 4515.0,
    averageTemperatureC: -200,
    temperatureRange: '-218°C',
    moonsCount: 16,
    moonsNote: '16 known moons (Triton features retrograde orbit and active nitrogen cryogeysers)',
    atmosphere: [
      { gas: 'Hydrogen', percentage: 80.0 },
      { gas: 'Helium', percentage: 19.0 },
      { gas: 'Methane', percentage: 1.5 },
      { gas: 'Hydrogen Deuteride', percentage: 0.019 }
    ],
    keyDiscoveries: [
      'Fastest planetary wind speeds ever measured in the Solar System, exceeding 2,100 km/h (supersonic).',
      'First planet mathematically predicted by Urbain Le Verrier before observational telescopic discovery in 1846 by Johann Galle.',
      'Active Great Dark Spot anticyclonic storm systems that form, evolve, and dissipate across decades.'
    ],
    visualHighlights: 'Deep cobalt-sapphire blue hue with vivid white high-altitude cirrus clouds composed of methane ice crystals, dynamic storm ovals.',
    explorationMissions: ['Voyager 2 flyby (August 1989)', 'Keck Observatory & James Webb Space Telescope NIRCam imaging'],
    scientificSummary: 'Neptune is the most distant major planet from the Sun. Radiating 2.6 times more internal heat than it receives from solar radiation, its internal heat engine drives supersonic meteorological phenomena.',
    axialTiltDeg: 28.3,
    temperatureContext: 'Measured at the 1-bar level; though farther out than Uranus, Neptune\'s internal heat keeps it about as warm.',
    source: nssdc('neptune', 'Mean temperature is at the 1-bar level.'),
  }
];

export const SUN_DATA = {
  name: 'The Sun (Sol)',
  classification: 'G-type Main-Sequence Star (Yellow Dwarf)',
  tagline: 'Heart of the Solar System',
  actualDiameterKm: 1391400, // 2 × volumetric mean radius 695,700 km (NASA Sun fact sheet)
  massKg: '1.989 × 10³⁰ kg (99.86% of Solar System mass)',
  coreTemperatureC: 15700000, // central temperature 1.571 × 10⁷ K
  photosphereTemperatureC: 5500, // effective temperature 5,772 K
  ageBillionYears: 4.6,
  spectralClass: 'G2V',
  composition: [
    { element: 'Hydrogen', percentage: 73.46 },
    { element: 'Helium', percentage: 24.85 },
    { element: 'Oxygen', percentage: 0.77 },
    { element: 'Carbon', percentage: 0.29 },
    { element: 'Iron', percentage: 0.16 }
  ],
  source: {
    name: 'NASA NSSDCA Sun Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html',
    fields: ['actualDiameterKm', 'coreTemperatureC', 'photosphereTemperatureC', 'luminosity', 'mass'],
    checked: '2026-11-20',
  } as DataSource,
  scientificSummary: 'The Sun fuels our Solar System via proton-proton chain nuclear fusion in its core, converting 600 million tons of hydrogen into helium every second, converting mass into 3.828 × 10²⁶ watts of radiant energy.'
};
