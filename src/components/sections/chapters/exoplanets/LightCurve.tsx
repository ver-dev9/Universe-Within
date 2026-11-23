import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { axisFor, fluxAt, formatAxis, transitHalfWidth, wrapPhase } from '../../../../scenes/exoplanets/transitMath';

interface LightCurveProps {
  /** Planet-to-star radius ratio. */
  k: number;
  /** Orbit radius in stellar radii. */
  a: number;
  phase: MutableRefObject<number>;
  /** Run the marker loop (false = draw once). */
  active: boolean;
  /** Changes whenever the phase is set from outside (slider) so the static marker redraws. */
  phaseVersion: number;
  depthLabel: string;
}

const W = 420;
const H = 190;
const PAD = { l: 52, r: 14, t: 16, b: 30 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;

/**
 * Live light curve: relative brightness of the star versus orbital phase,
 * computed from the same geometry the 3D scene draws.
 */
export function LightCurve({ k, a, phase, active, phaseVersion, depthLabel }: LightCurveProps) {
  const depth = Math.min(1, k * k);
  const axis = axisFor(depth);
  const half = Math.max(0.05, transitHalfWidth(k, a) * 1.7);

  const x = (p: number) => PAD.l + ((p + half) / (2 * half)) * PW;
  const y = (f: number) => PAD.t + ((1 - f) / axis) * PH;

  const path = useMemo(() => {
    const n = 220;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const p = -half + (i / n) * 2 * half;
      const f = fluxAt(p, k, a);
      d += `${i === 0 ? 'M' : 'L'}${x(p).toFixed(2)},${y(f).toFixed(2)}`;
    }
    return d;
  }, [k, a, half, axis]); // eslint-disable-line react-hooks/exhaustive-deps

  const marker = useRef<SVGCircleElement>(null);
  const guide = useRef<SVGLineElement>(null);
  const readout = useRef<SVGTextElement>(null);

  useEffect(() => {
    const draw = () => {
      const p = wrapPhase(phase.current);
      const visible = Math.abs(p) <= half;
      const f = fluxAt(p, k, a);
      const cx = x(Math.max(-half, Math.min(half, p)));
      const cy = y(f);
      if (marker.current) {
        marker.current.setAttribute('cx', cx.toFixed(2));
        marker.current.setAttribute('cy', cy.toFixed(2));
        marker.current.style.opacity = visible ? '1' : '0';
      }
      if (guide.current) {
        guide.current.setAttribute('x1', cx.toFixed(2));
        guide.current.setAttribute('x2', cx.toFixed(2));
        guide.current.style.opacity = visible ? '0.5' : '0';
      }
      if (readout.current) {
        readout.current.textContent = visible
          ? `brightness ${(f * 100).toFixed(f > 0.999 ? 3 : 2)}%`
          : 'planet out of transit';
      }
    };
    draw();
    if (!active) return;
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, k, a, half, axis, phase, phaseVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const ticks = [0, 0.5, 1].map((t) => ({ v: t * axis, yy: PAD.t + t * PH }));

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Light curve: the star's brightness dips by ${depthLabel} while the planet crosses it.`}>
        <rect x={PAD.l} y={PAD.t} width={PW} height={PH} fill="rgba(8,11,22,0.6)" stroke="rgba(238,242,250,0.08)" />
        {ticks.map((t) => (
          <g key={t.yy}>
            <line x1={PAD.l} x2={PAD.l + PW} y1={t.yy} y2={t.yy} stroke="rgba(238,242,250,0.07)" strokeDasharray="3 4" />
            <text x={PAD.l - 6} y={t.yy + 3} textAnchor="end" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace' }}>
              {t.v === 0 ? '100%' : `−${formatAxis(t.v)}`}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#69D9EF" strokeWidth={2} strokeLinejoin="round" />
        <line ref={guide} y1={PAD.t} y2={PAD.t + PH} stroke="#E7B86B" strokeWidth={1} />
        <circle ref={marker} r={4.5} fill="#E7B86B" stroke="#03040A" strokeWidth={1.5} />
        <text ref={readout} x={PAD.l + PW - 4} y={PAD.t + 12} textAnchor="end" className="fill-cosmos-white" style={{ font: '10px "JetBrains Mono", monospace' }} />
        <text x={PAD.l + PW / 2} y={H - 8} textAnchor="middle" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace', letterSpacing: '0.15em' }}>
          TIME → (CENTRED ON MID-TRANSIT)
        </text>
        <text x={12} y={PAD.t + PH / 2} transform={`rotate(-90 12 ${PAD.t + PH / 2})`} textAnchor="middle" className="fill-cosmos-muted" style={{ font: '9px "JetBrains Mono", monospace', letterSpacing: '0.15em' }}>
          BRIGHTNESS
        </text>
      </svg>
      <figcaption className="mt-1 font-mono text-[10px] text-cosmos-muted">
        Y-axis spans 0 to −{formatAxis(axis)}; it steps to a wider range as the planet grows.
      </figcaption>
    </figure>
  );
}
