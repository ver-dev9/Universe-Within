import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_DIAMETER_KM, NSSDC_SUMMARY_SOURCE, SCALE_BODIES, type ScaleBody } from '../../data/labData';
import { getPlanetTexture } from '../../utils/textureGenerators';
import { LabCanvas } from '../shared/LabCanvas';
import { useLabEnv } from '../shared/useLabEnv';
import { Badge, ReadoutGrid, SmallButton, ToolLayout, cx } from '../shared/LabUI';
import { sig } from '../shared/format';

const DEFAULT_SELECTION = ['jupiter', 'earth', 'moon'];
const MAX = 4;
const MIN = 2;

/** Scene units: 1 unit = 1,000 km. */
const U = 1000;

interface Laid {
  body: ScaleBody;
  x: number;
  r: number;
}

function layout(bodies: ScaleBody[]) {
  const sorted = [...bodies].sort((a, b) => b.diameterKm - a.diameterKm);
  const maxD = sorted[0].diameterKm / U;
  const gap = maxD * 0.12;
  let x = 0;
  const laid: Laid[] = sorted.map((b) => {
    const d = b.diameterKm / U;
    const item = { body: b, x: x + d / 2, r: d / 2 };
    x += d + gap;
    return item;
  });
  const width = x - gap;
  laid.forEach((l) => (l.x -= width / 2));
  return { laid, width, maxD };
}

const Sphere: React.FC<{ l: Laid; segments: number; spin: boolean; baseline: number; pxPerUnit: number }> = ({ l, segments, spin, baseline, pxPerUnit }) => {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => (l.body.texture ? getPlanetTexture(l.body.texture) : null), [l.body.texture]);
  useFrame((_, d) => {
    if (spin && ref.current) ref.current.rotation.y += d * 0.15;
  });
  const px = l.r * pxPerUnit;
  const tiny = px < 3;
  return (
    <group position={[l.x, 0, 0]}>
      <mesh ref={ref} scale={l.r}>
        <sphereGeometry args={[1, segments, segments]} />
        {l.body.kind === 'star' ? (
          <meshBasicMaterial map={tex} toneMapped={false} />
        ) : (
          <meshStandardMaterial map={tex} color={tex ? '#ffffff' : l.body.color} roughness={0.9} />
        )}
      </mesh>
      {l.body.id === 'saturn' && (
        <mesh rotation={[-Math.PI / 2 + 0.35, 0, 0]} scale={l.r}>
          <ringGeometry args={[1.24, 2.27, 96]} />
          <meshBasicMaterial color="#D9C49A" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {tiny && (
        <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <span aria-hidden className="block h-5 w-5 rounded-full border border-cosmos-cyan/80" />
        </Html>
      )}
      <Html position={[0, baseline, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-white">{l.body.name}</p>
          <p className="font-mono text-[10px] text-cosmos-muted">{l.body.diameterKm.toLocaleString('en-US')} km</p>
          {tiny && <p className="font-mono text-[9px] text-cosmos-cyan">{px < 0.5 ? '< 1 px' : `${sig(px * 2, 2)} px`} wide · ring is a marker</p>}
        </div>
      </Html>
    </group>
  );
};

const Stage: React.FC<{ bodies: ScaleBody[]; spin: boolean; segments: number }> = ({ bodies, spin, segments }) => {
  const { size } = useThree();
  const { laid, width, maxD } = useMemo(() => layout(bodies), [bodies]);
  // Fit the row into the viewport (orthographic: zoom = pixels per world unit).
  const zoom = Math.min((size.width * 0.86) / width, (size.height * 0.62) / maxD);
  const baseline = -(maxD / 2) - 40 / zoom;
  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 5000]} zoom={zoom} near={0.1} far={20000} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-3000, 1500, 4000]} intensity={2.4} />
      {laid.map((l) => (
        <Sphere key={l.body.id} l={l} segments={segments} spin={spin} baseline={baseline} pxPerUnit={zoom} />
      ))}
    </>
  );
};

