import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { NEBULAE, Nebula } from '../../data/nebulaeData';
import { NebulaVolumeShader, NEBULA_SHAPE_INDEX } from '../../shaders/nebulaVolumeShader';
import { StellarGlowShader } from '../../shaders/stellarSurfaceShader';
import { getSoftSprite } from '../../utils/softSprite';
import { QualityProfile } from '../../utils/quality';
import { ProgressBox, scaled, smoothstep, lerp } from '../stars/chapterRuntime';

/** Distance between nebulae along the flight path (scene units). */
export const NEBULA_SPACING = 36;
const VOLUME_SIZE = 18;
const VOLUME_DEPTH = 12;
const VIEW_DISTANCE = 15;

interface SceneProps {
  progress: ProgressBox;
  profile: QualityProfile;
  reducedMotion: boolean;
}

function useDispose(...items: { dispose: () => void }[]) {
  useEffect(() => () => items.forEach((i) => i.dispose()), items); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Camera position (z) for a given progress; nebula i is framed at progress (i + 0.5) / N. */
export function cameraZForProgress(p: number) {
  const f = p * NEBULAE.length - 0.5;
  return -f * NEBULA_SPACING + VIEW_DISTANCE;
}

const sliceCountFor = (profile: QualityProfile) =>
  profile.postprocessing === 'full' ? 30 : profile.postprocessing === 'lite' ? 20 : 12;
const octavesFor = (profile: QualityProfile) =>
  profile.postprocessing === 'full' ? 5 : profile.postprocessing === 'lite' ? 4 : 3;

const NebulaVolume: React.FC<SceneProps & { nebula: Nebula; index: number }> = ({ nebula, index, profile, reducedMotion }) => {
  const slices = sliceCountFor(profile);
  const octaves = octavesFor(profile);
  const z = -index * NEBULA_SPACING;

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const aSlice = new Float32Array(slices);
    for (let i = 0; i < slices; i++) aSlice[i] = (i / Math.max(1, slices - 1)) * 2 - 1;
    g.setAttribute('aSlice', new THREE.InstancedBufferAttribute(aSlice, 1));
    return g;
  }, [slices]);

  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      ...NebulaVolumeShader,
      uniforms: THREE.UniformsUtils.clone(NebulaVolumeShader.uniforms as Record<string, THREE.IUniform>),
      defines: { OCTAVES: octaves, SLICE_WEIGHT: (5.2 / slices).toFixed(4) },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const [a, b, c] = nebula.visual.palette;
    m.uniforms.uColorA.value = new THREE.Color(a);
    m.uniforms.uColorB.value = new THREE.Color(b);
    m.uniforms.uColorC.value = new THREE.Color(c);
    m.uniforms.uShape.value = NEBULA_SHAPE_INDEX[nebula.visual.shape];
    m.uniforms.uIntensity.value = nebula.visual.intensity;
    m.uniforms.uScale.value = nebula.visual.scale;
    m.uniforms.uSeed.value = index * 13.7;
    return m;
  }, [nebula, index, slices, octaves]);
  useDispose(geo, mat);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < slices; i++) {
      const sz = ((i / Math.max(1, slices - 1)) * 2 - 1) * (VOLUME_DEPTH / 2);
      m.compose(new THREE.Vector3(0, 0, sz), new THREE.Quaternion(), new THREE.Vector3(VOLUME_SIZE, VOLUME_SIZE, 1));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [slices]);

  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!reducedMotion) mat.uniforms.uTime.value += delta;
    // Only draw volumes near the camera (fill-rate budget).
    const camZ = state.camera.position.z;
    const d = camZ - z;
    if (group.current) group.current.visible = d > -VOLUME_DEPTH && d < NEBULA_SPACING * 1.6;
    mat.uniforms.uOpacity.value = smoothstep(NEBULA_SPACING * 1.6, NEBULA_SPACING * 0.7, d) * smoothstep(-VOLUME_DEPTH, -1, d);
  });

  // Tilt shapes that read better at an angle.
  const rot: [number, number, number] =
    nebula.visual.shape === 'shell' ? [0.25, 0.2, 0] : nebula.visual.shape === 'filaments' ? [0, 0, 0.5] : [0, 0, 0];

  return (
    <group ref={group} position={[0, 0, z]}>
      <instancedMesh ref={meshRef} args={[geo, mat, slices]} rotation={rot} frustumCulled={false} />
      <NebulaStars nebula={nebula} index={index} profile={profile} reducedMotion={reducedMotion} />
    </group>
  );
};

