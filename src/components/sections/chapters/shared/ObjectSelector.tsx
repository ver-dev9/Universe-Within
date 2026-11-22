import React, { KeyboardEvent, useRef } from 'react';

export interface SelectorItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface ObjectSelectorProps {
  items: SelectorItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** id prefix used to link tabs to the info panel (aria-controls). */
  idPrefix: string;
  ariaLabel: string;
  accent?: string;
}

/**
 * WAI-ARIA tablist with roving tabindex: Arrow keys move and select,
 * Home/End jump to the ends. Selection triggers the camera fly-to.
 */
export function ObjectSelector({ items, selectedId, onSelect, idPrefix, ariaLabel, accent = '#69D9EF' }: ObjectSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, items.findIndex((i) => i.id === selectedId));

  const move = (next: number) => {
    const n = (next + items.length) % items.length;
    onSelect(items[n].id);
    refs.current[n]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        move(0);
        break;
      case 'End':
        e.preventDefault();
        move(items.length - 1);
        break;
    }
  };

  return (
    <div role="tablist" aria-label={ariaLabel} aria-orientation="horizontal" onKeyDown={onKeyDown} className="flex flex-wrap gap-1.5">
      {items.map((item, i) => {
        const active = item.id === selectedId;
        return (
          <button
            key={item.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(item.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-[0.12em] uppercase transition-colors border ${
              active ? 'text-cosmos-void font-semibold' : 'text-cosmos-white/80 border-white/15 bg-cosmos-void/60 hover:text-cosmos-white hover:border-white/40'
            }`}
            style={active ? { background: accent, borderColor: accent } : undefined}
          >
            {item.label}
            {item.sublabel && <span className="sr-only"> — {item.sublabel}</span>}
          </button>
        );
      })}
    </div>
  );
}
