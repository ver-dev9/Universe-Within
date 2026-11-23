import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GalaxyKind } from '../../data/galaxiesData';
import type { QualityLevel } from '../../utils/quality';
import { BackdropStars } from '../worlds/BackdropStars';
import { ProgressBox, smoothstep, lerp } from '../stars/chapterRuntime';
import { buildGalaxy, SUN_ANGLE, SUN_RADIUS } from './galaxyModels';

/** Point budget per quality tier (fewer particles on low). */
export const GALAXY_POINTS: Record<QualityLevel, number> = { high: 120000, medium: 60000, low: 22000 };
const BACKDROP: Record<QualityLevel, number> = { high: 2200, medium: 1400, low: 600 };

const SPIN = 0.045; // rad/s at the centre — slow, readable differential rotation
const omega = (r: number, spin: number) => (SPIN * spin) / (1 + r * 0.35);

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aSpin;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    float r = length(p.xz);
    float a = -uTime * ${SPIN.toFixed(4)} * aSpin / (1.0 + r * 0.35);
    float c = cos(a), s = sin(a);
    p.xz = mat2(c, s, -s, c) * p.xz;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uSizeScale * uPixelRatio / max(-mv.z, 0.05), 1.0, 28.0);
    vColor = color;
  }
`;

const fragment = /* glsl */ `
  uniform float uFade;
  varying vec3 vColor;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r2 = dot(d, d);
    if (r2 > 0.25) discard;
    float a = exp(-r2 * 22.0);
    gl_FragColor = vec4(vColor * a * uFade, 1.0);
  }
`;

interface GalaxySceneProps {
  kind: GalaxyKind;
  /** 0 = among the stars of an arm, 1 = whole-galaxy overview. Written by GSAP. */
  journey: ProgressBox;
  quality: QualityLevel;
  reducedMotion: boolean;
}

/** One procedural galaxy as additive points, plus the camera journey and a "You are here" marker. */
export default function GalaxyScene({ kind, journey, quality, reducedMotion }: GalaxySceneProps) {
  const { camera, gl, size, invalidate } = useThree();
  const count = GALAXY_POINTS[quality];

  const model = useMemo(() => buildGalaxy(kind, count), [kind, count]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(model.positions.subarray(0, model.count * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(model.colors.subarray(0, model.count * 3), 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(model.sizes.subarray(0, model.count), 1));
    g.setAttribute('aSpin', new THREE.BufferAttribute(model.spin.subarray(0, model.count), 1));
    g.computeBoundingSphere();
    return g;
  }, [model]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uSizeScale: { value: 24 },
          uFade: { value: 0 },
        },
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // New galaxy: fade in (instant under reduced motion).
  useEffect(() => {
    material.uniforms.uFade.value = reducedMotion ? 1 : 0;
    invalidate();
  }, [model, material, reducedMotion, invalidate]);

  const sunRef = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const sunPos = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const u = material.uniforms;
    const dt = Math.min(delta, 0.05);
    if (!reducedMotion) u.uTime.value += dt;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    if (u.uFade.value < 1) {
      u.uFade.value = Math.min(1, u.uFade.value + dt * 1.4);
      if (reducedMotion) invalidate();
    }

    // Sun marker orbits with the disk at its radius.
    const sunAng = SUN_ANGLE + u.uTime.value * omega(SUN_RADIUS, 1);
    sunPos.set(Math.cos(sunAng) * SUN_RADIUS, 0, Math.sin(sunAng) * SUN_RADIUS);
    if (sunRef.current) sunRef.current.position.copy(sunPos);

    // Camera journey: from inside an arm (near the Sun) out to a tilted overview.
    const p = kind === 'milky-way' ? journey.current : 1;
    const zoom = smoothstep(0, 1, p);
    const ease = zoom * zoom * (3 - 2 * zoom);
    target.copy(sunPos).multiplyScalar(1 - ease);
    const dist = lerp(1.4, 25, Math.pow(ease, 1.6));
    const incl = lerp(1.47, 0.72, ease); // from the disk axis
    const az = sunAng + lerp(0.9, 0.25, ease) + (reducedMotion ? 0 : Math.sin(u.uTime.value * 0.05) * 0.04);
    const aspect = size.width / Math.max(1, size.height);
    const fit = aspect < 1 ? 1 / Math.max(aspect, 0.55) : 1; // portrait screens: pull back
    const d = dist * (kind === 'milky-way' ? fit : fit * 1.02);
    camera.position.set(
      target.x + d * Math.sin(incl) * Math.cos(az),
      target.y + d * Math.cos(incl),
      target.z + d * Math.sin(incl) * Math.sin(az),
    );
    // Shift the framing so the galaxy sits beside the copy on wide screens.
    lookAt.copy(target);
    if (aspect > 1.15) {
      right.subVectors(camera.position, target).cross(camera.up).normalize();
      lookAt.addScaledVector(right, d * 0.2 * ease);
    }
    camera.lookAt(lookAt);
  });

  useEffect(() => {
    gl.setClearColor('#03040A');
  }, [gl]);

  return (
    <>
      <BackdropStars count={BACKDROP[quality]} radius={160} seed={9} />
      <points geometry={geometry} material={material} rotation={model.tilt} frustumCulled={false} />
      {kind === 'milky-way' && (
        <group ref={sunRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.27, 48]} />
            <meshBasicMaterial color="#69D9EF" transparent opacity={0.9} depthTest={false} toneMapped={false} />
          </mesh>
          <Html center position={[0, 0.55, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <div className="whitespace-nowrap rounded-full border border-cosmos-cyan/50 bg-cosmos-void/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cosmos-cyan">
              Sun · ≈ 26,000 ly from centre
            </div>
          </Html>
        </group>
      )}
    </>
  );
}
