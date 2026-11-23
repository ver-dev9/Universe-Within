import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { mulberry32 } from '../sun/random';
import { getSoftSprite } from '../../utils/softSprite';

/**
 * Procedural cosmic web (artistic): nodes (clusters) joined by filaments,
 * with particles concentrated along filaments and in nodes and sparse in the
 * voids between. Two nested webs (local and large-scale) plus a Local Group
 * blob let one camera zoom read as four scales. The zoom is logarithmic.
 */

export interface WebBudget {
  macroParticles: number;
  microParticles: number;
  nodes: number;
  lineNeighbors: number;
}

interface CosmicWebSceneProps {
  scrub: MutableRefObject<{ progress: number }>;
  budget: WebBudget;
  reducedMotion: boolean;
}

/** Camera distance at each stage, scene units (log-spaced, not to scale). */
const STAGE_DIST = [2.6, 15, 58, 270];
export const STAGE_COUNT = STAGE_DIST.length;
const LANIAKEA_CENTER = new THREE.Vector3(11, -3, 7);
const LANIAKEA_R = 31;
const UNIVERSE_R = 132;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Log-space camera distance for scroll progress, with a hold at each stage. */
export function distanceForProgress(p: number) {
  const f = Math.min(STAGE_COUNT - 1, Math.max(0, p * STAGE_COUNT - 0.5));
  const i = Math.min(STAGE_COUNT - 2, Math.floor(f));
  const t = smooth(0.2, 0.8, f - i);
  const a = Math.log(STAGE_DIST[i]);
  const b = Math.log(STAGE_DIST[i + 1]);
  return Math.exp(a + (b - a) * t);
}

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uScale;
  uniform float uNear;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = -mv.z;
    vColor = aColor;
    vFade = smoothstep(uNear * 0.35, uNear, depth);
    gl_PointSize = clamp(aSize * uScale / max(depth, 0.001), 0.0, 28.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float a = tex.a * uOpacity * vFade;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

function makePointsMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: {
      uMap: { value: getSoftSprite() },
      uScale: { value: 300 },
      uOpacity: { value: 1 },
      uNear: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

interface WebGeometry {
  points: THREE.BufferGeometry;
  lines: THREE.BufferGeometry;
}

const COL = {
  filament: new THREE.Color('#3478D4'),
  filamentHot: new THREE.Color('#69D9EF'),
  violet: new THREE.Color('#8A5BCA'),
  node: new THREE.Color('#E7B86B'),
  white: new THREE.Color('#EEF2FA'),
  void: new THREE.Color('#283a66'),
  laniakea: new THREE.Color('#69D9EF'),
};

function gaussian(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Build one web: nodes in a sphere, k-nearest filaments, particles along them. */
function buildWeb(opts: {
  seed: number;
  radius: number;
  nodes: number;
  neighbors: number;
  particles: number;
  sizeBase: number;
  scatter: number;
  tint?: (p: THREE.Vector3, c: THREE.Color) => void;
}): WebGeometry {
  const rand = mulberry32(opts.seed);
  const nodes: THREE.Vector3[] = [];
  const mass: number[] = [];
  while (nodes.length < opts.nodes) {
    const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    if (v.lengthSq() > 1) continue;
    nodes.push(v.multiplyScalar(opts.radius));
    mass.push(0.4 + rand() ** 3 * 1.8);
  }
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: n.distanceToSquared(m) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, opts.neighbors);
    near.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    });
  });
  const lengths = edges.map(([a, b]) => nodes[a].distanceTo(nodes[b]));
  const total = lengths.reduce((s, l) => s + l, 0);
  const cumulative: number[] = [];
  lengths.reduce((s, l, i) => ((cumulative[i] = s + l), s + l), 0);

  const n = opts.particles;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const massTotal = mass.reduce((s, m) => s + m, 0);

  for (let i = 0; i < n; i++) {
    const r = rand();
    if (r < 0.66) {
      // Filament particle: pick an edge by length, scatter tightly around it.
      const target = rand() * total;
      let lo = 0;
      let hi = cumulative.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cumulative[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      const [a, b] = edges[lo];
      const t = rand();
      p.copy(nodes[a]).lerp(nodes[b], t);
      // Slight sag so filaments are not ruler-straight.
      const sag = Math.sin(t * Math.PI) * opts.scatter * 1.6;
      p.x += gaussian(rand) * opts.scatter + sag * 0.5;
      p.y += gaussian(rand) * opts.scatter - sag * 0.3;
      p.z += gaussian(rand) * opts.scatter;
      const heat = Math.pow(1 - Math.abs(t - 0.5) * 2, 0.4);
      c.copy(COL.filament).lerp(COL.violet, rand() * 0.55).lerp(COL.filamentHot, (1 - heat) * 0.45);
      size[i] = opts.sizeBase * (0.6 + rand() * 0.8);
    } else if (r < 0.92) {
      // Node (cluster) particle, weighted by node mass.
      let pick = rand() * massTotal;
      let k = 0;
      while (pick > mass[k] && k < mass.length - 1) pick -= mass[k++];
      const spread = opts.scatter * 2.4 * mass[k];
      p.copy(nodes[k]);
      p.x += gaussian(rand) * spread;
      p.y += gaussian(rand) * spread;
      p.z += gaussian(rand) * spread;
      c.copy(COL.node).lerp(COL.white, rand() * 0.6);
      size[i] = opts.sizeBase * (0.8 + rand() * 1.3);
    } else {
      // Sparse void population.
      p.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).multiplyScalar(opts.radius * 1.05);
      c.copy(COL.void);
      size[i] = opts.sizeBase * 0.6;
    }
    opts.tint?.(p, c);
    pos[i * 3] = p.x;
    pos[i * 3 + 1] = p.y;
    pos[i * 3 + 2] = p.z;
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }

  const points = new THREE.BufferGeometry();
  points.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  points.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  points.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

  const linePos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], i) => {
    linePos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], i * 6);
  });
  const lines = new THREE.BufferGeometry();
  lines.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  return { points, lines };
}

