/**
 * Chapter 05 — The Moons.
 * Diameters are 2 × the mean radius in JPL Solar System Dynamics' satellite
 * physical-parameter table (fetched 2026-11-20); they are derived, so they are
 * marked approx. Traits and exploration notes come from each moon's NASA page.
 */

export interface MoonEntry {
  id: 'moon' | 'io' | 'europa' | 'ganymede' | 'callisto' | 'titan' | 'enceladus' | 'triton';
  name: string;
  parent: 'Earth' | 'Jupiter' | 'Saturn' | 'Neptune';
  /** JPL SSD mean radius, km. */
  meanRadiusKm: number;
  /** JPL SSD mean density, g/cm³. */
  densityGcm3: number;
  tagline: string;
  traits: string[];
  exploration: string;
  missions: string[];
  /** Short description of the visual effect, flagged artistic where relevant. */
  visualNote: string;
  sources: string[];
}

export const JPL_SATS = 'https://ssd.jpl.nasa.gov/sats/phys_par/';

export const MOONS: MoonEntry[] = [
  {
    id: 'moon',
    name: 'The Moon',
    parent: 'Earth',
    meanRadiusKm: 1737.4,
    densityGcm3: 3.344,
    tagline: 'A record of the solar system’s violent youth.',
    traits: [
      'Dark maria are impact basins later filled with lava.',
      'Average distance from Earth: 384,400 km.',
      'Water ice is concentrated in permanently dark polar craters.',
    ],
    exploration:
      'Apollo astronauts returned 382 kg of lunar rock and soil. Polar ice makes the Moon more hospitable for future human explorers.',
    missions: ['Apollo (NASA)', 'Artemis (NASA)'],
    visualNote: 'Procedural maria, craters and highlands.',
    sources: [JPL_SATS, 'https://science.nasa.gov/moon/facts/', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html'],
  },
  {
    id: 'io',
    name: 'Io',
    parent: 'Jupiter',
    meanRadiusKm: 1821.49,
    densityGcm3: 3.5276,
    tagline: 'The most volcanically active world in the solar system.',
    traits: [
      'Hundreds of volcanoes; some lava fountains reach dozens of km high.',
      'Lakes of molten silicate lava on the surface.',
      'Volcanism resurfaces Io faster than impacts can crater it.',
    ],
    exploration:
      'Voyager 1 spotted the first signs of Io’s volcanism in 1979. Most of what we know comes from Galileo; Juno has made close flybys.',
    missions: ['Voyager 1', 'Galileo', 'Juno (NASA)'],
    visualNote: 'Hotspots and plume particles are artistic.',
    sources: [JPL_SATS, 'https://science.nasa.gov/jupiter/jupiter-moons/io/'],
  },
  {
    id: 'europa',
    name: 'Europa',
    parent: 'Jupiter',
    meanRadiusKm: 1560.8,
    densityGcm3: 3.013,
    tagline: 'An ice shell over a hidden saltwater ocean.',
    traits: [
      'Ice shell thought to be 15–25 km thick over an ocean 60–150 km deep.',
      'Its ocean may hold twice as much water as Earth’s oceans.',
      'Crisscrossing bands and ridges, with very few large craters — a young surface.',
    ],
    exploration:
      'One of the most promising places to look for life beyond Earth. NASA’s Europa Clipper launched 14 Oct 2024 and is due at Jupiter in April 2030 for dozens of flybys.',
    missions: ['Galileo', 'Juno (NASA)', 'Europa Clipper (NASA)', 'Juice (ESA)'],
    visualNote: 'Procedural ice cracks (lineae).',
    sources: [
      JPL_SATS,
      'https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/',
      'https://science.nasa.gov/mission/europa-clipper/',
    ],
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    parent: 'Jupiter',
    meanRadiusKm: 2631.2,
    densityGcm3: 1.9416,
    tagline: 'The largest moon — with its own magnetic field.',
    traits: [
      'The only moon known to generate its own magnetic field, causing auroras.',
      'Strong evidence for an underground saltwater ocean.',
      'Older dark cratered terrain beside younger, grooved bright terrain.',
    ],
    exploration:
      'ESA’s Juice launched 14 April 2023 and arrives at Jupiter in July 2031 to study Ganymede, Callisto and Europa. Juno imaged Ganymede in June 2021.',
    missions: ['Pioneer 10', 'Galileo', 'Juno (NASA)', 'Juice (ESA)'],
    visualNote: 'Procedural dark/bright terrain and grooves.',
    sources: [JPL_SATS, 'https://science.nasa.gov/jupiter/jupiter-moons/ganymede/', 'https://science.nasa.gov/mission/juice/'],
  },
  {
    id: 'callisto',
    name: 'Callisto',
    parent: 'Jupiter',
    meanRadiusKm: 2410.3,
    densityGcm3: 1.834,
    tagline: 'The most heavily cratered object in the solar system.',
    traits: [
      'Ancient surface saturated with impact craters.',
      'Galileo data suggest a salty ocean may lie beneath the surface.',
      'Discovered by Galileo Galilei in 1610.',
    ],
    exploration:
      'The Galileo orbiter made the first in-depth study until 2003. Juice will study Callisto after arriving in 2031.',
    missions: ['Galileo', 'Cassini', 'New Horizons', 'Juice (ESA)'],
    visualNote: 'Procedural crater field.',
    sources: [JPL_SATS, 'https://science.nasa.gov/jupiter/jupiter-moons/callisto/', 'https://science.nasa.gov/mission/juice/'],
  },
  {
    id: 'titan',
    name: 'Titan',
    parent: 'Saturn',
    meanRadiusKm: 2574.76,
    densityGcm3: 1.8814,
    tagline: 'Rivers, lakes and seas of liquid methane under an orange sky.',
    traits: [
      'A thick atmosphere, mostly nitrogen with some methane.',
      'Clouds, rain, rivers, lakes and seas of liquid hydrocarbons.',
      'A subsurface water ocean, likely 55–80 km below the ice.',
    ],
    exploration:
      'Cassini and ESA’s Huygens probe (descended to the surface in 2005) revealed Titan. NASA’s Dragonfly rotorcraft is set to launch no earlier than July 2028 and arrive in late 2034.',
    missions: ['Cassini (NASA)', 'Huygens probe (ESA)', 'Dragonfly (NASA)'],
    visualNote: 'Haze shell approximates Titan’s opaque orange atmosphere.',
    sources: [JPL_SATS, 'https://science.nasa.gov/saturn/moons/titan/facts/', 'https://science.nasa.gov/mission/dragonfly/'],
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    parent: 'Saturn',
    meanRadiusKm: 252.1,
    densityGcm3: 1.6097,
    tagline: 'A small moon spraying its ocean into space.',
    traits: [
      'Jets of water vapour and ice burst out at about 400 m/s.',
      'A global ocean feeds the jets — which in turn supply Saturn’s E ring.',
      'Likely hydrothermal vents; ice may be only 1–5 km thick at the south pole.',
    ],
    exploration:
      'Cassini discovered the plumes in 2005 and flew within about 25 km of the surface. Plume samples show Enceladus has most of the chemical ingredients needed for life.',
    missions: ['Voyager', 'Cassini (NASA)'],
    visualNote: 'South-polar plume particles are artistic.',
    sources: [JPL_SATS, 'https://science.nasa.gov/saturn/moons/enceladus/'],
  },
  {
    id: 'triton',
    name: 'Triton',
    parent: 'Neptune',
    meanRadiusKm: 1352.6,
    densityGcm3: 2.0649,
    tagline: 'A backward-orbiting world of nitrogen frost and geysers.',
    traits: [
      'The only large moon with a retrograde orbit.',
      'Surface around −235 °C; nitrogen frost reflects about 70% of sunlight.',
      'Active geysers; one of the few volcanically active bodies known.',
    ],
    exploration:
      'Voyager 2 is the only spacecraft to have flown past Neptune and Triton, in 1989.',
    missions: ['Voyager 2 (NASA)'],
    visualNote: 'Procedural frost cap and plume streaks.',
    sources: [JPL_SATS, 'https://science.nasa.gov/neptune/moons/triton/'],
  },
];

export const moonDiameterKm = (m: MoonEntry) => m.meanRadiusKm * 2;
export const LARGEST_MOON_DIAMETER = Math.max(...MOONS.map(moonDiameterKm));
