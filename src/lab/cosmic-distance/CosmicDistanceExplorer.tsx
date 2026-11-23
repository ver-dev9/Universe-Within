import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { C_M_S, DISTANCE_MILESTONES, DISTANCE_RANGE, type DistanceMilestone } from '../../data/labData';
import { getSoftSprite } from '../../utils/softSprite';
import { LabCanvas } from '../shared/LabCanvas';
import { Starfield } from '../shared/Starfield';
import { useLabEnv } from '../shared/useLabEnv';
import { Badge, SmallButton, Slider, ToolLayout, cx } from '../shared/LabUI';
import { formatDistance, lightTime } from '../shared/format';

const LOG_MIN = Math.log10(DISTANCE_RANGE.minMeters);
const LOG_MAX = Math.log10(DISTANCE_RANGE.maxMeters);
/** Scene radius (units) at which the current slider distance is drawn. */
const VIEW_R = 3.2;

/** Radius the milestone ring represents (half the size for "diameter" milestones). */
const ringMeters = (m: DistanceMilestone) => (m.measure === 'diameter' ? m.meters / 2 : m.meters);
const logOf = (m: DistanceMilestone) => Math.log10(ringMeters(m));

const MARKER_COLOR: Record<string, string> = {
  moon: '#B8B5AE',
  sun: '#FFB347',
  neptune: '#5B8CFF',
  oort: '#69D9EF',
  'light-year': '#E7B86B',
  proxima: '#FF7A59',
  'milky-way': '#8A5BCA',
  andromeda: '#C9B8FF',
  virgo: '#9FB8FF',
  laniakea: '#69D9EF',
  observable: '#E7B86B',
};

/* ───────────── 3D ───────────── */

const unitCircle = (() => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 192; i++) {
    const a = (i / 192) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
  }
  return pts;
})();

const Ring: React.FC<{ m: DistanceMilestone; logView: React.MutableRefObject<number>; active: boolean }> = ({ m, logView, active }) => {
  const color = MARKER_COLOR[m.id] ?? '#EEF2FA';
  const group = useRef<THREE.Group>(null);
  const label = useRef<HTMLDivElement>(null);
  const { line, dot } = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(unitCircle);
    const dashed = m.estimate || m.measure !== 'distance';
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0.6, dashSize: 0.04, gapSize: 0.03, depthWrite: false })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6, depthWrite: false });
    const l = new THREE.Line(geo, mat);
    if (dashed) l.computeLineDistances();
    const dotMat = new THREE.SpriteMaterial({ map: getSoftSprite(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const d = new THREE.Sprite(dotMat);
    return { line: l, dot: d };
  }, [m, color]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      dot.material.dispose();
    },
    [line, dot],
  );
  const angle = useMemo(() => 0.35 + (DISTANCE_MILESTONES.indexOf(m) * 2.399) % (Math.PI * 2), [m]);

  useFrame(() => {
    const rho = VIEW_R * Math.pow(10, logOf(m) - logView.current);
    const g = group.current;
    if (!g) return;
    const visible = rho > 0.015 && rho < 60;
    g.visible = visible;
    if (!visible) {
      if (label.current) label.current.style.opacity = '0';
      return;
    }
    line.scale.setScalar(rho);
    // Fade rings that have grown far past the frame or shrunk into the centre.
    const fade = Math.min(1, Math.max(0, (rho - 0.015) / 0.12)) * Math.min(1, Math.max(0, (14 - rho) / 8));
    (line.material as THREE.LineBasicMaterial).opacity = (active ? 0.95 : 0.5) * fade;
    dot.position.set(Math.cos(angle) * rho, Math.sin(angle) * rho, 0.01);
    const s = 0.22 + (active ? 0.12 : 0);
    dot.scale.set(s, s, 1);
    dot.material.opacity = fade;
    if (label.current) {
      const show = rho > 0.25 && rho < 6;
      label.current.style.opacity = show ? String(fade) : '0';
    }
  });

  return (
    <group ref={group}>
      <primitive object={line} />
      <primitive object={dot}>
        <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={label} className="translate-y-4 whitespace-nowrap text-center transition-opacity duration-200">
            <p className={cx('font-mono text-[10px] uppercase tracking-[0.2em]', active ? 'text-cosmos-white' : 'text-cosmos-white/70')}>{m.name}</p>
          </div>
        </Html>
      </primitive>
    </group>
  );
};

