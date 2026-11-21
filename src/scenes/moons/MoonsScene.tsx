import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  MOON_MODES,
  moonVertex,
  moonFragment,
  hazeVertex,
  hazeFragment,
  parentFragment,
  plumeVertex,
  plumeFragment,
} from '../../shaders/moonSurfaceShader';
import { MoonEntry } from '../../data/moonsData';
import { mulberry32, randomUnitVector } from '../sun/random';
import { BackdropStars } from '../worlds/BackdropStars';

export const MOON_SUN_DIR = new THREE.Vector3(-0.75, 0.3, 0.6).normalize();
const SPACING = 14;
const STILL_TIME = 9;

/** Hex → display (sRGB) values for raw ShaderMaterials, which write gl_FragColor without colour conversion. */
const displayColor = (hex: string) => new THREE.Color(hex).convertLinearToSRGB();

/**
 * Display radii. Sizes are compressed so small moons stay legible: the 3D
 * scene is NOT to scale (the DOM comparison bar is). Enceladus is ~10× smaller
 * than Ganymede in reality.
 */
const LARGEST_R = 2631.2;
export const moonDisplayRadius = (m: MoonEntry) => 0.55 + 0.6 * Math.sqrt(m.meanRadiusKm / LARGEST_R);

export const moonPosition = (index: number) => new THREE.Vector3(index * SPACING, 0, 0);

const PARENT_KIND: Record<MoonEntry['parent'], number> = { Earth: 0, Jupiter: 1, Saturn: 2, Neptune: 3 };
/** Parent backdrop radius / placement (behind the moon, upper right). Artistic framing. */
const PARENT_LAYOUT: Record<MoonEntry['parent'], { radius: number; offset: [number, number, number] }> = {
  Earth: { radius: 3.2, offset: [4.6, 1.6, -13] },
  Jupiter: { radius: 7.5, offset: [7.5, 2.6, -24] },
  Saturn: { radius: 6.2, offset: [7.0, 2.4, -22] },
  Neptune: { radius: 4.6, offset: [5.8, 2.0, -18] },
};

function useTime(reducedMotion: boolean) {
  return (state: { clock: THREE.Clock }) => (reducedMotion ? STILL_TIME : state.clock.elapsedTime);
}

/* ───────────────────────── Plumes ───────────────────────── */

interface PlumeSpec {
  origins: THREE.Vector3[];
  count: number;
  radius: number;
  height: number;
  spread: number;
  speed: number;
  umbrella: boolean;
  size: number;
  color: string;
  opacity: number;
  seed: number;
  /** spread of the origin around each vent (radians-ish, on the unit sphere). */
  ventJitter: number;
}

