import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS_DATA, EARTH_DIAMETER_KM } from '../../data/planetsData';
import { NSSDC_SUMMARY_SOURCE, ORBITAL_ELEMENTS, ORBIT_SOURCE } from '../../data/labData';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { LabCanvas } from '../shared/LabCanvas';
import { Starfield } from '../shared/Starfield';
import { useLabEnv } from '../shared/useLabEnv';
import { Badge, ReadoutGrid, SmallButton, Slider, Toggle, ToolLayout } from '../shared/LabUI';
import { fromJulian, keplerPosition, orbitPointAtE, toJulian } from '../shared/physics';
import { sig } from '../shared/format';

/** Compressed display distance (scene units) for a true distance in au. */
const displayRadius = (au: number) => 4 + 9 * Math.log2(1 + au);
/** Exaggerated planet size so every world stays visible. */
const displaySize = (diameterKm: number) => 0.3 + 0.28 * Math.cbrt(diameterKm / EARTH_DIAMETER_KM);

const NEPTUNE_PERIOD = PLANETS_DATA[PLANETS_DATA.length - 1].orbitPeriodDays;

/** Slider position (log10 days per second) → days per second. */
const speedFromExp = (exp: number) => Math.pow(10, exp);

interface SimState {
  jd: number;
}

interface Settings {
  speedExp: number;
  paused: boolean;
  orbits: boolean;
  labels: boolean;
  /** Which planets are drawn. */
  visible: Record<string, boolean>;
}

const allVisible = () => Object.fromEntries(PLANETS_DATA.map((p) => [p.id, true])) as Record<string, boolean>;
const defaults = (reduced: boolean): Settings => ({ speedExp: 1, paused: reduced, orbits: true, labels: true, visible: allVisible() });

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/* ───────────── 3D ───────────── */

const OrbitPath: React.FC<{ id: string; scale: number }> = ({ id, scale }) => {
  const line = useMemo(() => {
    const el = ORBITAL_ELEMENTS[id];
    const pts: THREE.Vector3[] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i <= 256; i++) pts.push(orbitPointAtE(el, (i / 256) * Math.PI * 2, v).clone().multiplyScalar(scale));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#69D9EF', transparent: true, opacity: 0.28, depthWrite: false });
    return new THREE.Line(geo, mat);
  }, [id, scale]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  return <primitive object={line} />;
};

interface SystemProps {
  s: Settings;
  sim: React.MutableRefObject<SimState>;
  dateEl: React.RefObject<HTMLSpanElement>;
  warnEl: React.RefObject<HTMLSpanElement>;
  distEls: React.MutableRefObject<Record<string, HTMLElement | null>>;
  segments: number;
}

const System: React.FC<SystemProps> = ({ s, sim, dateEl, warnEl, distEls, segments }) => {
  const bodies = useRef<Record<string, THREE.Group | null>>({});
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const sunTex = useMemo(() => getPlanetTexture('sun'), []);
  const frame = useRef(0);

  useFrame((_, delta) => {
    if (!s.paused) sim.current.jd += Math.min(delta, 0.1) * speedFromExp(s.speedExp);
    const jd = sim.current.jd;
    for (const p of PLANETS_DATA) {
      const el = ORBITAL_ELEMENTS[p.id];
      keplerPosition(el, p.orbitPeriodDays, jd, tmp);
      const r = tmp.length();
      const g = bodies.current[p.id];
      if (g) g.position.copy(tmp).multiplyScalar(displayRadius(el.a) / el.a);
      if (frame.current % 6 === 0) {
        const d = distEls.current[p.id];
        if (d) d.textContent = `${r.toFixed(3)} au`;
      }
    }
    if (frame.current % 3 === 0) {
      const date = fromJulian(jd);
      if (dateEl.current) dateEl.current.textContent = isNaN(date.getTime()) ? '—' : dateFmt.format(date);
      const y = date.getUTCFullYear();
      if (warnEl.current) warnEl.current.style.display = y < 1800 || y > 2050 ? 'inline-block' : 'none';
    }
    frame.current++;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.8, segments, segments]} />
        <meshBasicMaterial map={sunTex} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={0} />
      {s.orbits && PLANETS_DATA.filter((p) => s.visible[p.id]).map((p) => <OrbitPath key={p.id} id={p.id} scale={displayRadius(ORBITAL_ELEMENTS[p.id].a) / ORBITAL_ELEMENTS[p.id].a} />)}
      {PLANETS_DATA.filter((p) => s.visible[p.id]).map((p) => (
        <PlanetDot key={p.id} id={p.id} name={p.name} size={displaySize(p.actualDiameterKm)} segments={segments} labels={s.labels} registerRef={(g) => (bodies.current[p.id] = g)} />
      ))}
    </group>
  );
};

