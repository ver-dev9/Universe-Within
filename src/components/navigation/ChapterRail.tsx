import React from 'react';
import { liveChapters, chapterForSection } from '../../data/chapters';
import { useCosmosStore } from '../../store/useCosmosStore';

interface ChapterRailProps {
  onNavigate: (sectionId: string) => void;
}

/**
 * Vertical chapter index on the right edge (desktop). Shows only chapters that
 * are actually built, numbered by their place in the twelve-chapter journey.
 */
export const ChapterRail: React.FC<ChapterRailProps> = ({ onNavigate }) => {
  const activeSection = useCosmosStore((s) => s.activeSection);
  const current = chapterForSection(activeSection);

  return (
    <nav
      aria-label="Chapters"
      className="hidden 2xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3"
    >
      {liveChapters().map((c) => {
        const isActive = current?.number === c.number;
        return (
          <button
            key={c.id}
            onClick={() => onNavigate(c.sectionId)}
            aria-current={isActive ? 'step' : undefined}
            className="group flex items-center gap-3 focus-visible:outline-none"
          >
            <span
              className={`font-mono text-[10px] tracking-[0.25em] uppercase transition-all duration-500 ${
                isActive ? 'text-cosmos-white opacity-100' : 'text-cosmos-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              }`}
            >
              {c.label}
            </span>
            <span
              className={`font-mono text-[10px] tabular-nums transition-colors ${
                isActive ? 'text-cosmos-cyan' : 'text-cosmos-muted/60 group-hover:text-cosmos-white'
              }`}
            >
              {String(c.number).padStart(2, '0')}
            </span>
            <span
              className={`h-px transition-all duration-500 ${isActive ? 'w-8 bg-cosmos-cyan' : 'w-3 bg-white/25 group-hover:w-5'}`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </nav>
  );
};
