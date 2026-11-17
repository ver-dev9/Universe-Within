export interface ScaleTier {
  id: string;
  name: string;
  exponentMeters: number; // 10^x meters
  formattedScale: string;
  metricComparison: string;
  lightTravelTime: string;
  description: string;
  visualIconName: string;
  facts: string[];
}

export const SCALE_TIERS: ScaleTier[] = [
  {
    id: 'human',
    name: 'Human Scale',
    exponentMeters: 0,
    formattedScale: '1.7 Meters (10⁰ m)',
    metricComparison: '1.7 meters tall',
    lightTravelTime: '5.6 nanoseconds',
    description: 'The baseline human observer standing on the surface of the Earth. All astronomical instruments, telescopes, equations, and reflections originate from this scale.',
    visualIconName: 'User',
    facts: [
      'Human height: ~1.7 meters',
      'Average stride length: 0.75 meters',
      'Average human eye resolution: ~1 arcminute (~0.02°)'
    ]
  },
  {
    id: 'earth',
    name: 'Planet Earth',
    exponentMeters: 7.1,
    formattedScale: '1.27 × 10⁷ Meters (12,742 km)',
    metricComparison: '7,500,000 times human height',
    lightTravelTime: '42.5 milliseconds (equatorial circumference)',
    description: 'The diameter of Earth. A rocky sphere insulated by an atmosphere with a surface area of 510 million square kilometers.',
    visualIconName: 'Globe',
    facts: [
      'Equatorial diameter: 12,756 km',
      'Mass: 5.972 × 10²⁴ kg',
      'Circumference: 40,075 km'
    ]
  },
  {
    id: 'moon-distance',
    name: 'Earth to Moon Orbit',
    exponentMeters: 8.58,
    formattedScale: '3.84 × 10⁸ Meters (384,400 km)',
    metricComparison: '30 Earth diameters placed side by side',
    lightTravelTime: '1.28 seconds',
    description: 'The average semi-major axis of the Moon\'s orbit. Every human astronaut who has traveled to another celestial body crossed this expanse during the Apollo program.',
    visualIconName: 'Disc',
    facts: [
      'Average distance: 384,400 km',
      'All other Solar System planets can fit between Earth and Moon with room to spare (~380,000 km required)',
      'Apollo spacecraft flight duration: ~3 days'
    ]
  },
  {
    id: 'sun-earth-au',
    name: '1 Astronomical Unit (Sun-Earth)',
    exponentMeters: 11.17,
    formattedScale: '1.496 × 10¹¹ Meters (149.6 Million km)',
    metricComparison: '11,700 Earth diameters',
    lightTravelTime: '8 minutes 20 seconds (499 seconds)',
    description: 'The fundamental yardstick of the inner Solar System. 1 AU is defined as exactly 149,597,870,700 meters, representing the mean distance from Earth to the Sun.',
    visualIconName: 'Sun',
    facts: [
      '1 AU = 149,597,870.7 km',
      'The Sun appears as a 0.53° angular disk in Earth sky',
      'A commercial airliner traveling at 900 km/h would take 19 years continuous flight to reach the Sun'
    ]
  },
  {
    id: 'solar-system-heliosphere',
    name: 'Outer Solar System (Kuiper Belt)',
    exponentMeters: 12.8,
    formattedScale: '7.5 × 10¹² Meters (50 AU)',
    metricComparison: '50 times the Earth-Sun distance',
    lightTravelTime: '4.16 hours',
    description: 'The vast region extending past Neptune and the Kuiper Belt (Pluto at ~39 AU). The solar wind creates the heliosphere bubble shielding us from galactic cosmic rays until ~120 AU.',
    visualIconName: 'Orbit',
    facts: [
      'Voyager 1 crossed heliopause at 121 AU (~18 billion km)',
      'Radio communication latency: ~16 to 22 hours each way at current Voyager position',
      'Oort Cloud outer perimeter extends to ~100,000 AU (~1.5 light-years)'
    ]
  },
  {
    id: 'nearest-stars',
    name: 'Interstellar Distance (Proxima Centauri)',
    exponentMeters: 16.6,
    formattedScale: '4.01 × 10¹⁶ Meters (4.246 Light-Years)',
    metricComparison: '268,770 AU',
    lightTravelTime: '4.246 years',
    description: 'The void separating our Sun from the nearest stellar system, Alpha Centauri, whose closest member is the red dwarf Proxima Centauri with its temperate exoplanet Proxima b.',
    visualIconName: 'Sparkles',
    facts: [
      'Distance: 4.246 light-years (40.14 trillion kilometers)',
      'At current Voyager 1 escape velocity (~61,000 km/h), traveling this distance would take ~73,000 years',
      '1 light-year = 9.461 × 10¹² km'
    ]
  },
  {
    id: 'milky-way',
    name: 'The Milky Way Galaxy',
    exponentMeters: 20.98,
    formattedScale: '9.46 × 10²⁰ Meters (100,000 Light-Years)',
    metricComparison: '23,500 times distance to Proxima Centauri',
    lightTravelTime: '100,000 years',
    description: 'Our galactic island: a barred spiral galaxy with a central supermassive black hole (Sagittarius A*, 4.15 million solar masses) holding between 100 to 400 billion stars.',
    visualIconName: 'Compass',
    facts: [
      'Stellar diameter: ~100,000 to 120,000 light-years',
      'Solar system distance from galactic core: ~26,600 light-years',
      'Galactic year: The Sun takes ~230 million years to complete one orbit around galactic center'
    ]
  },
  {
    id: 'local-group',
    name: 'The Local Group of Galaxies',
    exponentMeters: 22.98,
    formattedScale: '9.46 × 10²² Meters (10 Million Light-Years)',
    metricComparison: '100 Milky Way diameters',
    lightTravelTime: '10 Million years',
    description: 'The gravitationally bound cluster containing the Milky Way, Andromeda (M31, 2.5 million light-years distant), Triangulum (M33), and over 80 satellite dwarf galaxies.',
    visualIconName: 'Share2',
    facts: [
      'Andromeda and Milky Way are colliding at ~110 km/s and will merge into "Milkomeda" in ~4.5 billion years',
      'Dominant mass component: Dark matter halo binding the galaxies together',
      'Gravitational attraction overcomes cosmological metric expansion within the group'
    ]
  },
  {
    id: 'observable-universe',
    name: 'The Observable Universe',
    exponentMeters: 26.94,
    formattedScale: '8.8 × 10²⁶ Meters (93 Billion Light-Years)',
    metricComparison: '930,000 Milky Way diameters',
    lightTravelTime: '46.5 Billion years (co-moving radius)',
    description: 'The totality of physical spacetime whose light has had time to reach Earth since the Big Bang 13.8 billion years ago. Containing over 2 trillion galaxies and 10²⁴ stars.',
    visualIconName: 'Eye',
    facts: [
      'Co-moving diameter: ~93 billion light-years (28.5 gigaparsecs)',
      'Estimated total atoms: ~10⁸⁰ hydrogen atoms',
      'Cosmological horizon expanding: Spacetime expansion beyond the horizon recedes faster than light (superluminal cosmic recession)'
    ]
  }
];