const PlanetDot: React.FC<{ id: string; name: string; size: number; segments: number; labels: boolean; registerRef: (g: THREE.Group | null) => void }> = ({
  id,
  name,
  size,
  segments,
  labels,
  registerRef,
}) => {
  const tex = useMemo(() => getPlanetTexture(id), [id]);
  return (
    <group ref={registerRef}>
      <mesh>
        <sphereGeometry args={[size, Math.round(segments / 2), Math.round(segments / 2)]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {id === 'saturn' && (
        <mesh rotation={[-Math.PI / 2 + 0.47, 0, 0]}>
          <ringGeometry args={[size * 1.24, size * 2.27, 64]} />
          <meshBasicMaterial color="#D9C49A" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {labels && (
        <Html position={[0, size + 0.9, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-cosmos-white/80">{name}</span>
        </Html>
      )}
    </group>
  );
};

/* ───────────── Tool ───────────── */

const SolarSystemExplorer: React.FC = () => {
  const { reducedMotion, profile } = useLabEnv();
  const [s, setS] = useState<Settings>(() => defaults(reducedMotion));
  const [resetKey, setResetKey] = useState(0);
  const sim = useRef<SimState>({ jd: toJulian(new Date()) });
  const dateEl = useRef<HTMLSpanElement>(null);
  const warnEl = useRef<HTMLSpanElement>(null);
  const distEls = useRef<Record<string, HTMLElement | null>>({});
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));
  const segments = Math.max(24, Math.round(48 * profile.geometryDetail));
  const dps = speedFromExp(s.speedExp);

  const reset = () => {
    sim.current.jd = toJulian(new Date());
    setS(defaults(reducedMotion));
    setResetKey((k) => k + 1);
  };

  return (
    <ToolLayout
      kicker="Tool 02 · Solar System Explorer"
      title="Clockwork of the planets"
      intro="Each planet follows its own ellipse, solved from Kepler’s equation with NASA/JPL orbital elements and starting from today’s date. Speed time up and watch Mercury race while Neptune barely moves."
      onReset={reset}
      stage={
        <LabCanvas label="Top-down 3D view of the eight planets moving on their orbits around the Sun" camera={{ position: [0, 62, 58], fov: 45, far: 2000 }}>
          <color attach="background" args={['#03040A']} />
          <Starfield fraction={0.3} radius={700} />
          <ambientLight intensity={0.12} />
          <System s={s} sim={sim} dateEl={dateEl} warnEl={warnEl} distEls={distEls} segments={segments} />
          <OrbitControls key={resetKey} enablePan={false} enableDamping minDistance={12} maxDistance={180} makeDefault />
        </LabCanvas>
      }
      overlay={
        <>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge>Distances compressed · sizes exaggerated</Badge>
          </div>
          <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-cosmos-void/70 px-4 py-2 backdrop-blur-sm" aria-live="off">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-muted">Simulated date (UTC)</p>
            <span ref={dateEl} className="font-display text-2xl text-cosmos-white tabular-nums">
              —
            </span>
            <span ref={warnEl} style={{ display: 'none' }} className="ml-3 align-middle font-mono text-[10px] uppercase tracking-[0.15em] text-cosmos-gold">
              Outside 1800–2050 fit: positions drift
            </span>
          </div>
        </>
      }
      controls={
        <>
          <Slider
            label="Time speed"
            min={-1}
            max={3}
            step={0.05}
            value={s.speedExp}
            onChange={(v) => set('speedExp', v)}
            valueText={`${sig(dps, 2)} days / s`}
            hint={`One Earth year passes in ${sig(365.256 / dps, 2)} s; one Neptune orbit in ${sig(NEPTUNE_PERIOD / dps / 60, 2)} min.`}
          />
          <div className="grid grid-cols-3 gap-1.5">
            <SmallButton onClick={() => set('paused', !s.paused)} active={s.paused} aria-pressed={s.paused}>
              {s.paused ? '▶ Play' : '❚❚ Pause'}
            </SmallButton>
            <Toggle label="Orbits" checked={s.orbits} onChange={(v) => set('orbits', v)} />
            <Toggle label="Labels" checked={s.labels} onChange={(v) => set('labels', v)} />
          </div>
          <SmallButton
            onClick={() => {
              sim.current.jd = toJulian(new Date());
            }}
          >
            Jump to today
          </SmallButton>
          <div>
            <p id="orbit-planets-label" className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cosmos-muted">
              Planets shown
            </p>
            <div role="group" aria-labelledby="orbit-planets-label" className="grid grid-cols-4 gap-1.5">
              {PLANETS_DATA.map((p) => (
                <SmallButton
                  key={p.id}
                  active={s.visible[p.id]}
                  aria-pressed={s.visible[p.id]}
                  onClick={() => set('visible', { ...s.visible, [p.id]: !s.visible[p.id] })}
                >
                  {p.name}
                </SmallButton>
              ))}
            </div>
          </div>
        </>
      }
      readout={
        <>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-muted">Live distance from the Sun · Kepler’s third law</p>
          <ReadoutGrid
            rows={PLANETS_DATA.map((p) => {
              const el = ORBITAL_ELEMENTS[p.id];
              const years = p.orbitPeriodDays / 365.256;
              return {
                label: p.name,
                value: <span ref={(node) => (distEls.current[p.id] = node)}>—</span>,
                note: `P ${sig(years)} yr · a ${sig(el.a)} au · P²/a³ = ${((years * years) / (el.a * el.a * el.a)).toFixed(3)} · e ${el.e.toFixed(3)}`,
              };
            })}
          />
        </>
      }
      explanation={
        <>
          <p>
            <strong className="text-cosmos-white">Kepler’s laws in action.</strong> Each planet’s mean anomaly advances uniformly with its real sidereal
            period (Mercury 88 days, Neptune ≈ 164.8 years). Solving <em>M = E − e sin E</em> turns that into a position on an ellipse with the Sun at one
            focus, so planets speed up near perihelion and slow down near aphelion. Mercury’s eccentricity of 0.206 makes its distance swing between
            0.31 and 0.47 au.
          </p>
          <p>
            <strong className="text-cosmos-white">Kepler’s third law</strong> says the square of a planet’s period grows with the cube of its orbit’s
            semi-major axis: in years and au, <em>P² / a³ ≈ 1</em> for every planet. The readout computes that ratio live from NASA periods and JPL
            axes, which is why Neptune, 30 times farther out than Earth, needs about 165 years (√30³ ≈ 164) for one lap.
          </p>
          <p>
            Distances are compressed logarithmically for display: each orbit keeps its true shape and orientation, but the outer planets are pulled in
            so all eight fit on screen. Real Neptune sits 78 times farther out than Mercury.
          </p>
          <p>
            Accuracy note: this uses JPL’s J2000 Keplerian elements without their slow rates, which is close to the published low-precision method for
            1800–2050. Beyond that window the planets drift from where they truly were.
          </p>
        </>
      }
      sources={[
        { name: ORBIT_SOURCE.name, url: ORBIT_SOURCE.url, note: 'a, e, I, L, ϖ, Ω at J2000; Kepler solution recipe' },
        { name: 'NASA NSSDCA Planetary Fact Sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note: 'Sidereal orbital periods, diameters' },
        { name: NSSDC_SUMMARY_SOURCE.name, url: NSSDC_SUMMARY_SOURCE.url, note: 'Eccentricities (cross-check)' },
      ]}
    />
  );
};

export default SolarSystemExplorer;