const ScaleComparison: React.FC = () => {
  const { reducedMotion, profile } = useLabEnv();
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTION);
  const segments = Math.max(32, Math.round(80 * profile.geometryDetail));
  const bodies = useMemo(() => SCALE_BODIES.filter((b) => selected.includes(b.id)), [selected]);
  const sorted = [...bodies].sort((a, b) => b.diameterKm - a.diameterKm);
  const largest = sorted[0];

  const toggle = (id: string) =>
    setSelected((cur) => {
      if (cur.includes(id)) return cur.length > MIN ? cur.filter((x) => x !== id) : cur;
      return cur.length < MAX ? [...cur, id] : cur;
    });

  const rows = sorted.map((b) => ({
    label: b.name,
    value: b === largest ? '1 : 1' : `${sig(largest.diameterKm / b.diameterKm)} : 1`,
    note: `${sig(b.diameterKm / EARTH_DIAMETER_KM)} × Earth · ${b === largest ? 'reference' : `${sig(Math.pow(largest.diameterKm / b.diameterKm, 3))} fit inside ${largest.name}`}`,
  }));

  return (
    <ToolLayout
      kicker="Tool 03 · Planetary Scale"
      title="Side by side, true to size"
      intro={`Choose ${MIN}–${MAX} bodies. They are drawn at their real diameter ratio, largest on the left, so pairing the Sun with the Moon shows just how lopsided the Solar System is.`}
      onReset={() => setSelected(DEFAULT_SELECTION)}
      stage={
        <LabCanvas label={`True-scale comparison of ${sorted.map((b) => b.name).join(', ')}`} camera={{ position: [0, 0, 5000] }}>
          <color attach="background" args={['#03040A']} />
          <Stage bodies={bodies} spin={!reducedMotion} segments={segments} />
        </LabCanvas>
      }
      overlay={
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="cyan">True diameter ratio</Badge>
          <Badge tone="muted">Spacing not to scale</Badge>
        </div>
      }
      controls={
        <div>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cosmos-muted" id="scale-pick-label">
            Bodies · {selected.length} of {MAX}
          </p>
          <div role="group" aria-labelledby="scale-pick-label" className="grid grid-cols-3 gap-1.5">
            {SCALE_BODIES.map((b) => {
              const on = selected.includes(b.id);
              const blocked = (!on && selected.length >= MAX) || (on && selected.length <= MIN);
              return (
                <SmallButton
                  key={b.id}
                  active={on}
                  aria-pressed={on}
                  aria-disabled={blocked}
                  title={blocked ? (on ? `Keep at least ${MIN}` : `Up to ${MAX} at once`) : undefined}
                  onClick={() => toggle(b.id)}
                  className={cx(blocked && 'opacity-50')}
                >
                  {b.name}
                </SmallButton>
              );
            })}
          </div>
        </div>
      }
      readout={
        <>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-muted">Diameter ratio vs {largest.name}</p>
          <ReadoutGrid rows={rows} />
        </>
      }
      explanation={
        <>
          <p>
            Diameter ratios grow into enormous volume ratios: volume scales with the cube, so a body 11× wider holds about 1,300× the volume. The “fit
            inside” figure is that cube; it ignores the gaps real spheres would leave when packed.
          </p>
          <p>
            The Sun is about 109 Earths across, and Jupiter about 11. Next to the Sun, the Moon and Pluto shrink below a single pixel; a cyan ring marks
            where they are. Planet diameters are equatorial values, so the flattened gas giants look a little rounder here than in reality.
          </p>
        </>
      }
      sources={[
        { name: 'NASA NSSDCA Planetary Fact Sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', note: 'Planet equatorial diameters' },
        { name: NSSDC_SUMMARY_SOURCE.name, url: NSSDC_SUMMARY_SOURCE.url, note: 'Moon 3,475 km, Pluto 2,376 km' },
        { name: 'NASA NSSDCA Sun Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', note: 'Sun 1,391,400 km (2 × volumetric mean radius)' },
      ]}
    />
  );
};

export default ScaleComparison;
