import React, { useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AU_M, BLACK_HOLE_PRESETS, C_M_S, SUN_RADIUS_KM } from '../../data/labData';
import { EARTH_DIAMETER_KM } from '../../data/planetsData';
import { LabCanvas } from '../shared/LabCanvas';
import { useLabEnv } from '../shared/useLabEnv';
import { Badge, ChoiceGroup, ReadoutGrid, Slider, Toggle, ToolLayout } from '../shared/LabUI';
import { blackbodyColor, schwarzschildRadiusM } from '../shared/physics';
import { sci, sig, words } from '../shared/format';
import type { QualityLevel } from '../../utils/quality';

interface Settings {
  presetId: string | null;
  logMass: number;
  inclination: number;
  diskTempK: number;
  brightness: number;
  lensing: number;
  doppler: boolean;
}

const DEFAULTS: Settings = { presetId: 'sgr-a', logMass: Math.log10(4.0e6), inclination: 80, diskTempK: 4500, brightness: 1, lensing: 1, doppler: true };
const LOGM_MIN = 0.5;
const LOGM_MAX = 10.5;

/* ───────────── Shader ───────────── */

const STEPS: Record<QualityLevel, number> = { low: 110, medium: 170, high: 260 };
const DPR_CAP: Record<QualityLevel, number> = { low: 0.75, medium: 1, high: 1.5 };

