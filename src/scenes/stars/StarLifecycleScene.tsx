import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { StellarSurfaceShader, StellarGlowShader } from '../../shaders/stellarSurfaceShader';
import { CollapseCloudShader, EjectaShader, AccretionRingShader } from '../../shaders/stellarParticlesShader';
import { STAR_VISUAL_KEYS, MassPath, STAGE_COUNT } from '../../data/starsData';
import { getSoftSprite } from '../../utils/softSprite';
import { QualityProfile } from '../../utils/quality';
import { ProgressBox, scaled, smoothstep, lerp } from './chapterRuntime';

interface SceneProps {
  progress: ProgressBox;
  mass: MassPath;
  profile: QualityProfile;
  reducedMotion: boolean;
}

/** Continuous visual state for a 0..1 progress (keys sit at each stage centre). */
function sampleKeys(mass: MassPath, p: number) {
  const keys = STAR_VISUAL_KEYS[mass];
  const x = Math.min(STAGE_COUNT - 1, Math.max(0, p * STAGE_COUNT - 0.5));
  const i = Math.min(keys.length - 2, Math.floor(x));
  const f = smoothstep(0, 1, x - i);
  return {
    temp: lerp(keys[i].temp, keys[i + 1].temp, f),
    radius: lerp(keys[i].radius, keys[i + 1].radius, f),
  };
}

/** Disposes memoised GPU resources when the component unmounts or they change. */
function useDispose(...items: { dispose: () => void }[]) {
  useEffect(() => () => items.forEach((i) => i.dispose()), items); // eslint-disable-line react-hooks/exhaustive-deps
}

const BackdropStars: React.FC<{ count: number }> = ({ count }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 40);
      pos.set([v.x, v.y, v.z], i * 3);
      c.setHSL(0.55 + Math.random() * 0.1, 0.4, 0.55 + Math.random() * 0.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.35,
        map: getSoftSprite(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.8,
      }),
    [],
  );
  useDispose(geo, mat);
  return <points geometry={geo} material={mat} />;
};