/** Dust motes + embedded young stars + object-specific centrepieces. */
const NebulaStars: React.FC<{ nebula: Nebula; index: number; profile: QualityProfile; reducedMotion: boolean }> = ({
  nebula,
  index,
  profile,
  reducedMotion,
}) => {
  const dustCount = scaled(2200, profile);
  const starCount = nebula.visual.shape === 'shell' || nebula.visual.shape === 'filaments' ? 30 : 140;
  const dust = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const col = new Float32Array(dustCount * 3);
    const c1 = new THREE.Color(nebula.visual.palette[1]);
    const c2 = new THREE.Color(nebula.visual.palette[2]);
    const c = new THREE.Color();
    for (let i = 0; i < dustCount; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * VOLUME_SIZE * 0.5);
      v.z *= VOLUME_DEPTH / VOLUME_SIZE;
      pos.set([v.x, v.y, v.z], i * 3);
      c.copy(c1).lerp(c2, Math.random()).multiplyScalar(0.35 + Math.random() * 0.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [dustCount, nebula]);
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const base = new THREE.Color(nebula.visual.starColor);
    for (let i = 0; i < starCount; i++) {
      // Young stars cluster toward the dense core.
      const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.pow(Math.random(), 1.6) * VOLUME_SIZE * 0.45);
      v.z *= 0.6;
      pos.set([v.x, v.y, v.z], i * 3);
      const b = 0.6 + Math.random() * 0.8;
      col.set([base.r * b, base.g * b, base.b * b], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [starCount, nebula]);
  const dustMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.22,
        map: getSoftSprite(),
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const starMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.55,
        map: getSoftSprite(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const glowMat = useMemo(
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
  useDispose(dust, stars, dustMat, starMat, glowGeo, glowMat);

  // Object-specific bright sources (positions are artistic).
  const hero = useMemo(() => {
    switch (nebula.id) {
      case 'orion': // the four Trapezium stars
        return { temp: 30000, size: 2.2, points: [[-0.5, 0.3, 0], [0.4, 0.45, 0.2], [0.15, -0.35, -0.1], [-0.25, -0.5, 0.15]] };
      case 'carina': // Eta Carinae
        return { temp: 20000, size: 4.0, points: [[2.2, 0.9, 0]] };
      case 'crab': // the pulsar
        return { temp: 40000, size: 2.6, points: [[0, 0, 0]] };
      case 'ring': // central white dwarf
        return { temp: 40000, size: 1.6, points: [[0, 0, 0]] };
      default: // young cluster lighting the Eagle's pillars
        return { temp: 25000, size: 3.0, points: [[1.5, 6.5, -2]] };
    }
  }, [nebula.id]);

  const heroRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    glowMat.uniforms.uTemp.value = hero.temp;
    let intensity = 1.2;
    if (nebula.id === 'crab' && !reducedMotion) {
      // Lighthouse flicker. Real rate is 30/s per NASA; slowed here to avoid strobing.
      intensity = 0.7 + 0.8 * Math.pow(Math.max(0, Math.sin(state.clock.elapsedTime * 6.0)), 6.0);
    }
    glowMat.uniforms.uIntensity.value = intensity;
  });

  return (
    <group>
      <points geometry={dust} material={dustMat} frustumCulled={false} />
      <points geometry={stars} material={starMat} frustumCulled={false} />
      {hero.points.map((p, i) => (
        <Billboard key={`${index}-${i}`} position={p as [number, number, number]}>
          <mesh
            ref={(m) => {
              heroRefs.current[i] = m;
            }}
            geometry={glowGeo}
            material={glowMat}
            scale={hero.size}
          />
        </Billboard>
      ))}
    </group>
  );
};

const FlightBackdrop: React.FC<{ count: number }> = ({ count }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const span = NEBULA_SPACING * NEBULAE.length + 60;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 25 + Math.random() * 60;
      pos.set([Math.cos(a) * r, Math.sin(a) * r, 30 - Math.random() * span], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.5,
        map: getSoftSprite(),
        color: '#cfd8f0',
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  useDispose(geo, mat);
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

const FlightRig: React.FC<SceneProps> = ({ progress, reducedMotion }) => {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  useFrame((state, delta) => {
    const p = progress.current;
    const f = p * NEBULAE.length - 0.5;
    const z = cameraZForProgress(p);
    const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.15) * 0.4;
    const target = new THREE.Vector3(Math.sin(f * Math.PI) * 2.2 + sway, Math.cos(f * Math.PI * 0.5) * 0.8, z);
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 3);
    camera.position.lerp(target, k);
    // Look at the nebula ahead; offset right on wide screens so copy (left) stays clear.
    const aheadIndex = Math.min(NEBULAE.length - 1, Math.max(0, Math.round(f)));
    const wide = state.viewport.aspect > 1.2 ? -3.2 : 0;
    const lookTarget = new THREE.Vector3(wide, 0, -aheadIndex * NEBULA_SPACING);
    if (lookTarget.z > camera.position.z - 4) lookTarget.z = camera.position.z - 20;
    look.current.lerp(lookTarget, k);
    camera.lookAt(look.current);
  });
  return null;
};

export const NebulaFlythroughScene: React.FC<SceneProps> = (props) => (
  <>
    <color attach="background" args={['#03040A']} />
    <FlightBackdrop count={Math.round(props.profile.starCount * 0.35)} />
    {NEBULAE.map((n, i) => (
      <NebulaVolume key={n.id} nebula={n} index={i} {...props} />
    ))}
    <FlightRig {...props} />
  </>
);

export default NebulaFlythroughScene;
