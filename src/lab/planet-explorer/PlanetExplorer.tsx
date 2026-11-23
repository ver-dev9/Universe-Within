import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS_DATA, SUN_DATA, EARTH_DIAMETER_KM, AU_MILLION_KM } from '../../data/planetsData';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { AtmosphereGlow } from '../../components/effects/AtmosphereGlow';
import { SaturnRing } from '../../components/planets/SaturnRing';
import { LabCanvas } from '../shared/LabCanvas';
import { Starfield } from '../shared/Starfield';
import { useLabEnv } from '../shared/useLabEnv';
import { Badge, ChoiceGroup, ReadoutGrid, Slider, Toggle, ToolLayout } from '../shared/LabUI';
import { sig } from '../shared/format';

const ATMOSPHERE: Record<string, { color: string; intensity: number }> = {
  venus: { color: '#FFD580', intensity: 1.4 },
  earth: { color: '#48CFFF', intensity: 1.2 },
  mars: { color: '#FF8866', intensity: 0.8 },
  jupiter: { color: '#E8C9A0', intensity: 0.9 },
  saturn: { color: '#F0DDB0', intensity: 0.8 },
  uranus: { color: '#9FE6F0', intensity: 1.1 },
  neptune: { color: '#5B8CFF', intensity: 1.1 },
  sun: { color: '#FFB347', intensity: 1.6 },
};
const HAS_RINGS = new Set(['saturn', 'uranus']);

const BODIES = [{ id: 'sun', name: 'Sun' }, ...PLANETS_DATA.map((p) => ({ id: p.id, name: p.name }))];

interface Settings {
  bodyId: string;
  atmosphere: boolean;
  rings: boolean;
  tilt: boolean;
  /** Simulated hours per real second. */
  hoursPerSecond: number;
}

const defaults = (reduced: boolean): Settings => ({ bodyId: 'earth', atmosphere: true, rings: true, tilt: true, hoursPerSecond: reduced ? 0 : 4 });

/* ───────────── 3D ───────────── */

const Body: React.FC<{ s: Settings; segments: number }> = ({ s, segments }) => {
  const spinRef = useRef<THREE.Mesh>(null);
  const planet = PLANETS_DATA.find((p) => p.id === s.bodyId);
  const isSun = s.bodyId === 'sun';
  const texture = useMemo(() => getPlanetTexture(s.bodyId), [s.bodyId]);
  // Sun: 609.12 h sidereal, adopted at 16° latitude (NASA Sun fact sheet). Planets: NSSDC sidereal rotation (sign = direction).
  const rotationHours = isSun ? 609.12 : planet!.rotationPeriodHours;
  const tiltDeg = isSun ? 7.25 : planet!.axialTiltDeg;
  const tilt = s.tilt ? THREE.MathUtils.degToRad(tiltDeg) : 0;

  useEffect(() => {
    if (spinRef.current) spinRef.current.rotation.y = 0;
  }, [s.bodyId]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    // radians = 2π × (simulated hours / rotation period)
    if (spinRef.current) spinRef.current.rotation.y += (2 * Math.PI * s.hoursPerSecond * dt) / rotationHours;
  });

  const axis = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1.7, 0), new THREE.Vector3(0, 1.7, 0)]);
    return g;
  }, []);
  useEffect(() => () => axis.dispose(), [axis]);

  const atm = ATMOSPHERE[s.bodyId];

  return (
    <group>
      {/* Orbit-plane reference: tilt is measured from this plane's normal */}
      {s.tilt && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.9, 1.92, 128]} />
          <meshBasicMaterial color="#929CAF" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
      {s.tilt && (
        <lineSegments geometry={axis}>
          <lineBasicMaterial color="#929CAF" transparent opacity={0.4} />
        </lineSegments>
      )}

      <group rotation={[0, 0, -tilt]}>
        <mesh ref={spinRef}>
          <sphereGeometry args={[1, segments, segments]} />
          {isSun ? <meshBasicMaterial map={texture} toneMapped={false} /> : <meshStandardMaterial map={texture} roughness={0.85} metalness={0.02} />}
        </mesh>
        {s.tilt && (
          <>
            <lineSegments geometry={axis}>
              <lineBasicMaterial color="#69D9EF" />
            </lineSegments>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.005, 1.02, 128]} />
              <meshBasicMaterial color="#69D9EF" transparent opacity={0.55} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}
        {s.rings && s.bodyId === 'saturn' && <SaturnRing />}
        {s.rings && s.bodyId === 'uranus' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.64, 2.0, 128]} />
            <meshBasicMaterial color="#9FD8E0" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
      </group>

      {s.atmosphere && atm && <AtmosphereGlow radius={1} color={atm.color} intensity={atm.intensity} power={isSun ? 2.2 : 3.5} />}
    </group>
  );
};

const Scene: React.FC<{ s: Settings; resetKey: number }> = ({ s, resetKey }) => {
  const { profile } = useLabEnv();
  const segments = Math.max(32, Math.round(96 * profile.geometryDetail));
  const isSun = s.bodyId === 'sun';
  return (
    <>
      <color attach="background" args={['#03040A']} />
      <Starfield fraction={0.3} />
      <ambientLight intensity={isSun ? 1 : 0.08} />
      <directionalLight position={[6, 2, 4]} intensity={isSun ? 0 : 2.6} />
      <Body s={s} segments={segments} />
      <OrbitControls key={resetKey} enablePan={false} enableDamping minDistance={1.6} maxDistance={9} makeDefault />
    </>
  );
};

/* ───────────── Tool ───────────── */