function buildLocalGroup(): THREE.BufferGeometry {
  const rand = mulberry32(77);
  const n = 70;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const c = new THREE.Color();
  // Two dominant spirals: Milky Way at the origin and Andromeda offset.
  const centers = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.62, 0.12, -0.18)];
  for (let i = 0; i < n; i++) {
    let x: number;
    let y: number;
    let z: number;
    let s: number;
    if (i < 2) {
      ({ x, y, z } = centers[i]);
      s = i === 0 ? 0.55 : 0.62;
      c.set('#EEF2FA');
    } else {
      const host = centers[rand() < 0.5 ? 0 : 1];
      const r = 0.08 + rand() * 0.45;
      const v = new THREE.Vector3(gaussian(rand), gaussian(rand) * 0.7, gaussian(rand)).normalize().multiplyScalar(r);
      x = host.x + v.x;
      y = host.y + v.y;
      z = host.z + v.z;
      s = 0.07 + rand() * 0.08;
      c.set(rand() < 0.5 ? '#69D9EF' : '#E7B86B');
    }
    pos.set([x, y, z], i * 3);
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = s;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  return g;
}

const shellVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const shellFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float rim = pow(1.0 - abs(dot(vN, vV)), 2.6);
    float a = rim * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

function makeShell(color: string) {
  return new THREE.ShaderMaterial({
    vertexShader: shellVertex,
    fragmentShader: shellFragment,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

export function CosmicWebScene({ scrub, budget, reducedMotion }: CosmicWebSceneProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const group = useRef<THREE.Group>(null);

  const macro = useMemo(
    () =>
      buildWeb({
        seed: 2014,
        radius: 125,
        nodes: budget.nodes,
        neighbors: budget.lineNeighbors,
        particles: budget.macroParticles,
        sizeBase: 1.6,
        scatter: 1.5,
      }),
    [budget.nodes, budget.lineNeighbors, budget.macroParticles],
  );

  const micro = useMemo(
    () =>
      buildWeb({
        seed: 1953,
        radius: 12,
        nodes: Math.round(budget.nodes * 0.5),
        neighbors: budget.lineNeighbors,
        particles: budget.microParticles,
        sizeBase: 0.16,
        scatter: 0.17,
      }),
    [budget.nodes, budget.lineNeighbors, budget.microParticles],
  );

  // Laniakea highlight: copy of the macro points that fall inside the basin, recoloured cyan.
  const laniakea = useMemo(() => {
    const src = macro.points.getAttribute('position') as THREE.BufferAttribute;
    const srcSize = macro.points.getAttribute('aSize') as THREE.BufferAttribute;
    const keep: number[] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < src.count; i++) {
      v.fromBufferAttribute(src, i);
      // Irregular basin: radius modulated by direction.
      const dir = v.clone().sub(LANIAKEA_CENTER);
      const wobble = 1 + 0.22 * Math.sin(dir.x * 0.09) * Math.cos(dir.y * 0.11) + 0.12 * Math.sin(dir.z * 0.13);
      if (dir.length() < LANIAKEA_R * wobble) keep.push(i);
    }
    const pos = new Float32Array(keep.length * 3);
    const col = new Float32Array(keep.length * 3);
    const sz = new Float32Array(keep.length);
    const c = new THREE.Color();
    keep.forEach((idx, j) => {
      pos[j * 3] = src.getX(idx);
      pos[j * 3 + 1] = src.getY(idx);
      pos[j * 3 + 2] = src.getZ(idx);
      c.copy(COL.laniakea).lerp(COL.white, (idx % 7) / 14);
      col.set([c.r, c.g, c.b], j * 3);
      sz[j] = srcSize.getX(idx) * 1.05;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    return g;
  }, [macro]);

  const localGroup = useMemo(() => buildLocalGroup(), []);

  const mats = useMemo(
    () => ({
      macro: makePointsMaterial(),
      micro: makePointsMaterial(),
      laniakea: makePointsMaterial(),
      local: makePointsMaterial(),
      macroLines: new THREE.LineBasicMaterial({ color: '#3478D4', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      microLines: new THREE.LineBasicMaterial({ color: '#69D9EF', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      shell: makeShell('#E7B86B'),
      shellInner: makeShell('#8A5BCA'),
      marker: new THREE.MeshBasicMaterial({ color: '#69D9EF', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    }),
    [],
  );

  const shellGeo = useMemo(() => new THREE.SphereGeometry(UNIVERSE_R, 64, 32), []);
  const markerGeo = useMemo(() => new THREE.RingGeometry(0.16, 0.19, 64), []);

  // Dispose everything we created when the scene unmounts or budgets change.
  useEffect(
    () => () => {
      macro.points.dispose();
      macro.lines.dispose();
    },
    [macro],
  );
  useEffect(
    () => () => {
      micro.points.dispose();
      micro.lines.dispose();
    },
    [micro],
  );
  useEffect(() => () => laniakea.dispose(), [laniakea]);
  useEffect(
    () => () => {
      localGroup.dispose();
      shellGeo.dispose();
      markerGeo.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    },
    [localGroup, shellGeo, markerGeo, mats],
  );

  const dir = useMemo(() => new THREE.Vector3(0.42, 0.3, 1).normalize(), []);
  const marker = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const p = scrub.current.progress;
    const d = distanceForProgress(p);
    camera.position.copy(dir).multiplyScalar(d);
    camera.lookAt(0, 0, 0);
    (camera as THREE.PerspectiveCamera).far = Math.max(400, d * 3);
    camera.updateProjectionMatrix();

    if (group.current && !reducedMotion) group.current.rotation.y += delta * 0.015;

    const scale = (size.height * dpr) / 2.2;
    const near = d * 0.35;
    for (const m of [mats.macro, mats.micro, mats.laniakea, mats.local]) {
      m.uniforms.uScale.value = scale;
      m.uniforms.uNear.value = near;
    }
    const L = Math.log(d);
    // Local Group: only at the closest scale.
    mats.local.uniforms.uOpacity.value = 1 - smooth(Math.log(6), Math.log(14), L);
    // Local web: from the Local Group out to Laniakea.
    mats.micro.uniforms.uOpacity.value = (0.55 + 0.45 * smooth(Math.log(3), Math.log(10), L)) * (1 - smooth(Math.log(60), Math.log(140), L));
    mats.microLines.opacity = 0.16 * smooth(Math.log(5), Math.log(14), L) * (1 - smooth(Math.log(30), Math.log(70), L));
    // Large-scale web.
    const macroIn = smooth(Math.log(16), Math.log(45), L);
    mats.macro.uniforms.uOpacity.value = macroIn * 0.9;
    mats.macroLines.opacity = 0.1 * smooth(Math.log(40), Math.log(150), L);
    // Laniakea highlight peaks at its stage.
    mats.laniakea.uniforms.uOpacity.value = smooth(Math.log(25), Math.log(55), L) * (1 - smooth(Math.log(110), Math.log(220), L)) * 0.9;
    // Observable-universe horizon.
    mats.shell.uniforms.uOpacity.value = smooth(Math.log(120), Math.log(250), L) * 0.85;
    mats.shellInner.uniforms.uOpacity.value = smooth(Math.log(120), Math.log(250), L) * 0.35;
    // "You are here" marker.
    mats.marker.opacity = 0.8 * (1 - smooth(Math.log(8), Math.log(20), L));
    if (marker.current) {
      marker.current.quaternion.copy(camera.quaternion);
      marker.current.scale.setScalar(Math.max(1, d / 2.6));
    }
  });

  return (
    <>
      <group ref={group}>
        <points geometry={macro.points} material={mats.macro} frustumCulled={false} />
        <lineSegments geometry={macro.lines} material={mats.macroLines} frustumCulled={false} />
        <points geometry={laniakea} material={mats.laniakea} frustumCulled={false} />
        <points geometry={micro.points} material={mats.micro} frustumCulled={false} />
        <lineSegments geometry={micro.lines} material={mats.microLines} frustumCulled={false} />
      </group>
      <points geometry={localGroup} material={mats.local} frustumCulled={false} />
      <mesh ref={marker} geometry={markerGeo} material={mats.marker} />
      <mesh geometry={shellGeo} material={mats.shell} />
      <mesh geometry={shellGeo} material={mats.shellInner} scale={0.985} />
    </>
  );
}

export default CosmicWebScene;
