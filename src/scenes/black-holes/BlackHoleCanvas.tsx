import React, { useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { blackHoleRaymarchFragment, blackHoleRaymarchVertex } from '../../shaders/blackHoleRaymarchShader';
import { QualityLevel } from '../../utils/quality';
import { bhRig } from './bhRig';

/** Ray-march budget and render resolution per quality tier. */
const BH_TIER: Record<QualityLevel, { steps: number; stepScale: number; dpr: [number, number]; post: 'full' | 'lite' | 'off' }> = {
  high: { steps: 220, stepScale: 0.07, dpr: [1, 1.5], post: 'full' },
  medium: { steps: 150, stepScale: 0.095, dpr: [0.75, 1], post: 'lite' },
  low: { steps: 96, stepScale: 0.14, dpr: [0.5, 0.75], post: 'off' },
};

const WORLD_UP = new THREE.Vector3(0, 1, 0);

interface SceneProps {
  quality: QualityLevel;
  reducedMotion: boolean;
}

/** Full-screen quad running the ray tracer; camera basis is rebuilt from the rig each frame. */
function BlackHoleQuad({ quality, reducedMotion }: SceneProps) {
  const tier = BH_TIER[quality];
  const { gl, invalidate } = useThree();

  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: blackHoleRaymarchVertex,
        fragmentShader: blackHoleRaymarchFragment,
        defines: { MAX_STEPS: tier.steps, STEP_SCALE: tier.stepScale.toFixed(4) },
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uCamPos: { value: new THREE.Vector3() },
          uCamRight: { value: new THREE.Vector3() },
          uCamUp: { value: new THREE.Vector3() },
          uCamForward: { value: new THREE.Vector3() },
          uTanHalfFov: { value: 0.42 },
          uCenterOffset: { value: new THREE.Vector2() },
          uDiskInner: { value: 3.0 }, // innermost stable circular orbit = 3 R_s
          uDiskOuter: { value: 14.0 },
          uExposure: { value: 0.9 },
          uDiskGain: { value: 1.25 },
          uStarGain: { value: 1.0 },
          uFade: { value: 0 },
        },
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [tier.steps, tier.stepScale],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Drag to orbit (pointer + touch). touch-action: pan-y keeps vertical page scroll on phones.
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'pan-y';
    el.style.cursor = 'grab';
    let active = false;
    let lastX = 0;
    let lastY = 0;
    const down = (e: PointerEvent) => {
      active = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      bhRig.dragAzTarget += dx * 0.006;
      bhRig.dragInclTarget = THREE.MathUtils.clamp(bhRig.dragInclTarget - dy * 0.004, -1.1, 1.1);
      invalidate();
    };
    const up = () => {
      active = false;
      el.style.cursor = 'grab';
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl, invalidate]);

  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const u = material.uniforms;
    const dpr = state.gl.getPixelRatio();
    u.uResolution.value.set(state.size.width * dpr, state.size.height * dpr);
    if (!reducedMotion) u.uTime.value += Math.min(delta, 0.05);

    // Ease drag offsets (snap under reduced motion).
    const k = reducedMotion ? 1 : 1 - Math.pow(0.0015, Math.min(delta, 0.1));
    bhRig.dragAz += (bhRig.dragAzTarget - bhRig.dragAz) * k;
    bhRig.dragIncl += (bhRig.dragInclTarget - bhRig.dragIncl) * k;
    if (reducedMotion && (Math.abs(bhRig.dragAzTarget - bhRig.dragAz) > 1e-4)) invalidate();

    const az = bhRig.az + bhRig.dragAz;
    const incl = THREE.MathUtils.clamp(bhRig.incl + bhRig.dragIncl, 0.12, Math.PI - 0.12);
    pos.set(Math.sin(incl) * Math.cos(az), Math.cos(incl), Math.sin(incl) * Math.sin(az)).multiplyScalar(bhRig.dist);
    u.uCamPos.value.copy(pos);
    const fw = u.uCamForward.value.copy(pos).multiplyScalar(-1).normalize();
    const right = u.uCamRight.value.crossVectors(fw, WORLD_UP).normalize();
    u.uCamUp.value.crossVectors(right, fw).normalize();
    u.uTanHalfFov.value = bhRig.tanHalfFov;
    u.uFade.value = bhRig.fade;

    // Frame the hole beside the copy: right of centre on wide screens, above centre on tall ones.
    const aspect = state.size.width / state.size.height;
    if (aspect > 1.15) u.uCenterOffset.value.set(Math.min(0.55, (aspect - 1) * 0.75), 0.02);
    else u.uCenterOffset.value.set(0, 0.42);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

interface BlackHoleCanvasProps {
  quality: QualityLevel;
  reducedMotion: boolean;
}

/** The chapter's own WebGL canvas. Mounted by the section only while near the viewport. */
export const BlackHoleCanvas: React.FC<BlackHoleCanvasProps> = ({ quality, reducedMotion }) => {
  const tier = BH_TIER[quality];
  return (
    <Canvas
      dpr={tier.dpr}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false, depth: false }}
      camera={{ position: [0, 0, 1] }}
      onCreated={({ gl }) => gl.setClearColor('#03040A')}
      aria-hidden
    >
      <BlackHoleQuad key={quality} quality={quality} reducedMotion={reducedMotion} />
      {tier.post === 'full' && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
      {tier.post === 'lite' && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.6} luminanceThreshold={0.68} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
};