/** 1D blackbody colour lookup, 1,000 K → 60,000 K on a log axis (linear RGB). */
function makeBlackbodyLut() {
  const N = 256;
  const data = new Uint8Array(N * 4);
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const T = Math.pow(10, 3 + (i / (N - 1)) * Math.log10(60));
    blackbodyColor(T, c);
    data.set([c.r * 255, c.g * 255, c.b * 255, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/*
 * Units: Schwarzschild radius r_s = 1. Rays are traced backwards from the
 * camera with the well-known Newtonian form of the Schwarzschild null
 * geodesic: a = −(3/2) h² r̂ / r⁴ (h = |r × v|), which reproduces the photon
 * sphere at 1.5 r_s and the shadow edge at √27/2 r_s. uLens scales that
 * acceleration (0 = straight lines). Thin disk from the ISCO (3 r_s) to 14 r_s
 * with a Novikov–Thorne-like T(r) profile, Doppler beaming and gravitational
 * redshift. Educational approximation: no Kerr spin, no radiative transfer.
 */
const fragment = /* glsl */ `
precision highp float;
#define MAX_STEPS STEPS_PLACEHOLDER
uniform vec2 uRes;
uniform float uTime;
uniform float uIncl;
uniform float uLens;
uniform float uBright;
uniform float uTpeak;
uniform float uDoppler;
uniform sampler2D uLut;
varying vec2 vUv;

const float R_IN = 3.0;
const float R_OUT = 14.0;
const float CAM_D = 36.0;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

vec3 blackbody(float T) {
  float u = clamp((log(T) / log(10.0) - 3.0) / (log(60.0) / log(10.0)), 0.0, 1.0);
  return texture2D(uLut, vec2(u, 0.5)).rgb;
}

vec3 sky(vec3 d) {
  // Procedural star field sampled by final ray direction, so lensing distorts it.
  vec2 sph = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
  vec2 g = sph * vec2(90.0, 90.0);
  vec2 cell = floor(g);
  float h = hash(cell);
  vec2 off = fract(g) - 0.5 - (vec2(hash(cell + 1.3), hash(cell + 7.1)) - 0.5) * 0.6;
  float star = step(0.97, h) * smoothstep(0.09, 0.0, length(off));
  vec3 tint = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.85, 0.65), hash(cell + 3.7));
  float band = exp(-pow(d.y * 6.0 + 0.4 * d.x, 2.0)) * 0.004;
  return tint * star * (0.5 + h) + vec3(0.32, 0.36, 0.55) * band;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float ci = cos(uIncl), si = sin(uIncl);
  vec3 cam = CAM_D * vec3(0.0, ci, si);
  vec3 fwd = -normalize(cam);
  vec3 right = vec3(1.0, 0.0, 0.0);
  vec3 up = cross(right, fwd);
  vec3 dir = normalize(fwd * 2.3 + right * p.x + up * p.y);

  vec3 pos = cam;
  vec3 vel = dir;
  vec3 h3 = cross(pos, vel);
  float h2 = dot(h3, h3);
  vec3 col = vec3(0.0);
  bool done = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = length(pos);
    if (r < 1.0) { done = true; break; }                       // crossed the event horizon
    if (r > 70.0 && dot(pos, vel) > 0.0) break;                // escaped
    float dt = clamp(0.09 * r, 0.025, 1.6);
    vec3 acc = -1.5 * uLens * h2 * pos / pow(r, 5.0);
    vec3 prev = pos;
    vel += acc * dt;
    pos += vel * dt;
    if (prev.y * pos.y < 0.0) {
      float t = prev.y / (prev.y - pos.y);
      vec3 hit = mix(prev, pos, t);
      float rc = length(hit.xz);
      if (rc > R_IN && rc < R_OUT) {
        float x = rc / R_IN;
        float prof = pow(x, -0.75) * pow(max(1.0 - inversesqrt(x), 0.0), 0.25) / 0.4879;
        float T = uTpeak * prof;
        // Keplerian speed in units of c: β = sqrt(r_s / 2r)
        float beta = sqrt(0.5 / rc);
        vec3 vdir = normalize(vec3(-hit.z, 0.0, hit.x));
        float cosT = dot(vdir, -normalize(vel));
        float gamma = inversesqrt(1.0 - beta * beta);
        float g = mix(1.0, 1.0 / (gamma * (1.0 - beta * cosT)), uDoppler);
        g *= mix(1.0, sqrt(1.0 - 1.0 / rc), uDoppler);         // gravitational redshift
        float Tobs = T * g;
        float omega = beta / rc;
        float ang = atan(hit.z, hit.x);
        float turb = 0.65 + 0.55 * noise(vec2(ang * 6.0 - uTime * omega * 4.0, rc * 1.6))
                         * (0.6 + 0.4 * noise(vec2(ang * 17.0 - uTime * omega * 4.0, rc * 5.0)));
        float I = pow(prof, 4.0) * pow(g, 4.0) * turb * uBright;
        float edge = smoothstep(R_IN, R_IN + 0.4, rc) * smoothstep(R_OUT, R_OUT - 4.0, rc);
        col += blackbody(max(Tobs, 1000.0)) * I * edge * 0.75;
        done = true;
        break;
      }
    }
  }
  if (!done) col += sky(normalize(vel));
  col = vec3(1.0) - exp(-col * 1.2);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

const BlackHoleQuad: React.FC<{ s: Settings; reducedMotion: boolean; quality: QualityLevel }> = ({ s, reducedMotion, quality }) => {
  const gl = useThree((st) => st.gl);
  const lut = useMemo(makeBlackbodyLut, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment.replace('STEPS_PLACEHOLDER', String(STEPS[quality])),
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uIncl: { value: 0 },
          uLens: { value: 1 },
          uBright: { value: 1 },
          uTpeak: { value: 9000 },
          uDoppler: { value: 1 },
          uLut: { value: lut },
        },
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [quality, lut],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useEffect(() => () => lut.dispose(), [lut]);
  const size = useMemo(() => new THREE.Vector2(), []);

  useFrame((_, delta) => {
    gl.getDrawingBufferSize(size);
    const u = mat.uniforms;
    u.uRes.value.copy(size);
    if (!reducedMotion) u.uTime.value += Math.min(delta, 0.1);
    u.uIncl.value = THREE.MathUtils.degToRad(s.inclination);
    u.uLens.value = s.lensing;
    u.uBright.value = s.brightness;
    u.uTpeak.value = s.diskTempK;
    u.uDoppler.value = s.doppler ? 1 : 0;
  });

  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

/* ───────────── Tool ───────────── */

function compareRadius(km: number): string {
  const earthR = EARTH_DIAMETER_KM / 2;
  if (km < earthR) return `${sig(km)} km: smaller than Earth (${sig(km / earthR)} × its radius)`;
  if (km < SUN_RADIUS_KM) return `${sig(km / earthR)} × Earth’s radius`;
  if (km * 1000 < 0.1 * AU_M) return `${sig(km / SUN_RADIUS_KM)} × the Sun’s radius`;
  return `${sig((km * 1000) / AU_M)} au (Earth–Sun distances)`;
}

const BlackHoleExplorer: React.FC = () => {
  const { reducedMotion, quality, profile } = useLabEnv();
  const [s, setS] = useState<Settings>(DEFAULTS);
  const set = (patch: Partial<Settings>) => setS((p) => ({ ...p, ...patch }));
  const M = Math.pow(10, s.logMass);
  const rsM = schwarzschildRadiusM(M);
  const rsKm = rsM / 1000;
  const preset = s.presetId ? BLACK_HOLE_PRESETS.find((b) => b.id === s.presetId) : undefined;
  const dprMax = Math.min(profile.dpr[1], DPR_CAP[quality]);

  return (
    <ToolLayout
      kicker="Tool 05 · Black Hole Explorer"
      title={preset ? preset.name : `${words(M)} M☉ black hole`}
      intro="Choose a mass and the Schwarzschild radius is computed live. Then tilt the accretion disk, heat it up and dial gravity’s light-bending up or down to see what it does to the picture."
      onReset={() => setS(DEFAULTS)}
      stage={
        <LabCanvas
          label={`Ray-traced view of a black hole with an accretion disk tilted ${s.inclination} degrees, lensing strength ${Math.round(s.lensing * 100)} percent`}
          dpr={[Math.min(profile.dpr[0], dprMax), dprMax]}
          camera={{ position: [0, 0, 1] }}
        >
          <BlackHoleQuad s={s} reducedMotion={reducedMotion} quality={quality} />
        </LabCanvas>
      }
      overlay={
        <>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge>Educational approximation</Badge>
            <Badge tone="muted">Non-spinning · thin disk · not to any image</Badge>
          </div>
          <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-cosmos-void/70 px-4 py-2 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-muted">Schwarzschild radius r<sub>s</sub> = 2GM/c²</p>
            <p className="font-display text-2xl text-cosmos-white tabular-nums">{rsKm < 1e6 ? `${sig(rsKm)} km` : `${sci(rsKm)} km`}</p>
            <p className="text-xs text-cosmos-muted">The view is drawn in units of r<sub>s</sub>: disk spans 3–14 r<sub>s</sub>.</p>
          </div>
        </>
      }
      controls={
        <>
          <ChoiceGroup
            label="Preset"
            options={BLACK_HOLE_PRESETS.map((b) => ({ id: b.id, label: b.name }))}
            value={s.presetId ?? ''}
            onChange={(id) => set({ presetId: id, logMass: Math.log10(BLACK_HOLE_PRESETS.find((b) => b.id === id)!.massSolar) })}
          />
          <Slider
            label="Mass (log scale)"
            min={LOGM_MIN}
            max={LOGM_MAX}
            step={0.01}
            value={s.logMass}
            onChange={(v) => set({ logMass: v, presetId: null })}
            valueText={`${M < 1e4 ? sig(M) : words(M)} M☉`}
            hint={`r_s = ${sig(rsKm < 1e6 ? rsKm : rsKm / 1e6)} ${rsKm < 1e6 ? 'km' : 'million km'} · ${compareRadius(rsKm)}`}
          />
          <Slider
            label="Disk inclination"
            min={0}
            max={89}
            step={1}
            value={s.inclination}
            onChange={(v) => set({ inclination: v })}
            valueText={`${s.inclination}°${s.inclination < 15 ? ' · face-on' : s.inclination > 75 ? ' · near edge-on' : ''}`}
          />
          <Slider
            label="Peak disk temperature (illustrative)"
            min={2000}
            max={40000}
            step={100}
            value={s.diskTempK}
            onChange={(v) => set({ diskTempK: v })}
            valueText={`${Math.round(s.diskTempK).toLocaleString('en-US')} K`}
            hint="Sets the disk’s blackbody colour; real disks around supermassive holes peak in the UV, stellar ones in X-rays."
          />
          <Slider label="Disk brightness" min={0.2} max={3} step={0.05} value={s.brightness} onChange={(v) => set({ brightness: v })} valueText={`× ${s.brightness.toFixed(2)}`} />
          <Slider
            label="Lensing strength"
            min={0}
            max={1.5}
            step={0.01}
            value={s.lensing}
            onChange={(v) => set({ lensing: v })}
            valueText={s.lensing === 0 ? 'off (straight rays)' : `${Math.round(s.lensing * 100)}% of GR`}
            hint="100% = general relativity for a non-spinning hole. 0% shows what you would see if light travelled in straight lines."
          />
          <Toggle label="Doppler beaming & gravitational redshift" checked={s.doppler} onChange={(v) => set({ doppler: v })} />
        </>
      }
      readout={
        <ReadoutGrid
          rows={[
            { label: 'Mass', value: `${sci(M * 1.98840987e30)} kg`, note: `${M < 1e4 ? sig(M) : words(M)} solar masses` },
            { label: 'Event horizon', value: `${rsKm < 1e6 ? `${sig(rsKm)} km` : `${sci(rsKm)} km`}`, note: `${sig(rsM / AU_M)} au radius` },
            { label: 'Photon sphere', value: `${sig(1.5 * rsKm)} km`, note: '1.5 r_s: light can orbit here' },
            { label: 'Shadow radius', value: `${sig(2.598 * rsKm)} km`, note: '√27 / 2 ≈ 2.6 r_s, as seen from afar' },
            { label: 'Inner disk (ISCO)', value: `${sig(3 * rsKm)} km`, note: '3 r_s, last stable circular orbit' },
            { label: 'Light crosses r_s', value: rsM / C_M_S < 1 ? `${sig((rsM / C_M_S) * 1000)} ms` : rsM / C_M_S < 120 ? `${sig(rsM / C_M_S)} s` : rsM / C_M_S < 7200 ? `${sig(rsM / C_M_S / 60)} min` : `${sig(rsM / C_M_S / 3600)} h` },
          ]}
        />
      }
      explanation={
        <>
          {preset && <p className="text-cosmos-white/85">{preset.note}</p>}
          <p>
            <strong className="text-cosmos-white">The Schwarzschild radius</strong> r<sub>s</sub> = 2GM/c² is the size of the event horizon of a
            non-spinning black hole: about 2.95 km per solar mass. It grows in direct proportion to mass, so a hole a million times heavier is a
            million times wider, and the whole picture simply scales. That is why the view never changes with the mass slider; only the numbers do.
          </p>
          <p>
            <strong className="text-cosmos-white">Gravitational lensing</strong> bends light from the far side of the disk up over the top and down
            under the bottom, so you see the disk’s back even when it is behind the hole. Light skimming 1.5 r<sub>s</sub> can circle the hole,
            forming the thin bright photon ring around a shadow about 2.6 r<sub>s</sub> in radius. The side of the disk moving towards you looks
            brighter and bluer (Doppler beaming), a lopsidedness the Event Horizon Telescope also saw in M87*.
          </p>
          <p>
            This is an educational approximation: each pixel traces one light ray through a simplified Schwarzschild metric, with an illustrative
            disk. It ignores spin, the disk’s thickness and the detailed physics of hot plasma.
          </p>
        </>
      }
      sources={[
        { name: 'NASA Science — Black Holes', url: 'https://science.nasa.gov/universe/black-holes/', note: 'Event horizon, accretion disks, lensing' },
        { name: 'NASA Goddard — black hole visualization (J. Schnittman)', url: 'https://svs.gsfc.nasa.gov/13326', note: 'How lensing reshapes an accretion disk' },
        ...BLACK_HOLE_PRESETS.filter((b) => b.id !== 'stellar').map((b) => ({ name: `${b.name}: ${b.source.name}`, url: b.source.url })),
        { name: 'CODATA 2018 (G, c) via NIST', url: 'https://physics.nist.gov/cuu/Constants/', note: 'Constants in r_s = 2GM/c²' },
      ]}
    />
  );
};

export default BlackHoleExplorer;
