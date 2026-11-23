import React, { useEffect, useRef, useState } from 'react';
import { useInView } from '../shared/useInView';

const LINES = [0.16, 0.31, 0.47, 0.63, 0.82];
const SPEC_W = 300;
const SHIFT = 16; // px of line shift at maximum velocity (exaggerated for visibility)

/**
 * Schematic of the radial-velocity ("wobble") method: star and planet orbit a
 * shared centre of mass, and the star's spectral lines shift blue / red as it
 * moves toward / away from us. Motion is exaggerated for clarity.
 */
export function RadialVelocityDiagram({ reducedMotion }: { reducedMotion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const { inView } = useInView(host);
  const [manual, setManual] = useState<number | null>(reducedMotion ? 0.12 : null);
  const theta = useRef(0.12);

  const starRef = useRef<SVGCircleElement>(null);
  const planetRef = useRef<SVGCircleElement>(null);
  const linesRef = useRef<SVGGElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (reducedMotion && manual === null) setManual(theta.current);
  }, [reducedMotion, manual]);

  useEffect(() => {
    const draw = () => {
      const t = theta.current * Math.PI * 2;
      const c = Math.cos(t);
      const s = Math.sin(t);
      starRef.current?.setAttribute('cx', (90 - 9 * c).toFixed(2));
      starRef.current?.setAttribute('cy', (90 - 9 * s).toFixed(2));
      planetRef.current?.setAttribute('cx', (90 + 66 * c).toFixed(2));
      planetRef.current?.setAttribute('cy', (90 + 66 * s).toFixed(2));
      // Observer is below the diagram (+y). Star velocity ∝ (9 sin t, −9 cos t); toward observer = +vy.
      const away = c; // radial velocity, positive = receding (redshift)
      linesRef.current?.setAttribute('transform', `translate(${(away * SHIFT).toFixed(2)},0)`);
      const mx = 200 + ((theta.current % 1) * 200);
      markerRef.current?.setAttribute('cx', mx.toFixed(2));
      markerRef.current?.setAttribute('cy', (232 - away * 26).toFixed(2));
      if (labelRef.current) {
        labelRef.current.textContent = away > 0.25 ? 'moving away → redshift' : away < -0.25 ? 'moving toward us → blueshift' : 'crossing — no shift';
      }
    };
    if (manual !== null) {
      theta.current = manual;
      draw();
      return;
    }
    draw();
    if (!inView) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      theta.current = (theta.current + ((now - last) / 1000) * 0.12) % 1;
      last = now;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, manual]);

  let curve = '';
  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    curve += `${i ? 'L' : 'M'}${(200 + p * 200).toFixed(1)},${(232 - Math.cos(p * Math.PI * 2) * 26).toFixed(1)}`;
  }

  return (
    <div ref={host}>
      <svg
        viewBox="0 0 420 270"
        className="w-full h-auto"
        role="img"
        aria-label="Diagram: a star and planet orbit their common centre of mass. As the star moves toward Earth its spectral lines shift blue; moving away, they shift red. The velocity traces a repeating wave."
      >
        <defs>
          <linearGradient id="rv-spectrum" x1="0" x2="1">
            <stop offset="0" stopColor="#5B4BD6" />
            <stop offset="0.2" stopColor="#3478D4" />
            <stop offset="0.4" stopColor="#3FC7B5" />
            <stop offset="0.6" stopColor="#E7D46B" />
            <stop offset="0.8" stopColor="#E89A4C" />
            <stop offset="1" stopColor="#D64B4B" />
          </linearGradient>
          <clipPath id="rv-clip">
            <rect x="200" y="58" width={SPEC_W - 100} height="36" rx="3" />
          </clipPath>
        </defs>
        {/* Orbit diagram */}
        <circle cx="90" cy="90" r="66" fill="none" stroke="rgba(105,217,239,0.2)" strokeDasharray="2 4" />
        <circle cx="90" cy="90" r="9" fill="none" stroke="rgba(231,184,107,0.35)" />
        <path d="M86 90h8M90 86v8" stroke="#929CAF" strokeWidth="1" />
        <circle ref={starRef} cx="81" cy="90" r="14" fill="#FFD27A" />
        <circle ref={planetRef} cx="156" cy="90" r="5" fill="#69D9EF" />
        <text x="90" y="180" textAnchor="middle" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace' }}>
          ↓ toward Earth
        </text>
        <text x="90" y="14" textAnchor="middle" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace' }}>
          + centre of mass
        </text>

        {/* Spectrum */}
        <text x="200" y="48" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace', letterSpacing: '0.12em' }}>
          STAR’S SPECTRUM
        </text>
        <rect x="200" y="58" width={SPEC_W - 100} height="36" rx="3" fill="url(#rv-spectrum)" opacity="0.85" />
        <g clipPath="url(#rv-clip)">
          <g ref={linesRef}>
            {LINES.map((l) => (
              <rect key={l} x={200 + l * 200 - 1.5} y="58" width="3" height="36" fill="#03040A" />
            ))}
          </g>
        </g>
        {LINES.map((l) => (
          <line key={`r${l}`} x1={200 + l * 200} x2={200 + l * 200} y1="96" y2="102" stroke="#EEF2FA" strokeWidth="1" opacity="0.6" />
        ))}
        <text x="200" y="116" className="fill-cosmos-muted" style={{ font: '8px "JetBrains Mono", monospace' }}>
          ticks = lines at rest
        </text>
        <text ref={labelRef} x="400" y="116" textAnchor="end" className="fill-cosmos-white" style={{ font: '9px "JetBrains Mono", monospace' }} />

        {/* Velocity curve */}
        <text x="200" y="186" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace', letterSpacing: '0.12em' }}>
          RADIAL VELOCITY OVER ONE ORBIT
        </text>
        <line x1="200" x2="400" y1="232" y2="232" stroke="rgba(238,242,250,0.15)" />
        <text x="196" y="210" textAnchor="end" className="fill-cosmos-muted" style={{ font: '8px "JetBrains Mono", monospace' }}>away</text>
        <text x="196" y="260" textAnchor="end" className="fill-cosmos-muted" style={{ font: '8px "JetBrains Mono", monospace' }}>toward</text>
        <path d={curve} fill="none" stroke="#E7B86B" strokeWidth="1.8" />
        <circle ref={markerRef} cx="200" cy="206" r="4" fill="#EEF2FA" />
      </svg>
      {manual !== null && (
        <label className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-muted">
          <span className="shrink-0">Orbit position</span>
          <input
            type="range"
            min={0}
            max={0.99}
            step={0.01}
            value={manual}
            onChange={(e) => setManual(parseFloat(e.target.value))}
            className="w-full accent-[#E7B86B]"
            aria-valuetext={`${Math.round(manual * 360)} degrees around the orbit`}
          />
        </label>
      )}
      {!reducedMotion && (
        <button
          type="button"
          onClick={() => setManual(manual === null ? theta.current : null)}
          className="mt-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-white/80 hover:border-white/40"
          aria-pressed={manual !== null}
        >
          {manual === null ? 'Pause & scrub' : 'Resume animation'}
        </button>
      )}
    </div>
  );
}
