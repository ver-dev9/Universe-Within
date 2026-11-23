import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPECTRAL_SOURCE, STAR_PRESETS, SUN_LUMINOSITY_W, SUN_RADIUS_KM, SUN_TEFF_K } from '../../data/labData';
import { getSoftSprite } from '../../utils/softSprite';
import { LabCanvas } from '../shared/LabCanvas';
import { Starfield } from '../shared/Starfield';
import { useLabEnv } from '../shared/useLabEnv';
import { Badge, ChoiceGroup, ReadoutGrid, Slider, ToolLayout } from '../shared/LabUI';
import { blackbodyColor, luminositySolar, spectralClassFor, wienPeakNm } from '../shared/physics';
import { sci, sig, words } from '../shared/format';

/* Slider ranges. Temperature is linear; radius is logarithmic (0.005–1,000 R☉). */
const T_MIN = 2400;
const T_MAX = 40000;
const LOGR_MIN = -2.3;
const LOGR_MAX = 3;

type ScaleMode = 'log' | 'true';

interface Settings {
  presetId: string | null;
  temperatureK: number;
  logR: number;
  scale: ScaleMode;
}

const fromPreset = (id: string): Settings => {
  const p = STAR_PRESETS.find((s) => s.id === id)!;
  return { presetId: id, temperatureK: p.temperatureK, logR: Math.log10(p.radiusSolar), scale: 'log' };
};
const DEFAULTS = fromPreset('sun');

/** Display radius (scene units) for the star in log mode. */
const logDisplay = (logR: number) => 0.35 + 0.42 * (logR - LOGR_MIN);

/* ───────────── 3D ───────────── */

const starVertex = /* glsl */ `
varying vec3 vNormalV;
varying vec3 vPos;
void main() {
  vNormalV = normalize(normalMatrix * normal);
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const starFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uGran;
varying vec3 vNormalV;
varying vec3 vPos;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
void main() {
  float mu = clamp(dot(normalize(vNormalV), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
  // Linear limb-darkening law, u ≈ 0.6 (solar visible light)
  float limb = 1.0 - 0.6 * (1.0 - mu);
  vec3 p = normalize(vPos) * uGran;
  float n = noise(p + uTime * 0.15) * 0.6 + noise(p * 2.3 - uTime * 0.1) * 0.4;
  float gran = 0.86 + 0.24 * n;
  gl_FragColor = vec4(uColor * limb * gran * 1.05, 1.0);
  #include <colorspace_fragment>
}
`;

const Star: React.FC<{ radius: number; color: THREE.Color; reducedMotion: boolean; segments: number }> = ({ radius, color, reducedMotion, segments }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color() }, uTime: { value: 0 }, uGran: { value: 7 } },
        vertexShader: starVertex,
        fragmentShader: starFragment,
        toneMapped: false,
      }),
    [],
  );
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: getSoftSprite(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55, toneMapped: false }),
    [],
  );
  useEffect(
    () => () => {
      mat.dispose();
      glowMat.dispose();
    },
    [mat, glowMat],
  );
  mat.uniforms.uColor.value.copy(color);
  glowMat.color.copy(color);
  const spin = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (reducedMotion) return;
    mat.uniforms.uTime.value += Math.min(d, 0.1);
    if (spin.current) spin.current.rotation.y += d * 0.05;
  });
  return (
    <group>
      <sprite material={glowMat} scale={[radius * 3.4, radius * 3.4, 1]} />
      <mesh ref={spin} scale={radius} material={mat}>
        <sphereGeometry args={[1, segments, segments]} />
      </mesh>
    </group>
  );
};

/** Dashed outline of the Sun at the same scale, for reference. */
const SunOutline: React.FC<{ radius: number }> = ({ radius }) => {
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color: '#E7B86B', dashSize: 0.05, gapSize: 0.04, transparent: true, opacity: 0.9 });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, []);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  return <primitive object={line} scale={[radius, radius, 1]} position={[0, 0, 3]} />;
};

/* ───────────── Spectrum plot ───────────── */

const planckRel = (lambdaNm: number, T: number) => {
  const l = lambdaNm * 1e-9;
  return 1 / (Math.pow(l, 5) * (Math.exp(0.014387769 / (l * T)) - 1));
};