const PlanetExplorer: React.FC = () => {
  const { reducedMotion } = useLabEnv();
  const [s, setS] = useState<Settings>(() => defaults(reducedMotion));
  const [resetKey, setResetKey] = useState(0);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  const planet = PLANETS_DATA.find((p) => p.id === s.bodyId);
  const isSun = s.bodyId === 'sun';
  const rotationHours = isSun ? 609.12 : planet!.rotationPeriodHours;
  const secondsPerTurn = s.hoursPerSecond > 0 ? Math.abs(rotationHours) / s.hoursPerSecond : Infinity;

  const rows = isSun
    ? [
        { label: 'Diameter', value: `${SUN_DATA.actualDiameterKm.toLocaleString('en-US')} km`, note: `${sig(SUN_DATA.actualDiameterKm / EARTH_DIAMETER_KM)} × Earth` },
        { label: 'Rotation', value: '25.38 days', note: 'sidereal, adopted at 16° latitude (≈ 34 d near the poles)' },
        { label: 'Axis tilt', value: '7.25°', note: 'to the ecliptic' },
        { label: 'Surface', value: '5,772 K', note: 'effective temperature' },
        { label: 'Class', value: SUN_DATA.spectralClass },
      ]
    : [
        { label: 'Diameter', value: `${planet!.actualDiameterKm.toLocaleString('en-US')} km`, note: `${sig(planet!.actualDiameterKm / EARTH_DIAMETER_KM)} × Earth (equatorial)` },
        { label: 'Distance', value: `${planet!.distanceFromSunMillionKm.toLocaleString('en-US')} M km`, note: `${sig(planet!.distanceFromSunMillionKm / AU_MILLION_KM)} au, semi-major axis` },
        {
          label: 'Rotation',
          value: Math.abs(rotationHours) > 72 ? `${sig(Math.abs(rotationHours) / 24)} days` : `${sig(Math.abs(rotationHours))} h`,
          note: rotationHours < 0 ? 'sidereal · retrograde' : 'sidereal',
        },
        { label: 'Axis tilt', value: `${planet!.axialTiltDeg}°`, note: planet!.axialTiltDeg > 90 ? 'over 90° = spins backwards' : 'obliquity to orbit' },
        { label: 'Mean temp', value: `${planet!.averageTemperatureC} °C` },
        { label: 'Moons', value: planet!.moonsCount },
      ];

  return (
    <ToolLayout
      kicker="Tool 01 · Planet Explorer"
      title={isSun ? 'The Sun' : planet!.name}
      intro="Drag to orbit, scroll or pinch to zoom. Pick a world, then switch layers on and off and change how fast time runs."
      onReset={() => {
        setS(defaults(reducedMotion));
        setResetKey((k) => k + 1);
      }}
      stage={
        <LabCanvas label={`3D model of ${isSun ? 'the Sun' : planet!.name}; drag to rotate the view`} camera={{ position: [0, 0.6, 4.2], fov: 40 }}>
          <Scene s={s} resetKey={resetKey} />
        </LabCanvas>
      }
      overlay={
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="muted">Procedural texture · size not to scale</Badge>
          {s.tilt && <Badge tone="cyan">Axis · equator · orbit plane</Badge>}
        </div>
      }
      controls={
        <>
          <ChoiceGroup label="World" options={BODIES.map((b) => ({ id: b.id, label: b.name }))} value={s.bodyId} onChange={(id) => set('bodyId', id)} />
          <div className="grid grid-cols-3 gap-1.5">
            <Toggle label="Atmosphere" checked={s.atmosphere} onChange={(v) => set('atmosphere', v)} disabled={s.bodyId === 'mercury'} hint="Mercury has only a thin exosphere" />
            <Toggle label="Rings" checked={s.rings} onChange={(v) => set('rings', v)} disabled={!HAS_RINGS.has(s.bodyId)} hint="Drawn for Saturn and Uranus" />
            <Toggle label="Axial tilt" checked={s.tilt} onChange={(v) => set('tilt', v)} />
          </div>
          <Slider
            label="Rotation speed"
            min={0}
            max={48}
            step={0.5}
            value={s.hoursPerSecond}
            onChange={(v) => set('hoursPerSecond', v)}
            valueText={s.hoursPerSecond === 0 ? 'paused' : `1 s = ${s.hoursPerSecond} h`}
            hint={isFinite(secondsPerTurn) ? `At this rate one full turn takes ${sig(secondsPerTurn)} s on screen.` : 'Spin paused.'}
          />
        </>
      }
      readout={<ReadoutGrid rows={rows} />}
      explanation={
        <>
          <p>
            Every world here spins at its <strong className="text-cosmos-white">real sidereal rate</strong>, scaled by the same clock, so switching
            from Jupiter (9.9 h) to Venus (243 days, backwards) shows the true contrast. Venus and Uranus have tilts above 90°, which means they
            rotate retrograde.
          </p>
          <p>
            Axial tilt (obliquity) is the angle between a planet’s spin axis (cyan) and the normal to its orbital plane (grey). Earth’s 23.4° gives us
            seasons; Uranus at 97.8° effectively rolls around the Sun on its side.
          </p>
          <p>Saturn’s rings are drawn at their true extent, 1.24–2.27 Saturn radii. Surfaces are procedural, not spacecraft imagery.</p>
        </>
      }
      sources={[
        { name: 'NASA NSSDCA Planetary Fact Sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note: 'Diameter, distance, rotation, obliquity, temperature, moons' },
        { name: 'NASA NSSDCA Sun Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', note: 'Sidereal rotation 609.12 h (16° latitude), obliquity 7.25°' },
        { name: 'NASA NSSDCA Saturnian Rings Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html' },
      ]}
    />
  );
};

export default PlanetExplorer;