const CollapseCloud: React.FC<SceneProps & { count: number }> = ({ progress, count, reducedMotion }) => {
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // Clumpy cloud: points around a handful of clump centres.
      const clump = new THREE.Vector3().randomDirection().multiplyScalar(1.5 + Math.random() * 3.5);
      const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.pow(Math.random(), 0.6) * 2.2).add(clump);
      pos.set([v.x, v.y * 0.7, v.z], i * 3);
      seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      ...CollapseCloudShader,
      uniforms: THREE.UniformsUtils.clone(CollapseCloudShader.uniforms as Record<string, THREE.IUniform>),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    m.uniforms.uColorA.value = new THREE.Color('#5a3a8f');
    m.uniforms.uColorB.value = new THREE.Color('#E7B86B');
    return m;
  }, []);
  useDispose(geo, mat);
  const ref = useRef<THREE.Points>(null);
  useFrame((state, delta) => {
    const p = progress.current;
    const u = mat.uniforms;
    if (!reducedMotion) u.uTime.value += delta;
    u.uCollapse.value = smoothstep(0.04, 0.3, p);
    u.uDisk.value = smoothstep(0.17, 0.3, p);
    u.uOpacity.value = 1 - smoothstep(0.34, 0.48, p);
    u.uPixelRatio.value = dpr;
    if (ref.current) ref.current.visible = u.uOpacity.value > 0.01;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
};

const Star: React.FC<SceneProps> = ({ progress, mass, profile, reducedMotion }) => {
  const segs = Math.round(64 * profile.geometryDetail);
  const geo = useMemo(() => new THREE.SphereGeometry(1, segs, Math.round(segs * 0.75)), [segs]);
  const surface = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...StellarSurfaceShader,
        uniforms: THREE.UniformsUtils.clone(StellarSurfaceShader.uniforms),
      }),
    [],
  );
  const glow = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...StellarGlowShader,
        uniforms: THREE.UniformsUtils.clone(StellarGlowShader.uniforms),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const flash = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...StellarGlowShader,
        uniforms: THREE.UniformsUtils.clone(StellarGlowShader.uniforms),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  useDispose(geo, surface, glow, flash, plane);

  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const smooth = useRef({ temp: 2500, radius: 0 });

  useFrame((state, delta) => {
    const p = progress.current;
    const target = sampleKeys(mass, p);
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 6);
    smooth.current.temp = lerp(smooth.current.temp, target.temp, k);
    smooth.current.radius = lerp(smooth.current.radius, target.radius, k);
    const { temp, radius } = smooth.current;

    // Giants boil; low-mass giants pulsate near the end of the giant phase.
    const giant = smoothstep(0.45, 0.6, p) * (1 - smoothstep(0.68, 0.75, p));
    const pulse = mass === 'low' && !reducedMotion ? 1 + 0.04 * giant * Math.sin(state.clock.elapsedTime * 2.2) : 1;
    const r = Math.max(0.0001, radius * pulse);

    surface.uniforms.uTemp.value = temp;
    surface.uniforms.uTurbulence.value = 0.25 + 0.7 * giant;
    if (!reducedMotion) surface.uniforms.uTime.value += delta;
    const remnantBH = mass === 'veryHigh' && p > 0.8;
    if (starRef.current) {
      starRef.current.scale.setScalar(r);
      starRef.current.visible = radius > 0.01 && !remnantBH;
      starRef.current.rotation.y += reducedMotion ? 0 : delta * 0.05;
    }
    glow.uniforms.uTemp.value = temp;
    // Protostar is dimmer and cloaked; main sequence brightest halo.
    const proto = smoothstep(0.12, 0.25, p) * (1 - smoothstep(0.3, 0.38, p));
    glow.uniforms.uIntensity.value = (radius > 0.01 && !remnantBH ? 0.9 : 0) * (1 - 0.4 * proto);
    if (glowRef.current) glowRef.current.scale.setScalar(Math.max(0.6, r * 5.5));

    // Death flash: brief, bright for supernovae; gentle for planetary nebulae.
    const flashT = smoothstep(0.66, 0.7, p) * (1 - smoothstep(0.72, 0.8, p));
    const flashI = mass === 'low' ? flashT * 0.35 : flashT * 2.2;
    flash.uniforms.uTemp.value = 12000;
    flash.uniforms.uIntensity.value = flashI;
    flash.uniforms.uFalloff.value = 1.6;
    if (flashRef.current) {
      flashRef.current.visible = flashI > 0.01;
      flashRef.current.scale.setScalar(4 + flashT * 14);
    }
  });

  return (
    <group>
      <mesh ref={starRef} geometry={geo} material={surface} />
      <Billboard>
        <mesh ref={glowRef} geometry={plane} material={glow} />
        <mesh ref={flashRef} geometry={plane} material={flash} />
      </Billboard>
    </group>
  );
};

const Ejecta: React.FC<SceneProps & { count: number }> = ({ progress, mass, count, reducedMotion }) => {
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const dir = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection();
      dir.set([v.x, v.y, v.z], i * 3);
      rnd.set([Math.random(), Math.random()], i * 2);
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 2));
    return g;
  }, [count]);
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      ...EjectaShader,
      uniforms: THREE.UniformsUtils.clone(EjectaShader.uniforms as Record<string, THREE.IUniform>),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    m.uniforms.uColorA.value = new THREE.Color();
    m.uniforms.uColorB.value = new THREE.Color();
    return m;
  }, []);
  useDispose(geo, mat);
  const ref = useRef<THREE.Points>(null);

  useEffect(() => {
    const u = mat.uniforms;
    if (mass === 'low') {
      // Planetary nebula: ionised oxygen teal core, hydrogen/nitrogen red rim (artistic).
      u.uMode.value = 0;
      u.uRadius.value = 3.2;
      u.uSize.value = 34;
      (u.uColorA.value as THREE.Color).set('#69D9EF');
      (u.uColorB.value as THREE.Color).set('#e0563e');
    } else {
      u.uMode.value = 1;
      u.uRadius.value = 7.5;
      u.uSize.value = 40;
      (u.uColorA.value as THREE.Color).set('#fff4e0');
      (u.uColorB.value as THREE.Color).set('#c0482a');
    }
  }, [mass, mat]);

  useFrame((_, delta) => {
    const p = progress.current;
    const u = mat.uniforms;
    if (!reducedMotion) u.uTime.value += delta;
    u.uPixelRatio.value = dpr;
    if (mass === 'low') {
      u.uT.value = smoothstep(0.62, 0.98, p);
      u.uOpacity.value = smoothstep(0.62, 0.7, p);
    } else {
      u.uT.value = smoothstep(0.67, 0.95, p);
      u.uOpacity.value = smoothstep(0.66, 0.69, p) * (1 - 0.6 * smoothstep(0.9, 1.0, p));
    }
    if (ref.current) ref.current.visible = u.uOpacity.value > 0.01;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
};

/** Neutron-star lighthouse beams (high-mass path, artistic). */
const PulsarBeams: React.FC<SceneProps> = ({ progress, mass, reducedMotion }) => {
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.35, 5, 24, 1, true);
    g.translate(0, -2.5, 0);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#9fd8ff'),
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useDispose(geo, mat);
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const vis = mass === 'high' ? smoothstep(0.84, 0.9, progress.current) : 0;
    if (!group.current) return;
    group.current.visible = vis > 0.01;
    mat.opacity = 0.28 * vis;
    if (!reducedMotion) group.current.rotation.y += delta * 2.4;
  });
  return (
    <group ref={group} rotation={[0, 0, 0.5]}>
      <mesh geometry={geo} material={mat} />
      <mesh geometry={geo} material={mat} rotation={[Math.PI, 0, 0]} />
    </group>
  );
};

