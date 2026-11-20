/**
 * Chapter registry — the single source of truth for the twelve-chapter journey.
 *
 * `sectionId` is the DOM id of the scroll section that renders the chapter.
 * `status` lets navigation show only chapters that are actually built, so the
 * site never advertises placeholder content while the upgrade is in progress.
 */
export type ChapterStatus = 'live' | 'planned';

export interface Chapter {
  number: number;
  id: string;
  sectionId: string;
  label: string;
  title: string;
  /** Accent colour used for this chapter's atmosphere (from the design system). */
  accent: string;
  status: ChapterStatus;
}

export const CHAPTERS: Chapter[] = [
  { number: 1, id: 'beginning', sectionId: 'intro', label: 'The Beginning', title: 'Universe Within', accent: '#69D9EF', status: 'live' },
  { number: 2, id: 'solar-system', sectionId: 'solar-system', label: 'Our Solar System', title: 'Our Solar System', accent: '#E7B86B', status: 'live' },
  { number: 3, id: 'sun', sectionId: 'sun', label: 'The Power of the Sun', title: 'The Power of the Sun', accent: '#E7B86B', status: 'planned' },
  { number: 4, id: 'worlds', sectionId: 'worlds', label: 'Worlds Beyond Earth', title: 'Worlds Beyond Earth', accent: '#3478D4', status: 'planned' },
  { number: 5, id: 'moons', sectionId: 'moons', label: 'The Moons', title: 'The Moons of the Solar System', accent: '#69D9EF', status: 'planned' },
  { number: 6, id: 'stars', sectionId: 'stars', label: 'Life & Death of Stars', title: 'The Life and Death of Stars', accent: '#E7B86B', status: 'planned' },
  { number: 7, id: 'nebulae', sectionId: 'nebulae', label: 'Nebulae', title: 'Nebulae: Cosmic Nurseries', accent: '#8A5BCA', status: 'planned' },
  { number: 8, id: 'black-holes', sectionId: 'beyond-planets', label: 'Black Holes', title: 'Black Holes', accent: '#E7B86B', status: 'live' },
  { number: 9, id: 'galaxies', sectionId: 'galaxies', label: 'Galaxies', title: 'Galaxies Beyond Imagination', accent: '#8A5BCA', status: 'planned' },
  { number: 10, id: 'exoplanets', sectionId: 'discoveries', label: 'Other Worlds', title: 'The Search for Other Worlds', accent: '#69D9EF', status: 'live' },
  { number: 11, id: 'cosmic-web', sectionId: 'scale-universe', label: 'Cosmic Architecture', title: 'The Architecture of the Universe', accent: '#3478D4', status: 'live' },
  { number: 12, id: 'finale', sectionId: 'final-vista', label: 'Beyond the Visible', title: 'Beyond the Visible', accent: '#EEF2FA', status: 'live' },
];

/**
 * Legacy v1 sections that still render but fold into a v2 chapter.
 * Maps section DOM id -> chapter number so navigation highlights correctly.
 */
export const SECTION_TO_CHAPTER: Record<string, number> = {
  intro: 1,
  'deep-space': 1,
  'solar-system': 2,
  'planet-exploration': 2,
  'earth-special': 2,
  'beyond-planets': 8,
  'scale-universe': 11,
  discoveries: 10,
  'final-vista': 12,
};

/** Ordered list of section ids currently rendered on the page (scroll order). */
export const SECTION_ORDER = [
  'intro',
  'deep-space',
  'solar-system',
  'planet-exploration',
  'earth-special',
  'beyond-planets',
  'scale-universe',
  'discoveries',
  'final-vista',
] as const;

export const liveChapters = () => CHAPTERS.filter((c) => c.status === 'live');
export const chapterForSection = (sectionId: string) =>
  CHAPTERS.find((c) => c.number === SECTION_TO_CHAPTER[sectionId]);