const Spectrum: React.FC<{ T: number }> = ({ T }) => {
  const W = 320;
  const H = 96;
  const L0 = 100;
  const L1 = 2500;
  const x = (l: number) => ((l - L0) / (L1 - L0)) * W;
  const peak = wienPeakNm(T);
  const samples = useMemo(() => {
    const pts: [number, number][] = [];
    let max = 0;
    for (let l = L0; l <= L1; l += 10) {
      const v = planckRel(l, T);
      max = Math.max(max, v);
      pts.push([l, v]);
    }
    return pts.map(([l, v]) => `${x(l).toFixed(1)},${(H - (v / max) * (H - 8)).toFixed(1)}`).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T]);
  return (
    <figure className="mt-1">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full" role="img" aria-label={`Blackbody spectrum at ${Math.round(T)} kelvin, peaking at ${Math.round(peak)} nanometres`}>
        <defs>
          <linearGradient id="vis-band" x1="0" x2="1">
            <stop offset="0" stopColor="#7a00ff" />
            <stop offset="0.2" stopColor="#2f6bff" />
            <stop offset="0.4" stopColor="#00d4a8" />
            <stop offset="0.55" stopColor="#ffe14d" />
            <stop offset="0.75" stopColor="#ff8a00" />
            <stop offset="1" stopColor="#ff1d1d" />
          </linearGradient>
        </defs>
        <rect x={x(380)} y={0} width={x(750) - x(380)} height={H} fill="url(#vis-band)" opacity={0.18} />
        <polyline points={samples} fill="none" stroke="#EEF2FA" strokeWidth={1.5} />
        {peak <= L1 && <line x1={x(peak)} x2={x(peak)} y1={0} y2={H} stroke="#69D9EF" strokeDasharray="3 3" />}
        <line x1={0} x2={W} y1={H} y2={H} stroke="#929CAF" strokeOpacity={0.4} />
        {[500, 1000, 1500, 2000, 2500].map((l) => (
          <text key={l} x={Math.min(x(l), W - 14)} y={H + 11} fontSize={8} fill="#929CAF" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
            {l}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cosmos-muted">
        Planck curve, normalised · wavelength nm · <span className="text-cosmos-cyan">dashed = Wien peak</span> · tinted = visible
      </figcaption>
    </figure>
  );
};

const band = (nm: number) => (nm < 380 ? 'ultraviolet' : nm <= 750 ? 'visible' : 'infrared');

/* ───────────── Tool ───────────── */

const StellarExplorer: React.FC = () => {
  const { reducedMotion, profile } = useLabEnv();
  const [s, setS] = useState<Settings>(DEFAULTS);
  const T = s.temperatureK;
  const R = Math.pow(10, s.logR);
  const preset = s.presetId ? STAR_PRESETS.find((p) => p.id === s.presetId) : undefined;
  const color = useMemo(() => blackbodyColor(T), [T]);
  const hex = `#${color.clone().convertLinearToSRGB().getHexString()}`;
  const L = luminositySolar(R, T);
  const peak = wienPeakNm(T);
  const cls = spectralClassFor(T);
  const segments = Math.max(32, Math.round(72 * profile.geometryDetail));

  // Scene radii. Log mode: compressed so all six fit. True mode: largest of (star, Sun) fills the frame.
  const big = 1.55;
  const starR = s.scale === 'log' ? logDisplay(s.logR) : R >= 1 ? big : big * R;
  const sunR = s.scale === 'log' ? logDisplay(0) : R >= 1 ? big / R : big;
  const sunTooSmall = s.scale === 'true' && sunR < 0.006;
  const starTooSmall = s.scale === 'true' && starR < 0.006;

  const set = (patch: Partial<Settings>) => setS((p) => ({ ...p, ...patch }));

  return (
    <ToolLayout
      kicker="Tool 04 · Stellar Explorer"
      title={preset ? preset.name : 'Your custom star'}
      intro="Pick a real star or dial in your own. Temperature sets the colour and where the spectrum peaks; temperature and radius together set how much power the star pours out."
      onReset={() => setS(DEFAULTS)}
      stage={
        <LabCanvas label={`Star with surface temperature ${Math.round(T)} K and radius ${sig(R)} solar radii, shown next to an outline of the Sun`} camera={{ position: [0, 0, 6], fov: 40 }}>
          <color attach="background" args={['#03040A']} />
          <Starfield fraction={0.25} />
          {!starTooSmall && <Star radius={starR} color={color} reducedMotion={reducedMotion} segments={segments} />}
          {s.presetId !== 'sun' && !sunTooSmall && <SunOutline radius={sunR} />}
        </LabCanvas>
      }
      overlay={
        <>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge tone={s.scale === 'true' ? 'cyan' : 'gold'}>{s.scale === 'true' ? 'True size ratio' : 'Size: logarithmic scale'}</Badge>
            {s.presetId !== 'sun' && <Badge tone="muted">Dashed gold = Sun</Badge>}
          </div>
          {(sunTooSmall || starTooSmall) && (
            <p className="absolute bottom-3 left-3 max-w-xs rounded-lg border border-white/10 bg-cosmos-void/70 px-3 py-2 text-xs text-cosmos-muted backdrop-blur-sm">
              {sunTooSmall
                ? `At this ratio the Sun would be ${sig(sunR * 2 * 100, 2)}% of the frame: far below one pixel.`
                : `This star would be ${sig(starR * 2 * 100, 2)}% of the frame next to the Sun: below one pixel.`}
            </p>
          )}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-white/10 bg-cosmos-void/70 px-3 py-2 backdrop-blur-sm">
            <span aria-hidden className="h-4 w-4 rounded-full" style={{ background: hex, boxShadow: `0 0 12px ${hex}` }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cosmos-white">
              {cls.letter}-type · {cls.colour}
            </span>
          </div>
        </>
      }
      controls={
        <>
          <ChoiceGroup
            label="Star"
            columns="grid-cols-2"
            options={STAR_PRESETS.map((p) => ({ id: p.id, label: p.estimate ? `${p.name} ≈` : p.name }))}
            value={s.presetId ?? ''}
            onChange={(id) => setS((p) => ({ ...fromPreset(id), scale: p.scale }))}
          />
          <Slider
            label="Surface temperature"
            min={T_MIN}
            max={T_MAX}
            step={10}
            value={T}
            onChange={(v) => set({ temperatureK: v, presetId: null })}
            valueText={`${Math.round(T).toLocaleString('en-US')} K`}
            hint={`Wien peak ${sig(peak)} nm (${band(peak)}).`}
          />
          <Slider
            label="Radius (log scale)"
            min={LOGR_MIN}
            max={LOGR_MAX}
            step={0.005}
            value={s.logR}
            onChange={(v) => set({ logR: v, presetId: null })}
            valueText={`${sig(R)} R☉`}
            hint={`${words(R * SUN_RADIUS_KM)} km`}
          />
          <ChoiceGroup
            label="Size display"
            columns="grid-cols-2"
            options={[
              { id: 'log', label: 'Logarithmic (all fit)' },
              { id: 'true', label: 'True ratio vs Sun' },
            ]}
            value={s.scale}
            onChange={(id) => set({ scale: id as ScaleMode })}
          />
        </>
      }
      readout={
        <>
          <ReadoutGrid
            rows={[
              { label: 'Luminosity', value: `${L >= 1e4 ? words(L) : sig(L)} L☉`, note: `${sci(L * SUN_LUMINOSITY_W)} W · L = R² × (T / ${SUN_TEFF_K} K)⁴` },
              ...(preset?.quotedLuminosity ? [{ label: 'Published', value: `${preset.quotedLuminosity} L☉`, note: 'for comparison' }] : []),
              { label: 'Wien peak', value: `${sig(peak)} nm`, note: `λ = b / T, ${band(peak)}` },
              { label: 'Class', value: `${cls.letter} · ${cls.colour}`, note: `e.g. ${cls.examples}` },
              ...(preset ? [{ label: 'Type', value: preset.spectralType }] : []),
            ]}
          />
          <Spectrum T={T} />
        </>
      }
      explanation={
        <>
          {preset && <p className="text-cosmos-white/85">{preset.note}</p>}
          <p>
            <strong className="text-cosmos-white">Wien’s law</strong> (λ<sub>peak</sub> = 2.898 × 10⁻³ m·K / T): hotter stars peak at shorter wavelengths.
            The Sun peaks near 500 nm, in the visible; Betelgeuse peaks in the infrared and looks orange-red; Rigel and Sirius B peak in the
            ultraviolet and look blue-white. The swatch is the blackbody colour computed from the Planck curve and the CIE colour-matching functions.
          </p>
          <p>
            <strong className="text-cosmos-white">Stefan–Boltzmann law</strong> (L = 4πR²σT⁴, or L ∝ R²T⁴ in solar units): doubling the temperature
            multiplies the output 16 times; a star 764 times wider than the Sun, even at 3,600 K, shines tens of thousands of times brighter. Real
            stars are not perfect blackbodies, so computed and published luminosities can differ, especially for cool, dusty supergiants.
          </p>
          <p>Values marked ≈ are estimates whose published uncertainties are large.</p>
        </>
      }
      sources={[
        ...STAR_PRESETS.map((p) => ({ name: `${p.name}: ${p.source.name}`, url: p.source.url })),
        { name: SPECTRAL_SOURCE.name, url: SPECTRAL_SOURCE.url, note: 'Spectral classes and temperature ranges' },
        { name: 'OpenStax Astronomy 2e, §5.2 (Wien’s and Stefan–Boltzmann laws)', url: 'https://openstax.org/books/astronomy-2e/pages/5-2-the-electromagnetic-spectrum' },
      ]}
    />
  );
};

export default StellarExplorer;
