/**
 * Chapter 04 — Worlds Beyond Earth.
 * Numbers come from the NSSDC Planetary Fact Sheet and NASA object / mission pages
 * fetched on 2026-11-20. Each object lists every URL used. `approx: true` marks
 * values the source gives as "about", or values derived here (e.g. radius × 2).
 */

export interface WorldStat {
  label: string;
  value: string;
  approx?: boolean;
}

export type WorldKind = 'planet' | 'dwarf-planet' | 'asteroid' | 'comet';

export interface WorldEntry {
  id: 'mercury' | 'venus' | 'mars' | 'ceres' | 'pluto' | 'asteroid' | 'comet';
  name: string;
  kind: WorldKind;
  kindLabel: string;
  tagline: string;
  stats: WorldStat[];
  surface: string;
  atmosphere: string;
  geology: string;
  missions: string[];
  discoveries: string[];
  /** true when the object shown is a generic, illustrative member of its class. */
  illustrative?: boolean;
  sources: string[];
}

const NSSDC = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/';

export const WORLDS: WorldEntry[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    kind: 'planet',
    kindLabel: 'Innermost planet',
    tagline: 'A scorched, cratered world with ice hiding in its shadows.',
    stats: [
      { label: 'Diameter', value: '4,879 km' },
      { label: 'Surface gravity', value: '3.7 m/s²' },
      { label: 'Day (solar)', value: '4,222.6 h' },
      { label: 'Temperature range', value: '430 °C to −180 °C', approx: true },
    ],
    surface:
      'Heavily cratered rock. Day-side temperatures reach about 430 °C, yet with no atmosphere to hold heat the night side drops to about −180 °C.',
    atmosphere: 'Effectively none — surface pressure is listed as 0 bar.',
    geology:
      'A huge metallic core with a radius of about 2,074 km — roughly 85% of the planet’s radius — and a global magnetic field.',
    missions: [
      'MESSENGER (NASA) — first spacecraft to orbit Mercury; launched 2004, mission ended April 2015',
      'BepiColombo (ESA/JAXA) — two orbiters; Mercury orbital insertion scheduled for November 2026',
    ],
    discoveries: [
      'MESSENGER verified that Mercury’s polar deposits are dominantly water ice, preserved in permanently shadowed craters.',
      'Despite being closest to the Sun, Mercury is not the hottest planet — Venus is.',
    ],
    sources: [
      NSSDC,
      'https://science.nasa.gov/mercury/facts/',
      'https://science.nasa.gov/mission/messenger/',
      'https://science.nasa.gov/mission/bepicolombo/',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    kind: 'planet',
    kindLabel: 'Earth’s “twin”',
    tagline: 'A runaway greenhouse under clouds of sulfuric acid.',
    stats: [
      { label: 'Diameter', value: '12,104 km' },
      { label: 'Mean temperature', value: '464 °C' },
      { label: 'Surface pressure', value: '92 bar' },
      { label: 'Rotation', value: '−5,832.5 h (retrograde)' },
    ],
    surface:
      'Hot enough to melt lead. Radar shows volcanoes, deformed mountains and a relatively young, recently reshaped surface.',
    atmosphere:
      'Mostly carbon dioxide with dense clouds of sulfuric acid, trapping heat in a runaway greenhouse effect.',
    geology:
      'Venus spins backward compared with Earth, so the Sun would rise in the west. Its axial tilt is only about three degrees, too little for noticeable seasons.',
    missions: [
      'Magellan (NASA) — radar-mapped the surface; five-year mission ended 1994',
      'Venus Express (ESA) — launched 9 Nov 2005; first European spacecraft to orbit Venus',
      'VERITAS and DAVINCI (NASA) — planned missions',
      'EnVision (ESA) — orbiter set to launch in the 2030s',
    ],
    discoveries: [
      'Magellan revealed a land of extreme volcanism and chains of towering mountains.',
      'About 50 km up, temperatures fall to roughly 30–70 °C — the region astrobiologists discuss when asking about life in Venus’ clouds.',
    ],
    sources: [NSSDC, 'https://science.nasa.gov/venus/facts/', 'https://science.nasa.gov/venus/exploration/'],
  },
  {
    id: 'mars',
    name: 'Mars',
    kind: 'planet',
    kindLabel: 'The Red Planet',
    tagline: 'A cold desert that was once wetter and warmer.',
    stats: [
      { label: 'Diameter', value: '6,792 km' },
      { label: 'Surface gravity', value: '3.7 m/s²' },
      { label: 'Day (solar)', value: '24.7 h' },
      { label: 'Mean temperature', value: '−65 °C' },
    ],
    surface:
      'Dusty and cold, with polar ice caps, extinct volcanoes and canyons. Iron-rich dust kicked into the air makes the planet look red.',
    atmosphere: 'Very thin — about 0.01 bar at the surface and about 95% carbon dioxide by volume.',
    geology:
      'Olympus Mons, the largest volcano in the solar system, stands more than 40 km tall. Valles Marineris runs about 3,870 km long — the largest canyon in the solar system.',
    missions: [
      'Perseverance (NASA) — landed in Jezero Crater on 18 Feb 2021; collecting rock cores for possible return to Earth',
      'Curiosity, Mars Reconnaissance Orbiter, Mars Odyssey (NASA) — long-running missions',
    ],
    discoveries: [
      'NASA missions found abundant evidence that Mars was wetter and warmer, with a thicker atmosphere, billions of years ago.',
      'Water exists today as ice just under the surface near the poles.',
    ],
    sources: [
      NSSDC,
      'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
      'https://science.nasa.gov/mars/facts/',
      'https://science.nasa.gov/mission/mars-2020-perseverance/',
    ],
  },
  {
    id: 'ceres',
    name: 'Ceres',
    kind: 'dwarf-planet',
    kindLabel: 'Dwarf planet · asteroid belt',
    tagline: 'The largest object in the asteroid belt.',
    stats: [
      { label: 'Diameter', value: '~952 km', approx: true },
      { label: 'Mean distance from Sun', value: '~413 million km', approx: true },
      { label: 'Largest crater', value: '< 280 km' },
      { label: 'Discovered', value: '1801 (Piazzi)' },
    ],
    surface:
      'Covered in countless small, young craters — none larger than about 280 km. The crust is rocky and dusty with large salt deposits.',
    atmosphere: 'A very thin atmosphere, with evidence of water vapour — possibly from ice volcanoes or sublimating near-surface ice.',
    geology:
      'Probably a solid core with a mantle of water ice. Ice or salt just below the surface, or past hydrothermal activity such as ice volcanoes, may have erased large craters.',
    missions: ['Dawn (NASA) — launched 2007; entered orbit around Ceres on 6 March 2015 after studying Vesta'],
    discoveries: [
      'Ceres became the first dwarf planet ever visited — and orbited — by a spacecraft.',
      'Its salts are not table salt but minerals such as magnesium sulfate.',
    ],
    sources: [
      'https://science.nasa.gov/dwarf-planets/ceres/facts/',
      'https://science.nasa.gov/dwarf-planets/ceres/exploration/',
      'https://science.nasa.gov/mission/dawn/',
    ],
  },
  {
    id: 'pluto',
    name: 'Pluto',
    kind: 'dwarf-planet',
    kindLabel: 'Dwarf planet · Kuiper Belt',
    tagline: 'A frozen world with a heart of nitrogen ice.',
    stats: [
      { label: 'Diameter', value: '2,376 km' },
      { label: 'Mean temperature', value: '−225 °C' },
      { label: 'Day', value: '153.3 h' },
      { label: 'Known moons', value: '5' },
    ],
    surface:
      'Mountains, valleys, plains, craters and glaciers. The tallest mountains — 2 to 3 km high — are blocks of water ice, and methane and nitrogen frost coat the surface.',
    atmosphere: 'Thin, mostly nitrogen, methane and carbon monoxide (surface pressure ~0.00001 bar).',
    geology:
      'Probably a rocky core under a water-ice mantle. The bright “heart” includes the vast nitrogen-ice plain informally named Sputnik Planum.',
    missions: ['New Horizons (NASA) — the only spacecraft to explore Pluto up close; flyby 14 July 2015, then Arrokoth in 2019'],
    discoveries: [
      'Reclassified as a dwarf planet by the IAU in 2006.',
      'Charon is about half Pluto’s size — the largest satellite relative to its host in the solar system.',
    ],
    sources: [
      NSSDC,
      'https://science.nasa.gov/dwarf-planets/pluto/facts/',
      'https://science.nasa.gov/mission/new-horizons/',
    ],
  },
  {
    id: 'asteroid',
    name: 'Asteroids',
    kind: 'asteroid',
    kindLabel: 'Main belt · illustrative body',
    tagline: 'Rocky leftovers orbiting between Mars and Jupiter.',
    illustrative: true,
    stats: [
      { label: 'Largest asteroid', value: 'Vesta, ~530 km', approx: true },
      { label: 'Smallest catalogued', value: '< 10 m', approx: true },
      { label: 'Where', value: 'Mostly between Mars & Jupiter' },
      { label: 'Bennu sample returned', value: '24 Sept 2023' },
    ],
    surface:
      'Irregular, cratered rock and rubble. The asteroid shown is procedurally generated, not a model of a specific body.',
    atmosphere: 'None.',
    geology:
      'Most known asteroids orbit within the main belt on not-very-elongated orbits; near-Earth asteroids approach within about 45 million km of Earth’s orbit.',
    missions: [
      'OSIRIS-REx (NASA) — sampled asteroid Bennu on 20 Oct 2020 and delivered the sample to Earth on 24 Sept 2023',
      'Dawn (NASA) — orbited giant asteroid Vesta before Ceres',
    ],
    discoveries: [
      'Scientists hope the Bennu sample will show whether asteroids delivered water and other ingredients for life to the early Earth.',
      'NASA’s Planetary Defense Coordination Office tracks objects that could pose an impact hazard.',
    ],
    sources: [
      'https://science.nasa.gov/solar-system/asteroids/facts/',
      'https://science.nasa.gov/mission/osiris-rex/',
      'https://science.nasa.gov/mission/dawn/',
    ],
  },
  {
    id: 'comet',
    name: 'Comets',
    kind: 'comet',
    kindLabel: 'Icy wanderer · illustrative body',
    tagline: 'Dirty snowballs that grow tails near the Sun.',
    illustrative: true,
    stats: [
      { label: 'Nucleus', value: 'often a few miles across', approx: true },
      { label: 'Coma', value: 'can span hundreds of thousands of km', approx: true },
      { label: 'Tails', value: '2 — dust and ion (gas)' },
      { label: 'Age', value: '~4.6 billion years', approx: true },
    ],
    surface:
      'A nucleus of icy chunks and frozen gases with embedded dust, coated in dark organic material.',
    atmosphere:
      'Near the Sun, ices turn to gas and form a coma. Sunlight pressure and the solar wind push dust and gas away from the Sun into two tails.',
    geology:
      'Comets are leftovers from the dawn of the solar system. Jupiter-family comets like 67P are thought to have fallen inward from the Kuiper Belt.',
    missions: [
      'Rosetta & Philae (ESA, with NASA instruments) — rendezvoused with comet 67P in August 2014; first comet orbited and landed on',
      'Deep Impact (NASA) — its impactor struck comet Tempel 1 on 4 July 2005',
    ],
    discoveries: [
      'Comets actually have two tails, a dust tail and an ion (gas) tail, both blown away from the Sun. Their shapes here are artistic.',
    ],
    sources: [
      'https://science.nasa.gov/solar-system/comets/facts/',
      'https://science.nasa.gov/solar-system/comets/67p-churyumov-gerasimenko/',
    ],
  },
];
