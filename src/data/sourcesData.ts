export interface ScientificSource {
  id: string;
  name: string;
  organization: string;
  url: string;
  purpose: string;
  verifiedFields: string[];
}

export const SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    id: 'nasa-planetary',
    name: 'NASA Solar System Exploration',
    organization: 'National Aeronautics and Space Administration (NASA)',
    url: 'https://science.nasa.gov/solar-system',
    purpose: 'Authoritative physical parameters, planetary atmospheric profiles, orbital characteristics, and mission telemetry data.',
    verifiedFields: ['Planetary Diameters & Mass', 'Orbital & Rotational Periods', 'Atmospheric Gas Ratios', 'Moons Counts (2024-2026 data)']
  },
  {
    id: 'nasa-jpl',
    name: 'Jet Propulsion Laboratory (JPL) Horizons',
    organization: 'California Institute of Technology / NASA',
    url: 'https://ssd.jpl.nasa.gov/horizons',
    purpose: 'Ephemeris calculations, asteroid belt dynamics, interplanetary trajectory verification, and deep space probe tracking.',
    verifiedFields: ['Voyager 1 & 2 Distances', 'Asteroid Belt Dimensions', 'Planetary Orbital Eccentricities']
  },
  {
    id: 'esa-science',
    name: 'ESA Science & Technology',
    organization: 'European Space Agency (ESA)',
    url: 'https://sci.esa.int',
    purpose: 'BepiColombo Mercury mission details, JUICE Jovian explorer trajectory, Gaia stellar parallax catalog, and Mars Express datasets.',
    verifiedFields: ['Mercury Magnetosphere', 'Jovian Icy Moons', 'Milky Way Astrometry']
  },
  {
    id: 'stsci-jwst-hubble',
    name: 'Space Telescope Science Institute (STScI)',
    organization: 'STScI / NASA / ESA / CSA',
    url: 'https://www.stsci.edu',
    purpose: 'James Webb Space Telescope (JWST) infrared science archives and Hubble Space Telescope spectroscopic data.',
    verifiedFields: ['High-z Early Galaxies', 'Exoplanet Transmission Spectra (WASP-39b)', 'Deep Field Galaxy Densities']
  },
  {
    id: 'caltech-ligo',
    name: 'LIGO Scientific Collaboration',
    organization: 'Caltech / MIT / NSF',
    url: 'https://www.ligo.caltech.edu',
    purpose: 'Gravitational wave strain detection benchmarks, binary black hole merger parameters, and spacetime distortion mathematics.',
    verifiedFields: ['Gravitational Wave Frequencies', 'Kilonova GW170817 Nucleosynthesis', 'Schwarzschild Event Horizon Metrics']
  },
  {
    id: 'nasa-exoplanet',
    name: 'NASA Exoplanet Archive',
    organization: 'NASA Exoplanet Science Institute (NExScI)',
    url: 'https://exoplanetarchive.ipac.caltech.edu',
    purpose: 'Peer-reviewed catalog of confirmed extrasolar planets, transit photometry curves, and radial velocity measurements.',
    verifiedFields: ['Confirmed Exoplanet Counts', 'TRAPPIST-1 Habitable Zone Metrics', 'Planetary Radius vs Mass Distributions']
  }
];
