import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import {
  worldVertex,
  worldFragment,
  atmosphereRimVertex,
  atmosphereRimFragment,
  glowVertex,
  glowFragment,
  tailVertex,
  tailFragment,
} from '../../shaders/worldSurfaceShader';
import { WorldEntry } from '../../data/worldsData';
import { createRockGeometry } from './proceduralRock';
import { mulberry32, randomUnitVector } from '../sun/random';
import { BackdropStars } from './BackdropStars';

export const SUN_DIR = new THREE.Vector3(-0.75, 0.3, 0.6).normalize();
const SPACING = 8;
/** Hex → display (sRGB) values for raw ShaderMaterials, which write gl_FragColor without colour conversion. */
const displayColor = (hex: string) => new THREE.Color(hex).convertLinearToSRGB();
const STILL_TIME = 12;

interface SurfaceConfig {
  radius: number;
  low: string;
  high: string;
  accent: string;
  noiseScale: number;
  craterScale: number;
  craterDensity: number;
  craterStrength: number;
  iceCap?: number;
  clouds?: boolean;
  heart?: boolean;
  brightSpots?: number;
  atmosphere?: { color: string; power: number; strength: number };
  tilt?: number;
}

/** Visual parameters per world. Colours are artistic approximations of true colour. */
const SURFACES: Record<'mercury' | 'venus' | 'mars' | 'ceres' | 'pluto', SurfaceConfig> = {
  mercury: { radius: 0.85, low: '#4d4945', high: '#a39d95', accent: '#6f6658', noiseScale: 2.2, craterScale: 5, craterDensity: 0.75, craterStrength: 1.2 },
  venus: {
    radius: 1.25,
    low: '#b98a4a',
    high: '#f3dcaa',
    accent: '#d9b77a',
    noiseScale: 2,
    craterScale: 4,
    craterDensity: 0,
    craterStrength: 0,
    clouds: true,
    atmosphere: { color: '#ffd89a', power: 2.2, strength: 1.1 },
    tilt: 0.05,
  },
  mars: {
    radius: 1.0,
    low: '#6b2e19',
    high: '#c8683a',
    accent: '#8a4a2c',
    noiseScale: 2.4,
    craterScale: 4.5,
    craterDensity: 0.35,
    craterStrength: 0.7,
    iceCap: 0.88,
    atmosphere: { color: '#ff9d6b', power: 3.5, strength: 0.55 },
    tilt: 0.44,
  },
  ceres: { radius: 0.62, low: '#3d3b39', high: '#77726b', accent: '#5a5650', noiseScale: 2.6, craterScale: 6, craterDensity: 0.65, craterStrength: 1.0, brightSpots: 1 },
  pluto: { radius: 0.78, low: '#5a3a26', high: '#c9a27e', accent: '#8b5a3c', noiseScale: 2.0, craterScale: 5, craterDensity: 0.3, craterStrength: 0.6, heart: true, tilt: 0.3 },
};

/** Per-object camera framing: distance from the object and where to aim. */
const FRAMING: Record<WorldEntry['id'], { dist: number; aimOffset: [number, number, number] }> = {
  mercury: { dist: 3.4, aimOffset: [0, 0, 0] },
  venus: { dist: 4.6, aimOffset: [0, 0, 0] },
  mars: { dist: 3.8, aimOffset: [0, 0, 0] },
  ceres: { dist: 2.7, aimOffset: [0, 0, 0] },
  pluto: { dist: 3.1, aimOffset: [0, 0, 0] },
  asteroid: { dist: 6.2, aimOffset: [0, -0.3, 0] },
  comet: { dist: 7.5, aimOffset: [1.9, -0.5, -1.4] },
};

export const worldPosition = (index: number) => new THREE.Vector3(index * SPACING, 0, 0);

function useSceneTime(reducedMotion: boolean) {
  return (state: { clock: THREE.Clock }) => (reducedMotion ? STILL_TIME : state.clock.elapsedTime);
}