function Plume({ spec, reducedMotion }: { spec: PlumeSpec; reducedMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(spec.seed);
    const n = spec.count;
    const origin = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    const jitter = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const vent = spec.origins[i % spec.origins.length];
      const o = vent.clone().add(randomUnitVector(rand).multiplyScalar(spec.ventJitter * rand())).normalize();
      origin.set([o.x, o.y, o.z], i * 3);
      seeds[i] = rand();
      // Jitter perpendicular-ish to the vent normal so umbrellas spread sideways.
      const j = randomUnitVector(rand);
      j.addScaledVector(o, -j.dot(o) * (spec.umbrella ? 1 : 0.6)).multiplyScalar(Math.sqrt(rand()));
      jitter.set([j.x, j.y, j.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('aOrigin', new THREE.BufferAttribute(origin, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aJitter', new THREE.BufferAttribute(jitter, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), spec.radius + spec.height + spec.spread + 1);
    const m = new THREE.ShaderMaterial({
      vertexShader: plumeVertex,
      fragmentShader: plumeFragment,
      uniforms: {
        uTime: { value: STILL_TIME },
        uRadius: { value: spec.radius },
        uHeight: { value: spec.height },
        uSpread: { value: spec.spread },
        uSpeed: { value: spec.speed },
        uUmbrella: { value: spec.umbrella ? 1 : 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: spec.size },
        uColor: { value: displayColor(spec.color) },
        uOpacity: { value: spec.opacity },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [spec]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const time = useTime(reducedMotion);
  useFrame((state) => {
    material.uniforms.uTime.value = time(state);
    material.uniforms.uPixelRatio.value = dpr;
  });

  return <points geometry={geometry} material={material} />;
}

/* ───────────────────────── Parent planet ───────────────────────── */

function ParentPlanet({ parent, active, reducedMotion }: { parent: MoonEntry['parent']; active: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const layout = PARENT_LAYOUT[parent];
  const opacity = useRef(active ? 1 : 0);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: moonVertex,
        fragmentShader: parentFragment,
        uniforms: {
          uKind: { value: PARENT_KIND[parent] },
          uOpacity: { value: opacity.current },
          uSunDir: { value: MOON_SUN_DIR },
          uTime: { value: STILL_TIME },
        },
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      }),
    [parent],
  );
  const ringMaterial = useMemo(
    () =>
      parent === 'Saturn'
        ? new THREE.MeshBasicMaterial({ color: '#cdb98f', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })
        : null,
    [parent],
  );
  useEffect(
    () => () => {
      material.dispose();
      ringMaterial?.dispose();
    },
    [material, ringMaterial],
  );

  const time = useTime(reducedMotion);
  useFrame((state, delta) => {
    const target = active ? 1 : 0;
    opacity.current = reducedMotion ? target : THREE.MathUtils.damp(opacity.current, target, active ? 1.6 : 4, delta);
    material.uniforms.uOpacity.value = opacity.current;
    material.uniforms.uTime.value = time(state);
    if (ringMaterial) ringMaterial.opacity = opacity.current * 0.45;
    if (group.current) group.current.visible = opacity.current > 0.005;
  });

  return (
    <group ref={group} position={layout.offset} renderOrder={-2}>
      <mesh material={material} renderOrder={-2}>
        <sphereGeometry args={[layout.radius, 64, 32]} />
      </mesh>
      {ringMaterial && (
        <mesh material={ringMaterial} rotation={[Math.PI / 2 - 0.35, 0.15, 0]} renderOrder={-1}>
          <ringGeometry args={[layout.radius * 1.25, layout.radius * 2.2, 128, 1]} />
        </mesh>
      )}
    </group>
  );
}

/* ───────────────────────── One moon ───────────────────────── */

function plumeSpecs(m: MoonEntry, radius: number, budget: number): PlumeSpec[] {
  if (m.id === 'enceladus') {
    // Jets along the four "tiger stripe" fractures around the south pole.
    const origins: THREE.Vector3[] = [];
    for (let s = 0; s < 4; s++) {
      for (let k = 0; k < 5; k++) {
        const x = -0.35 + s * 0.18 + (k - 2) * 0.03;
        const z = (k - 2) * 0.14;
        origins.push(new THREE.Vector3(x, -1, z).normalize());
      }
    }
    return [
      {
        origins,
        count: budget,
        radius,
        height: radius * 2.6,
        spread: radius * 0.9,
        speed: 0.12,
        umbrella: false,
        size: 7,
        color: '#cfe9ff',
        opacity: 0.55,
        seed: 41,
        ventJitter: 0.05,
      },
    ];
  }
  if (m.id === 'io') {
    // Umbrella plumes placed near the limb so they read in silhouette (artistic).
    const vents = [
      new THREE.Vector3(0.95, 0.25, 0.2),
      new THREE.Vector3(-0.55, 0.78, 0.25),
      new THREE.Vector3(0.5, -0.82, 0.25),
    ].map((v) => v.normalize());
    const per = Math.round(budget / vents.length);
    return vents.map((v, i) => ({
      origins: [v],
      count: per,
      radius: radius * 0.995,
      height: radius * (0.32 - i * 0.05),
      spread: radius * 0.38,
      speed: 0.22,
      umbrella: true,
      size: 5,
      color: i === 0 ? '#ffd27a' : '#f2e3a8',
      opacity: 0.6,
      seed: 70 + i,
      ventJitter: 0.02,
    }));
  }
  return [];
}

function Moon({
  moon,
  segments,
  plumeParticles,
  reducedMotion,
}: {
  moon: MoonEntry;
  segments: number;
  plumeParticles: number;
  reducedMotion: boolean;
}) {
  const surface = useRef<THREE.Mesh>(null);
  const radius = moonDisplayRadius(moon);
  const uniforms = useMemo(
    () => ({
      // GLSL `int` uniform: must stay an integer-valued JS number.
      uMode: { value: MOON_MODES[moon.id] | 0 },
      uTime: { value: STILL_TIME },
      uSunDir: { value: MOON_SUN_DIR },
    }),
    [moon.id],
  );
  const hazeUniforms = useMemo(
    () => (moon.id === 'titan' ? { uTime: { value: STILL_TIME }, uSunDir: { value: MOON_SUN_DIR }, uOpacity: { value: 1 } } : null),
    [moon.id],
  );
  const plumes = useMemo(() => plumeSpecs(moon, radius, plumeParticles), [moon, radius, plumeParticles]);
  const time = useTime(reducedMotion);

  useFrame((state, delta) => {
    const t = time(state);
    uniforms.uTime.value = t;
    if (hazeUniforms) hazeUniforms.uTime.value = t;
    if (surface.current && !reducedMotion) surface.current.rotation.y += delta * 0.04;
  });

  return (
    <group rotation={[0, 0, moon.id === 'enceladus' ? 0.25 : 0]}>
      <mesh ref={surface} rotation={[0, moon.id === 'moon' ? 0.6 : 0, 0]}>
        <sphereGeometry args={[radius, segments, Math.round(segments / 2)]} />
        <shaderMaterial vertexShader={moonVertex} fragmentShader={moonFragment} uniforms={uniforms} />
      </mesh>
      {hazeUniforms && (
        <mesh scale={1.07}>
          <sphereGeometry args={[radius, 64, 32]} />
          <shaderMaterial
            vertexShader={hazeVertex}
            fragmentShader={hazeFragment}
            uniforms={hazeUniforms}
            transparent
            premultipliedAlpha
            depthWrite={false}
          />
        </mesh>
      )}
      {plumes.map((spec, i) => (
        <Plume key={`${moon.id}-${i}-${spec.count}`} spec={spec} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

/* ───────────────────────── Camera ───────────────────────── */

function CameraFlyTo({
  index,
  radius,
  entry,
  reducedMotion,
}: {
  index: number;
  radius: number;
  entry: MutableRefObject<{ progress: number }>;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());
  const first = useRef(true);
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const obj = moonPosition(index);
    const wide = size.width / size.height > 1.1;
    const dist = radius * (wide ? 3.4 : 4.6) + 1.2;
    const e = reducedMotion ? 1 : entry.current.progress;
    const pull = (1 - e) * 12;
    desiredLook.copy(obj);
    // Wide: object sits right of centre (info panel is on the left). Narrow: object sits high (panel below).
    if (wide) desiredLook.x -= dist * 0.33;
    else desiredLook.y -= dist * 0.3;
    desiredPos.set(obj.x + dist * 0.12, obj.y + dist * 0.1 + pull * 0.3, obj.z + dist + pull);
    if (reducedMotion || first.current) {
      camera.position.copy(desiredPos);
      look.current.copy(desiredLook);
      first.current = false;
    } else {
      const k = 1 - Math.exp(-2.4 * delta);
      camera.position.lerp(desiredPos, k);
      look.current.lerp(desiredLook, k);
    }
    camera.lookAt(look.current);
  });
  return null;
}

/* ───────────────────────── Scene ───────────────────────── */

export interface MoonsSceneProps {
  moons: MoonEntry[];
  selectedId: MoonEntry['id'];
  entry: MutableRefObject<{ progress: number }>;
  reducedMotion: boolean;
  segments: number;
  plumeParticles: number;
}

export function MoonsScene({ moons, selectedId, entry, reducedMotion, segments, plumeParticles }: MoonsSceneProps) {
  const index = Math.max(0, moons.findIndex((m) => m.id === selectedId));
  const selected = moons[index];
  return (
    <>
      <BackdropStars count={1400} seed={11} />
      <CameraFlyTo index={index} radius={moonDisplayRadius(selected)} entry={entry} reducedMotion={reducedMotion} />
      {moons.map((m, i) => {
        const pos = moonPosition(i).toArray() as [number, number, number];
        const near = Math.abs(i - index) <= 1;
        return (
          <group key={m.id} position={pos}>
            {/* Only the selected moon and its neighbours are mounted: keeps draw calls and particles low. */}
            {near && <Moon moon={m} segments={segments} plumeParticles={plumeParticles} reducedMotion={reducedMotion} />}
            <ParentPlanet parent={m.parent} active={i === index} reducedMotion={reducedMotion} />
          </group>
        );
      })}
    </>
  );
}