const Scene: React.FC<{ logView: React.MutableRefObject<number>; activeId: string; reducedMotion: boolean }> = ({ logView, activeId, reducedMotion }) => {
  const sky = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (!reducedMotion && sky.current) sky.current.rotation.z += d * 0.01;
  });
  return (
    <>
      <color attach="background" args={['#03040A']} />
      <group ref={sky}>
        <Starfield fraction={0.3} radius={300} size={1.4} />
      </group>
      {/* "You are here": Earth at the centre of every ring */}
      <sprite scale={[0.18, 0.18, 1]}>
        <spriteMaterial map={getSoftSprite()} color="#48CFFF" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {DISTANCE_MILESTONES.map((m) => (
        <Ring key={m.id} m={m} logView={logView} active={m.id === activeId} />
      ))}
    </>
  );
};

/* ───────────── Log ruler ───────────── */

const Ruler: React.FC<{ logValue: number; onJump: (log: number) => void }> = ({ logValue, onJump }) => {
  const pct = (l: number) => ((l - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
  return (
    <div className="absolute inset-x-4 bottom-4">
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-4 h-px bg-white/20" />
        {DISTANCE_MILESTONES.map((m) => (
          <span
            key={m.id}
            className="absolute top-2.5 h-3 w-px"
            style={{ left: `${pct(Math.log10(m.meters))}%`, background: MARKER_COLOR[m.id] ?? '#EEF2FA' }}
            aria-hidden
          />
        ))}
        <span className="absolute top-1 h-6 w-0.5 -translate-x-1/2 rounded bg-cosmos-cyan shadow-[0_0_10px_#69D9EF]" style={{ left: `${pct(logValue)}%` }} aria-hidden />
      </div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-cosmos-muted">
        <button type="button" className="pointer-events-auto hover:text-cosmos-white" onClick={() => onJump(LOG_MIN)}>
          {DISTANCE_MILESTONES[0].name}
        </button>
        <span>log scale · each step ×10</span>
        <button type="button" className="pointer-events-auto hover:text-cosmos-white" onClick={() => onJump(LOG_MAX)}>
          {DISTANCE_MILESTONES[DISTANCE_MILESTONES.length - 1].name}
        </button>
      </div>
    </div>
  );
};

/* ───────────── Tool ───────────── */

const START = Math.log10(DISTANCE_MILESTONES[0].meters) + 0.15;

const CosmicDistanceExplorer: React.FC = () => {
  const { reducedMotion } = useLabEnv();
  const [logValue, setLogValue] = useState(START);
  const logView = useRef(START);
  const anim = useRef<number | null>(null);

  // The 3D view follows the slider; eased when animating a jump.
  useEffect(() => {
    if (anim.current === null) logView.current = logValue;
  }, [logValue]);
  useEffect(() => () => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
  }, []);

  const jumpTo = (target: number) => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    anim.current = null;
    if (reducedMotion) {
      setLogValue(target);
      return;
    }
    const from = logView.current;
    const t0 = performance.now();
    const dur = 500 + 120 * Math.min(10, Math.abs(target - from));
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const v = from + (target - from) * e;
      logView.current = v;
      setLogValue(v);
      if (k < 1) anim.current = requestAnimationFrame(step);
      else anim.current = null;
    };
    anim.current = requestAnimationFrame(step);
  };

  const meters = Math.pow(10, logValue);
  const nearest = DISTANCE_MILESTONES.reduce((best, m) => (Math.abs(Math.log10(m.meters) - logValue) < Math.abs(Math.log10(best.meters) - logValue) ? m : best));
  const seconds = meters / C_M_S;
  const verb = nearest.measure === 'diameter' ? 'to cross it' : nearest.measure === 'outer edge' ? 'to reach it' : 'to get there';

  return (
    <ToolLayout
      kicker="Tool 06 · Cosmic Distance"
      title={nearest.name}
      intro="Drag the slider and fly outwards from Earth. Each ring marks a real distance; every notch on the log ruler is ten times farther than the last, so the whole universe fits on one slider."
      onReset={() => jumpTo(START)}
      stage={
        <LabCanvas label={`Concentric rings centred on Earth showing cosmic distances; current scale ${formatDistance(meters)}`} camera={{ position: [0, 0, 9], fov: 50 }}>
          <Scene logView={logView} activeId={nearest.id} reducedMotion={reducedMotion} />
        </LabCanvas>
      }
      overlay={
        <>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge tone="cyan">Centred on Earth · log zoom</Badge>
            <Badge tone="muted">Dashed = size or estimate</Badge>
          </div>
          <div className="absolute right-3 top-3 max-w-[60%] rounded-xl border border-white/10 bg-cosmos-void/70 px-4 py-2 text-right backdrop-blur-sm" aria-live="polite">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-muted">Frame radius</p>
            <p className="font-display text-2xl leading-tight text-cosmos-white tabular-nums">{formatDistance(meters)}</p>
            <p className="font-mono text-xs text-cosmos-cyan">light: {lightTime(meters)}</p>
          </div>
          <Ruler logValue={logValue} onJump={jumpTo} />
        </>
      }
      controls={
        <>
          <Slider
            label="Distance from Earth (log scale)"
            min={LOG_MIN}
            max={LOG_MAX}
            step={0.01}
            value={logValue}
            onChange={(v) => {
              if (anim.current !== null) cancelAnimationFrame(anim.current);
              anim.current = null;
              setLogValue(v);
            }}
            valueText={formatDistance(meters)}
            hint={`10^${logValue.toFixed(2)} m · light needs ${lightTime(meters)} (${seconds < 1e7 ? `${Math.round(seconds).toLocaleString('en-US')} s` : `${(seconds / 3.15576e7).toExponential(2)} yr`})`}
          />
          <div>
            <p id="dist-jump-label" className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cosmos-muted">
              Jump to
            </p>
            <div role="group" aria-labelledby="dist-jump-label" className="grid grid-cols-2 gap-1.5">
              {DISTANCE_MILESTONES.map((m) => (
                <SmallButton key={m.id} active={m.id === nearest.id} aria-pressed={m.id === nearest.id} onClick={() => jumpTo(Math.log10(m.meters))} className="truncate text-left">
                  {m.estimate ? `${m.name} ≈` : m.name}
                </SmallButton>
              ))}
            </div>
          </div>
        </>
      }
      readout={
        <div className="space-y-2 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-muted">Nearest milestone</p>
          <p className="font-display text-xl text-cosmos-white">
            {nearest.name} <span className="text-sm text-cosmos-muted">· {nearest.estimate ? '≈ ' : ''}{nearest.display}</span>
          </p>
          <p className="text-cosmos-cyan">
            {nearest.lightNote ?? `Light takes ${lightTime(nearest.meters)} ${verb}.`}
          </p>
          <p className="text-cosmos-muted">{nearest.blurb}</p>
          <a href={nearest.source.url} target="_blank" rel="noreferrer" className="inline-block text-xs text-cosmos-white/80 underline decoration-white/20 underline-offset-4 hover:text-cosmos-cyan">
            Source: {nearest.source.name}
          </a>
        </div>
      }
      explanation={
        <>
          <p>
            <strong className="text-cosmos-white">Light-travel time</strong> is distance divided by the speed of light, 299,792,458 m/s exactly. It
            is also a time machine: we see the Moon as it was 1.3 seconds ago, the Sun 8.3 minutes ago, Proxima Centauri 4.2 years ago and Andromeda
            2.5 million years ago.
          </p>
          <p>
            The rings use a logarithmic zoom: the frame’s edge is always the distance on the slider, and a ring ten times farther out sits off-screen
            until you zoom out by a factor of ten. On a linear map where the Earth–Moon distance was 1 cm, the observable universe would still be
            about {formatDistance(((2 * DISTANCE_RANGE.maxMeters) / DISTANCE_RANGE.minMeters) * 0.01)} across.
          </p>
          <p>
            Beyond a few hundred million light-years, cosmic expansion matters: the light from the edge of the observable universe has travelled
            about 13.8 billion years, but the place it left is now about 46.5 billion light-years away. Values marked ≈ are estimates.
          </p>
        </>
      }
      sources={[
        ...DISTANCE_MILESTONES.map((m) => ({ name: `${m.name}: ${m.source.name}`, url: m.source.url })),
        { name: 'BIPM SI Brochure — speed of light c = 299,792,458 m/s (defining constant)', url: 'https://www.bipm.org/en/publications/si-brochure' },
      ]}
    />
  );
};

export default CosmicDistanceExplorer;