function ProceduralWorld({ cfg, segments, seed, reducedMotion }: { cfg: SurfaceConfig; segments: number; seed: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uColorLow: { value: displayColor(cfg.low) },
      uColorHigh: { value: displayColor(cfg.high) },
      uColorAccent: { value: displayColor(cfg.accent) },
      uNoiseScale: { value: cfg.noiseScale },
      uCraterScale: { value: cfg.craterScale },
      uCraterDensity: { value: cfg.craterDensity },
      uCraterStrength: { value: cfg.craterStrength },
      uIceCap: { value: cfg.iceCap ?? 0 },
      uClouds: { value: cfg.clouds ? 1 : 0 },
      uHeart: { value: cfg.heart ? 1 : 0 },
      uBrightSpots: { value: cfg.brightSpots ?? 0 },
      uSeed: { value: seed },
      uTime: { value: STILL_TIME },
      uSunDir: { value: SUN_DIR },
    }),
    [cfg, seed],
  );
  const rimUniforms = useMemo(
    () =>
      cfg.atmosphere
        ? {
            uColor: { value: displayColor(cfg.atmosphere.color) },
            uPower: { value: cfg.atmosphere.power },
            uStrength: { value: cfg.atmosphere.strength },
            uSunDir: { value: SUN_DIR },
          }
        : null,
    [cfg],
  );
  const time = useSceneTime(reducedMotion);
  useFrame((state, delta) => {
    uniforms.uTime.value = time(state);
    if (mesh.current && !reducedMotion) mesh.current.rotation.y += delta * 0.05;
  });
  return (
    <group rotation={[0, 0, cfg.tilt ?? 0]}>
      <mesh ref={mesh}>
        <sphereGeometry args={[cfg.radius, segments, Math.round(segments / 2)]} />
        <shaderMaterial vertexShader={worldVertex} fragmentShader={worldFragment} uniforms={uniforms} />
      </mesh>
      {rimUniforms && (
        <mesh scale={1.06}>
          <sphereGeometry args={[cfg.radius, 64, 32]} />
          <shaderMaterial
            vertexShader={atmosphereRimVertex}
            fragmentShader={atmosphereRimFragment}
            uniforms={rimUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

/** A procedurally displaced asteroid inside an instanced belt of smaller rocks. */
function AsteroidField({ rocks, reducedMotion }: { rocks: number; reducedMotion: boolean }) {
  const hero = useMemo(() => createRockGeometry({ seed: 433, detail: 5, lumpiness: 0.42, craters: 16, stretch: [1.25, 0.85, 0.95] }), []);
  const variants = useMemo(
    () => [11, 23, 37].map((s) => createRockGeometry({ seed: s, detail: 1, lumpiness: 0.5, craters: 3 })),
    [],
  );
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a7f73', roughness: 0.95, metalness: 0.02 }), []);
  const beltMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6f675e', roughness: 1, flatShading: true }), []);
  const belt = useRef<THREE.Group>(null);
  const heroRef = useRef<THREE.Mesh>(null);
  const instRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const perVariant = Math.ceil(rocks / variants.length);

  useEffect(() => {
    const rand = mulberry32(99);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const e = new THREE.Euler();
    instRefs.current.forEach((inst) => {
      if (!inst) return;
      for (let i = 0; i < perVariant; i++) {
        const a = rand() * Math.PI * 2;
        const r = 2.4 + rand() * 2.6;
        p.set(Math.cos(a) * r, (rand() - 0.5) * 0.5 * (r - 1.5), Math.sin(a) * r);
        e.set(rand() * 6, rand() * 6, rand() * 6);
        q.setFromEuler(e);
        const k = 0.03 + Math.pow(rand(), 3) * 0.16;
        s.set(k, k * (0.7 + rand() * 0.5), k);
        m.compose(p, q, s);
        inst.setMatrixAt(i, m);
      }
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
    });
  }, [perVariant, rocks]);

  useEffect(
    () => () => {
      hero.dispose();
      variants.forEach((v) => v.dispose());
      material.dispose();
      beltMaterial.dispose();
    },
    [hero, variants, material, beltMaterial],
  );

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (belt.current) belt.current.rotation.y += delta * 0.03;
    if (heroRef.current) {
      heroRef.current.rotation.y += delta * 0.12;
      heroRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <group rotation={[0.35, 0, -0.12]}>
      <mesh ref={heroRef} geometry={hero} material={material} scale={0.75} />
      <group ref={belt}>
        {variants.map((g, i) => (
          <instancedMesh key={`${i}-${perVariant}`} ref={(el) => (instRefs.current[i] = el)} args={[g, beltMaterial, perVariant]} />
        ))}
      </group>
    </group>
  );
}

function useTail(count: number, seed: number) {
  return useMemo(() => {
    const rand = mulberry32(seed);
    const seeds = new Float32Array(count);
    const jitter = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds[i] = rand();
      const v = randomUnitVector(rand).multiplyScalar(Math.pow(rand(), 0.6));
      jitter.set([v.x, v.y, v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [count, seed]);
}

/** Nucleus, coma and two tails. Tail shapes are artistic; both point away from the Sun. */
function Comet({ particles, reducedMotion }: { particles: number; reducedMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const nucleus = useMemo(() => createRockGeometry({ seed: 67, detail: 4, lumpiness: 0.5, craters: 6, stretch: [1.5, 0.85, 0.9] }), []);
  const nucleusMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b3632', roughness: 1 }), []);
  const tailDir = useMemo(() => SUN_DIR.clone().negate(), []);
  const curveDir = useMemo(() => new THREE.Vector3().crossVectors(tailDir, new THREE.Vector3(0, 1, 0)).normalize().negate(), [tailDir]);
  const ionGeo = useTail(Math.round(particles * 0.45), 5);
  const dustGeo = useTail(Math.round(particles * 0.55), 9);

  const makeTailMat = (color: string, length: number, spread: number, curve: number, speed: number, size: number, opacity: number) =>
    new THREE.ShaderMaterial({
      vertexShader: tailVertex,
      fragmentShader: tailFragment,
      uniforms: {
        uTime: { value: STILL_TIME },
        uTailDir: { value: tailDir },
        uCurveDir: { value: curveDir },
        uLength: { value: length },
        uSpread: { value: spread },
        uCurve: { value: curve },
        uSpeed: { value: speed },
        uPixelRatio: { value: 1 },
        uSize: { value: size },
        uColor: { value: displayColor(color) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const ionMat = useMemo(() => makeTailMat('#7fd8ff', 9, 0.025, 0.0, 0.16, 5, 0.75), [tailDir, curveDir]); // eslint-disable-line react-hooks/exhaustive-deps
  const dustMat = useMemo(() => makeTailMat('#ffe2b0', 6.5, 0.11, 1.6, 0.07, 9, 0.5), [tailDir, curveDir]); // eslint-disable-line react-hooks/exhaustive-deps
  const comaUniforms = useMemo(() => ({ uColor: { value: displayColor('#bfe9ff') }, uStrength: { value: 0.9 }, uTime: { value: 0 } }), []);
  const nucleusRef = useRef<THREE.Mesh>(null);

  useEffect(
    () => () => {
      nucleus.dispose();
      nucleusMat.dispose();
      ionGeo.dispose();
      dustGeo.dispose();
      ionMat.dispose();
      dustMat.dispose();
    },
    [nucleus, nucleusMat, ionGeo, dustGeo, ionMat, dustMat],
  );

  useFrame((state, delta) => {
    const t = reducedMotion ? STILL_TIME : state.clock.elapsedTime;
    ionMat.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;
    ionMat.uniforms.uPixelRatio.value = dpr;
    dustMat.uniforms.uPixelRatio.value = dpr;
    comaUniforms.uTime.value = t;
    if (nucleusRef.current && !reducedMotion) nucleusRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <points geometry={dustGeo} material={dustMat} />
      <points geometry={ionGeo} material={ionMat} />
      <Billboard>
        <mesh>
          <planeGeometry args={[2.6, 2.6]} />
          <shaderMaterial vertexShader={glowVertex} fragmentShader={glowFragment} uniforms={comaUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
      <mesh ref={nucleusRef} geometry={nucleus} material={nucleusMat} scale={0.32} />
    </group>
  );
}

function CameraFlyTo({
  index,
  id,
  entry,
  reducedMotion,
}: {
  index: number;
  id: WorldEntry['id'];
  entry: MutableRefObject<{ progress: number }>;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const first = useRef(true);
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const obj = worldPosition(index);
    const f = FRAMING[id];
    const wide = size.width / size.height > 1.1;
    const e = reducedMotion ? 1 : entry.current.progress;
    const pull = (1 - e) * 10;
    desiredLook.set(obj.x + f.aimOffset[0], obj.y + f.aimOffset[1], obj.z + f.aimOffset[2]);
    // On wide screens aim left of the object so it sits in the right-hand space beside the info panel.
    if (wide) desiredLook.x -= f.dist * 0.32;
    else desiredLook.y -= f.dist * 0.18;
    desiredPos.set(obj.x + f.dist * 0.18, obj.y + f.dist * 0.16 + pull * 0.35, obj.z + f.dist + pull);
    if (reducedMotion || first.current) {
      camera.position.copy(desiredPos);
      look.current.copy(desiredLook);
      first.current = false;
    } else {
      const k = 1 - Math.exp(-2.6 * delta);
      camera.position.lerp(desiredPos, k);
      look.current.lerp(desiredLook, k);
    }
    camera.lookAt(look.current);
  });
  return null;
}

export interface WorldsSceneProps {
  worlds: WorldEntry[];
  selectedId: WorldEntry['id'];
  entry: MutableRefObject<{ progress: number }>;
  reducedMotion: boolean;
  segments: number;
  beltRocks: number;
  tailParticles: number;
}

export function WorldsScene({ worlds, selectedId, entry, reducedMotion, segments, beltRocks, tailParticles }: WorldsSceneProps) {
  const index = Math.max(0, worlds.findIndex((w) => w.id === selectedId));
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={SUN_DIR.clone().multiplyScalar(20).toArray()} intensity={2.2} color="#fff4e6" />
      <BackdropStars count={1400} />
      <CameraFlyTo index={index} id={worlds[index].id} entry={entry} reducedMotion={reducedMotion} />
      {worlds.map((w, i) => {
        const pos = worldPosition(i).toArray() as [number, number, number];
        return (
          <group key={w.id} position={pos}>
            {w.id === 'asteroid' ? (
              <AsteroidField rocks={beltRocks} reducedMotion={reducedMotion} />
            ) : w.id === 'comet' ? (
              <Comet particles={tailParticles} reducedMotion={reducedMotion} />
            ) : (
              <ProceduralWorld cfg={SURFACES[w.id]} segments={segments} seed={i * 3.17} reducedMotion={reducedMotion} />
            )}
          </group>
        );
      })}
    </>
  );
}
