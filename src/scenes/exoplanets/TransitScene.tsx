import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getSoftSprite } from '../../utils/softSprite';
import { mulberry32 } from '../sun/random';

import { STAR_R, ORBIT_A, ORBIT_Y } from './transitMath';

interface TransitSceneProps {
  /** 0..1 orbital phase; 0 = mid-transit. Written by the DOM clock. */
  phase: MutableRefObject<number>;
  /** Planet-to-star radius ratio k = Rp / R★. */
  ratio: number;
  starColor: string;
  segments: number;
  starfield: number;
  reducedMotion: boolean;
}

const starVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vPos;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Limb-darkened stellar disc with soft granulation (artistic). */
const starFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormalV;
  varying vec3 vPos;
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  void main() {
    float mu = clamp(dot(vNormalV, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float limb = 1.0 - 0.6 * (1.0 - mu);
    float g = noise(vPos * 7.0 + vec3(0.0, uTime * 0.05, 0.0)) * 0.6 + noise(vPos * 19.0 - uTime * 0.03) * 0.4;
    vec3 col = uColor * limb * (0.86 + 0.24 * g);
    col += vec3(1.0, 0.97, 0.9) * pow(mu, 3.0) * 0.18;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Starfield({ count }: { count: number }) {
  const geo = useMemo(() => {
    const rand = mulberry32(1010);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 60 + rand() * 40;
      const th = rand() * Math.PI * 2;
      const u = rand() * 2 - 1;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = r * s * Math.cos(th);
      pos[i * 3 + 1] = r * u;
      pos[i * 3 + 2] = r * s * Math.sin(th) - 30;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.35,
        map: getSoftSprite(),
        color: '#C9D6F2',
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [],
  );
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  return <points geometry={geo} material={mat} />;
}

export function TransitScene({ phase, ratio, starColor, segments, starfield, reducedMotion }: TransitSceneProps) {
  const planet = useRef<THREE.Mesh>(null);
  const starUniforms = useMemo(() => ({ uColor: { value: new THREE.Color(starColor) }, uTime: { value: 4 } }), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    starUniforms.uColor.value.set(starColor);
  }, [starColor, starUniforms]);

  const glowMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: getSoftSprite(),
        color: starColor,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => {
    glowMat.color.set(starColor);
  }, [starColor, glowMat]);

  const orbitLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(t) * ORBIT_A * STAR_R, 0, Math.cos(t) * ORBIT_A * STAR_R));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({ color: '#69D9EF', transparent: true, opacity: 0.22, depthWrite: false });
    return new THREE.Line(g, m);
  }, []);

  useEffect(
    () => () => {
      glowMat.dispose();
      orbitLine.geometry.dispose();
      (orbitLine.material as THREE.Material).dispose();
    },
    [glowMat, orbitLine],
  );

  const planetR = Math.max(0.004, ratio * STAR_R);

  useFrame((state) => {
    if (!reducedMotion) starUniforms.uTime.value = state.clock.elapsedTime;
    const th = phase.current * Math.PI * 2;
    if (planet.current) {
      planet.current.position.set(Math.sin(th) * ORBIT_A * STAR_R, 0, Math.cos(th) * ORBIT_A * STAR_R);
      planet.current.rotation.y += reducedMotion ? 0 : 0.004;
    }
  });

  return (
    <>
      <Starfield count={starfield} />
      <mesh>
        <sphereGeometry args={[STAR_R, segments, Math.round(segments / 2)]} />
        <shaderMaterial vertexShader={starVertex} fragmentShader={starFragment} uniforms={starUniforms} />
      </mesh>
      <sprite material={glowMat} scale={[STAR_R * 5.2, STAR_R * 5.2, 1]} renderOrder={-1} />
      <pointLight position={[0, 0, 0]} intensity={3.2} decay={0} color={starColor} />
      <ambientLight intensity={0.04} />
      <group position={[0, ORBIT_Y, 0]}>
        <primitive object={orbitLine} />
        <mesh ref={planet} scale={planetR}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshStandardMaterial color="#5E7FA8" roughness={0.85} metalness={0} emissive="#0A1020" />
        </mesh>
      </group>
    </>
  );
}

export default TransitScene;