/** Black-hole remnant: dark sphere + accretion ring (artistic, not a lensing simulation). */
const BlackHoleRemnant: React.FC<SceneProps> = ({ progress, mass, reducedMotion }) => {
  const sphere = useMemo(() => new THREE.SphereGeometry(0.45, 48, 32), []);
  const black = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000' }), []);
  const ringGeo = useMemo(() => new THREE.PlaneGeometry(4.2, 4.2), []);
  const ringMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...AccretionRingShader,
        uniforms: THREE.UniformsUtils.clone(AccretionRingShader.uniforms),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useDispose(sphere, black, ringGeo, ringMat);
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const vis = mass === 'veryHigh' ? smoothstep(0.82, 0.9, progress.current) : 0;
    if (!group.current) return;
    group.current.visible = vis > 0.01;
    group.current.scale.setScalar(0.6 + 0.4 * vis);
    ringMat.uniforms.uOpacity.value = vis;
    if (!reducedMotion) ringMat.uniforms.uTime.value += delta;
  });
  return (
    <group ref={group} rotation={[0.35, 0, 0.12]}>
      <mesh geometry={sphere} material={black} renderOrder={2} />
      <mesh geometry={ringGeo} material={ringMat} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
};

const CameraRig: React.FC<SceneProps> = ({ progress, mass, reducedMotion }) => {
  const { camera } = useThree();
  useFrame((state, delta) => {
    const p = progress.current;
    const { radius } = sampleKeys(mass, p);
    // Pull back for the cloud, giants and supernova; push in on tiny remnants.
    const cloud = 1 - smoothstep(0.05, 0.3, p);
    const blast = mass === 'low' ? smoothstep(0.66, 0.95, p) * 2.5 : smoothstep(0.66, 0.85, p) * 7;
    const remnant = smoothstep(0.85, 0.98, p) * (mass === 'low' ? 0 : 4);
    const dist = 6.2 + radius * 1.6 + cloud * 5 + blast - remnant;
    const t = state.clock.elapsedTime;
    const orbit = reducedMotion ? 0.35 : 0.35 + t * 0.03;
    const target = new THREE.Vector3(Math.sin(orbit) * dist, 0.9 + dist * 0.12, Math.cos(orbit) * dist);
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.5);
    camera.position.lerp(target, k);
    // Keep the star right of centre on wide screens so the copy on the left stays clear.
    camera.lookAt(-Math.min(2.2, state.viewport.aspect > 1.2 ? dist * 0.2 : 0), 0, 0);
  });
  return null;
};

export const StarLifecycleScene: React.FC<SceneProps> = (props) => {
  const { profile } = props;
  return (
    <>
      <color attach="background" args={['#03040A']} />
      <BackdropStars count={Math.round(profile.starCount * 0.25)} />
      <CollapseCloud {...props} count={scaled(9000, profile)} />
      <Star {...props} />
      <Ejecta key={props.mass === 'low' ? 'pn' : 'sn'} {...props} count={scaled(props.mass === 'low' ? 5000 : 8000, profile)} />
      <PulsarBeams {...props} />
      <BlackHoleRemnant {...props} />
      <CameraRig {...props} />
    </>
  );
};

export default StarLifecycleScene;
