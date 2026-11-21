import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  photosphereVertex,
  photosphereFragment,
  coronaVertex,
  coronaFragment,
  prominenceVertex,
  prominenceFragment,
  emissionVertex,
  emissionFragment,
} from '../../shaders/photosphereShader';
import { mulberry32, randomUnitVector } from './random';

export const SUN_RADIUS = 1.5;
/** Fixed "frozen" time used under reduced motion so the frame is a still image. */
const STILL_TIME = 23.0;

export interface SunSceneProps {
  /** 0..1 scroll progress through the chapter, written by ScrollTrigger. */
  scrub: MutableRefObject<{ progress: number }>;
  reducedMotion: boolean;
  segments: number;
  particles: number;
  prominences: number;
  detail: number;
  bloom: boolean;
}

function useTime(reducedMotion: boolean) {
  return (state: { clock: THREE.Clock }) => (reducedMotion ? STILL_TIME : state.clock.elapsedTime);
}

function Photosphere({ segments, detail, reducedMotion }: { segments: number; detail: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: STILL_TIME },
      uGranScale: { value: 26.0 },
      uSpotAmount: { value: 0.55 },
      uDetail: { value: detail },
    }),
    [detail],
  );
  const time = useTime(reducedMotion);
  useFrame((state, delta) => {
    uniforms.uTime.value = time(state);
    if (mesh.current && !reducedMotion) mesh.current.rotation.y += delta * 0.012;
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[SUN_RADIUS, segments, Math.round(segments / 2)]} />
      <shaderMaterial vertexShader={photosphereVertex} fragmentShader={photosphereFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Corona({ reducedMotion }: { reducedMotion: boolean }) {
  const inner = 0.3;
  const size = (SUN_RADIUS / inner) * 2;
  const uniforms = useMemo(() => ({ uTime: { value: STILL_TIME }, uInner: { value: inner }, uStrength: { value: 1.0 } }), []);
  const time = useTime(reducedMotion);
  useFrame((state) => {
    uniforms.uTime.value = time(state);
  });
  return (
    <Billboard>
      <mesh renderOrder={-1}>
        <planeGeometry args={[size, size]} />
        <shaderMaterial
          vertexShader={coronaVertex}
          fragmentShader={coronaFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
}

/** Magnetic loops anchored on the surface, mostly near the visible limb. Artistic. */
function Prominences({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const loops = useMemo(() => {
    const rand = mulberry32(1859); // Carrington's year as a seed
    const out: { geometry: THREE.TubeGeometry; material: THREE.ShaderMaterial }[] = [];
    for (let i = 0; i < count; i++) {
      // Anchor near the limb ring (z ≈ 0, facing the camera's side) for most loops.
      const onLimb = i < Math.ceil(count * 0.75);
      let c = randomUnitVector(rand);
      if (onLimb) {
        const ang = (i / Math.ceil(count * 0.75)) * Math.PI * 2 + rand() * 0.5;
        c = new THREE.Vector3(Math.cos(ang), Math.sin(ang) * 0.8, 0.15 + rand() * 0.25).normalize();
      }
      const ref = Math.abs(c.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const t1 = new THREE.Vector3().crossVectors(c, ref).normalize().applyAxisAngle(c, rand() * Math.PI);
      const sep = 0.12 + rand() * 0.16;
      const height = SUN_RADIUS * (0.12 + rand() * 0.28);
      const R = SUN_RADIUS * 0.985;
      const pt = (k: number, h: number) => c.clone().addScaledVector(t1, sep * k).normalize().multiplyScalar(R + h);
      const curve = new THREE.CatmullRomCurve3([pt(1, 0), pt(0.95, height * 0.55), pt(0.45, height * 0.95), pt(0, height), pt(-0.45, height * 0.95), pt(-0.95, height * 0.55), pt(-1, 0)]);
      const geometry = new THREE.TubeGeometry(curve, 64, 0.012 + rand() * 0.02, 8, false);
      const material = new THREE.ShaderMaterial({
        vertexShader: prominenceVertex,
        fragmentShader: prominenceFragment,
        uniforms: { uTime: { value: STILL_TIME }, uSeed: { value: rand() * 100 }, uIntensity: { value: 1.6 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      out.push({ geometry, material });
    }
    return out;
  }, [count]);

  useEffect(
    () => () => {
      loops.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [loops],
  );

  const time = useTime(reducedMotion);
  useFrame((state) => {
    const t = time(state);
    for (const l of loops) l.material.uniforms.uTime.value = t;
  });

  return (
    <group>
      {loops.map((l, i) => (
        <mesh key={i} geometry={l.geometry} material={l.material} />
      ))}
    </group>
  );
}

/** Particles streaming away from the surface, animated entirely on the GPU. Artistic. */
function Emission({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(25);
    const dirs = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const v = randomUnitVector(rand);
      // Bias towards the active belts and towards the limb.
      v.y *= 0.7;
      v.z *= 0.6;
      v.normalize();
      dirs.set([v.x, v.y, v.z], i * 3);
      seeds[i] = rand();
      speeds[i] = 0.4 + rand() * 1.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), SUN_RADIUS * 3);
    const m = new THREE.ShaderMaterial({
      vertexShader: emissionVertex,
      fragmentShader: emissionFragment,
      uniforms: {
        uTime: { value: STILL_TIME },
        uRadius: { value: SUN_RADIUS * 1.01 },
        uRange: { value: SUN_RADIUS * 0.9 },
        uPixelRatio: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [count]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  const time = useTime(reducedMotion);
  useFrame((state) => {
    material.uniforms.uTime.value = time(state);
    material.uniforms.uPixelRatio.value = dpr;
  });

  return <points geometry={geometry} material={material} />;
}

/** Scroll-scrubbed approach: from a distant star to the edge of the limb. */
function CameraApproach({ scrub, reducedMotion }: { scrub: SunSceneProps['scrub']; reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());
  const from = useMemo(() => new THREE.Vector3(), []);
  const to = useMemo(() => new THREE.Vector3(), []);
  const lookFrom = useMemo(() => new THREE.Vector3(), []);
  const lookTo = useMemo(() => new THREE.Vector3(), []);
  const smoothed = useRef(0);

  useFrame((_, delta) => {
    const wide = size.width / size.height > 1.1;
    const target = reducedMotion ? 0.45 : scrub.current.progress;
    smoothed.current = reducedMotion ? target : THREE.MathUtils.damp(smoothed.current, target, 4, delta);
    const p = smoothed.current;
    const e = p * p * (3 - 2 * p);
    if (wide) {
      from.set(0, 0.3, 12);
      to.set(1.0, 0.7, 3.9);
      lookFrom.set(-2.4, 0, 0);
      lookTo.set(-0.6, 0.55, 0);
    } else {
      from.set(0, 0.3, 15);
      to.set(0.4, 0.9, 5.2);
      lookFrom.set(0, -0.9, 0);
      lookTo.set(0, 0.2, 0);
    }
    camera.position.lerpVectors(from, to, e);
    look.current.lerpVectors(lookFrom, lookTo, e);
    camera.lookAt(look.current);
  });
  return null;
}

export function SunScene({ scrub, reducedMotion, segments, particles, prominences, detail, bloom }: SunSceneProps) {
  return (
    <>
      <CameraApproach scrub={scrub} reducedMotion={reducedMotion} />
      <Corona reducedMotion={reducedMotion} />
      <Photosphere segments={segments} detail={detail} reducedMotion={reducedMotion} />
      <Prominences count={prominences} reducedMotion={reducedMotion} />
      <Emission count={particles} reducedMotion={reducedMotion} />
      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}
