import React, { useId, useRef } from 'react';

/* Shared, keyboard-accessible controls for every Cosmic Lab tool. */

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

interface ToolLayoutProps {
  title: string;
  kicker: string;
  intro: string;
  /** The 3D view (a LabCanvas). */
  stage: React.ReactNode;
  /** Overlays drawn on top of the stage (badges, live readouts). */
  overlay?: React.ReactNode;
  controls: React.ReactNode;
  readout?: React.ReactNode;
  explanation: React.ReactNode;
  sources: { name: string; url: string; note?: string }[];
  onReset: () => void;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ title, kicker, intro, stage, overlay, controls, readout, explanation, sources, onReset }) => (
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
    <div className="relative h-[56vh] min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-cosmos-void lg:h-[min(72vh,760px)]">
      {stage}
      <div className="pointer-events-none absolute inset-0">{overlay}</div>
    </div>

    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="chapter-label !text-cosmos-cyan">{kicker}</p>
          <h3 className="mt-2 font-display text-3xl leading-tight text-cosmos-white sm:text-4xl">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-1 shrink-0 rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cosmos-white transition-colors hover:border-cosmos-cyan hover:text-cosmos-cyan"
        >
          Reset
        </button>
      </header>
      <p className="text-sm leading-relaxed text-cosmos-muted">{intro}</p>
      <div className="flex flex-col gap-4">{controls}</div>
      {readout && <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">{readout}</div>}
    </div>

    <div className="grid gap-5 border-t border-white/10 pt-5 text-sm leading-relaxed text-cosmos-muted lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="max-w-3xl space-y-3">{explanation}</div>
      <div>
        <p className="chapter-label">Sources</p>
        <ul className="mt-2 space-y-1.5">
          {sources.map((s) => (
            <li key={s.url + s.name}>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-cosmos-white/80 underline decoration-white/20 underline-offset-4 hover:text-cosmos-cyan">
                {s.name}
              </a>
              {s.note && <span className="block text-xs text-cosmos-muted/80">{s.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  /** Formatted value shown beside the label and announced to screen readers. */
  valueText: string;
  hint?: React.ReactNode;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ label, min, max, step = 1, value, onChange, valueText, hint, disabled }) => {
  const id = useId();
  return (
    <div className={cx('flex flex-col gap-1.5', disabled && 'opacity-50')}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.18em] text-cosmos-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-xs text-cosmos-white tabular-nums">
          {valueText}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range h-6 w-full cursor-pointer accent-cosmos-cyan"
      />
      {hint && <p className="text-xs text-cosmos-muted/80">{hint}</p>}
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    title={hint}
    onClick={() => onChange(!checked)}
    className={cx(
      'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
      checked ? 'border-cosmos-cyan/50 bg-cosmos-cyan/10 text-cosmos-white' : 'border-white/10 text-cosmos-muted hover:border-white/25',
      disabled && 'cursor-not-allowed opacity-40',
    )}
  >
    <span>{label}</span>
    <span aria-hidden className={cx('relative h-4 w-7 shrink-0 rounded-full transition-colors', checked ? 'bg-cosmos-cyan' : 'bg-white/15')}>
      <span className={cx('absolute top-0.5 h-3 w-3 rounded-full bg-cosmos-void transition-all', checked ? 'left-3.5' : 'left-0.5')} />
    </span>
  </button>
);

interface ChoiceOption {
  id: string;
  label: string;
  disabled?: boolean;
}

/**
 * Single choice from a short list as a radiogroup with roving tabindex:
 * Tab enters on the selected item, arrow keys / Home / End move.
 */
export const ChoiceGroup: React.FC<{ label: string; options: ChoiceOption[]; value: string; onChange: (id: string) => void; columns?: string }> = ({
  label,
  options,
  value,
  onChange,
  columns = 'grid-cols-3',
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (from: number, dir: number) => {
    const n = options.length;
    let i = from;
    for (let k = 0; k < n; k++) {
      i = (i + dir + n) % n;
      if (!options[i].disabled) break;
    }
    onChange(options[i].id);
    refs.current[i]?.focus();
  };
  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cosmos-muted">{label}</p>
      <div role="radiogroup" aria-label={label} className={cx('grid gap-1.5', columns)}>
        {options.map((o, i) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              disabled={o.disabled}
              onClick={() => onChange(o.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1); }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1); }
                if (e.key === 'Home') { e.preventDefault(); move(-1, 1); }
                if (e.key === 'End') { e.preventDefault(); move(options.length, -1); }
              }}
              className={cx(
                'truncate rounded-lg border px-2 py-1.5 text-xs transition-colors',
                active ? 'border-cosmos-cyan bg-cosmos-cyan/15 text-cosmos-white' : 'border-white/10 text-cosmos-muted hover:border-white/30 hover:text-cosmos-white',
                o.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ReadoutGrid: React.FC<{ rows: { label: string; value: React.ReactNode; note?: string }[] }> = ({ rows }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
    {rows.map((r) => (
      <React.Fragment key={r.label}>
        <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-muted pt-0.5">{r.label}</dt>
        <dd className="text-right tabular-nums text-cosmos-white">
          {r.value}
          {r.note && <span className="block text-[11px] text-cosmos-muted">{r.note}</span>}
        </dd>
      </React.Fragment>
    ))}
  </dl>
);

export const Badge: React.FC<{ children: React.ReactNode; tone?: 'gold' | 'cyan' | 'muted'; className?: string }> = ({ children, tone = 'gold', className }) => (
  <span
    className={cx(
      'inline-block rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm',
      tone === 'gold' && 'border-cosmos-gold/40 bg-cosmos-void/60 text-cosmos-gold',
      tone === 'cyan' && 'border-cosmos-cyan/40 bg-cosmos-void/60 text-cosmos-cyan',
      tone === 'muted' && 'border-white/15 bg-cosmos-void/60 text-cosmos-muted',
      className,
    )}
  >
    {children}
  </span>
);

export const SmallButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }> = ({ active, className, ...rest }) => (
  <button
    type="button"
    {...rest}
    className={cx(
      'rounded-lg border px-3 py-1.5 text-xs transition-colors',
      active ? 'border-cosmos-cyan bg-cosmos-cyan/15 text-cosmos-white' : 'border-white/10 text-cosmos-muted hover:border-white/30 hover:text-cosmos-white',
      className,
    )}
  />
);
