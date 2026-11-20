import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from '../animations/smoothScroll';
import { useCosmosStore } from '../store/useCosmosStore';
import { PlanetData } from '../data/planetsData';
import { INTRO_ORIGIN, introRig, planetRegistry, planetById, blendedRadius, solarState, lerp } from './rigState';

const CH2_SECTIONS = new Set(['solar-system', 'planet-exploration', 'earth-special']);
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Single camera controller for the whole page.
 *  - Chapter 01: follows `introRig` (scrubbed by the intro ScrollTrigger timeline).
 *  - Chapter 02: overview poses per scale mode, and a GSAP-eased fly-to that then
 *    tracks the focused planet's live world position.
 *  - Other chapters: v1 section poses with frame-rate independent damping.
 * Also owns the Chapter 02 scale blend and orbit time-scale easing.
 */
export function CameraRig({ selectedPlanet, reducedMotion }: { selectedPlanet: PlanetData | null; reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), radial: new THREE.Vector3(), tangent: new THREE.Vector3(), right: new THREE.Vector3() }), []);

  const fly = useRef({ t: 1, fromPos: new THREE.Vector3(), fromLook: new THREE.Vector3(), id: null as string | null });
  const flyTween = useRef<gsap.core.Tween | null>(null);
  const first = useRef(true);

  useEffect(() => () => {
    flyTween.current?.kill();
  }, []);

  /** Pose that frames planet `p`, with the planet pushed `shiftNdc` right of centre. */
  const framePlanet = (p: PlanetData, distMul: number, shiftNdc: number) => {
    const obj = planetRegistry.get(p.id);
    if (!obj) return false;
    obj.getWorldPosition(tmp.p);
    const r = blendedRadius(p);
    tmp.radial.set(tmp.p.x, 0, tmp.p.z);
    if (tmp.radial.lengthSq() < 1e-6) tmp.radial.set(1, 0, 0);
    tmp.radial.normalize();
    tmp.tangent.set(-tmp.radial.z, 0, tmp.radial.x);
    // Sun-side three-quarter view so the day side faces the camera.
    const dir = tmp.radial.clone().multiplyScalar(-0.55).addScaledVector(tmp.tangent, 0.75).addScaledVector(UP, 0.32).normalize();
    const extent = p.id === 'saturn' ? r * 2.3 : r;
    const dist = (extent * 4.6 + 1.2) * distMul;
    desiredPos.copy(tmp.p).addScaledVector(dir, dist);
    // Shift the look-at left so the planet sits right of centre (clear of the text column).
    const aspect = size.width / size.height;
    const effShift = aspect > 1.15 ? shiftNdc : 0;
    const halfW = dist * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * aspect;
    tmp.right.crossVectors(dir.clone().negate(), UP).normalize();
    desiredLook.copy(tmp.p).addScaledVector(tmp.right, -effShift * halfW);
    return true;
  };

  useFrame((_, delta) => {
    const s = useCosmosStore.getState();
    const section = s.activeSection;
    const aspect = size.width / size.height;
    const wide = aspect > 1.15;

    // --- Chapter 02 layout state (eases even when off-screen) ----------------
    const blendTarget = s.scaleMode === 'relative' && CH2_SECTIONS.has(section) ? 1 : 0;
    const focusActive = section === 'solar-system' && !!s.focusedPlanetId;
    const timeTarget = focusActive || section === 'planet-exploration' || section === 'earth-special' ? 0.03 : 1;
    if (reducedMotion) {
      solarState.scaleBlend = blendTarget;
      solarState.orbitTimeScale = timeTarget;
    } else {
      const k = 1 - Math.exp(-delta * 2.2);
      solarState.scaleBlend += (blendTarget - solarState.scaleBlend) * k;
      if (Math.abs(blendTarget - solarState.scaleBlend) < 1e-4) solarState.scaleBlend = blendTarget;
      solarState.orbitTimeScale += (timeTarget - solarState.orbitTimeScale) * (1 - Math.exp(-delta * 3));
    }

    // --- Fly-to bookkeeping ----------------------------------------------------
    const focusId = focusActive ? s.focusedPlanetId : null;
    if (focusId !== fly.current.id) {
      fly.current.id = focusId;
      fly.current.fromPos.copy(camera.position);
      fly.current.fromLook.copy(currentLook);
      flyTween.current?.kill();
      if (reducedMotion) {
        fly.current.t = 1;
      } else {
        fly.current.t = 0;
        flyTween.current = gsap.to(fly.current, { t: 1, duration: 1.9, ease: 'power3.inOut' });
      }
    }

    // --- Desired pose --------------------------------------------------------
    let damping = 2.8;
    if (section === 'intro') {
      desiredPos.set(INTRO_ORIGIN.x + introRig.camX, INTRO_ORIGIN.y + introRig.camY, INTRO_ORIGIN.z + introRig.camZ);
      desiredLook.set(INTRO_ORIGIN.x + introRig.lookX, INTRO_ORIGIN.y + introRig.lookY, INTRO_ORIGIN.z + introRig.lookZ);
      damping = 7; // scroll already smoothed by Lenis; keep the camera glued to the scrub
    } else if (section === 'solar-system') {
      const focus = planetById(focusId);
      if (!focus || !framePlanet(focus, 1, wide ? 0.1 : 0)) {
        const b = solarState.scaleBlend;
        desiredPos.set(lerp(-6, -24, b), lerp(64, 205, b), lerp(122, 340, b));
        desiredLook.set(lerp(wide ? -30 : 0, wide ? -105 : 0, b), lerp(-6, -24, b), 0);
      }
    } else if (section === 'planet-exploration' && selectedPlanet) {
      if (!framePlanet(selectedPlanet, 1, 0.32)) desiredPos.set(36, 12, 38);
    } else if (section === 'earth-special') {
      const earth = planetById('earth');
      if (!earth || !framePlanet(earth, 0.8, 0.32)) desiredPos.set(40, 1.2, 5.5);
    } else {
      switch (section) {
        case 'deep-space':
          desiredPos.set(0, 120, 200);
          desiredLook.set(0, 10, -50);
          break;
        case 'beyond-planets':
          desiredPos.set(0, 12, -125);
          desiredLook.set(0, 0, -160);
          break;
        case 'scale-universe':
          desiredPos.set(0, 180, 260);
          desiredLook.set(0, 0, 0);
          break;
        case 'discoveries':
          desiredPos.set(20, 40, 80);
          desiredLook.set(0, 0, 0);
          break;
        default:
          desiredPos.set(0, 30, 90);
          desiredLook.set(0, 0, 0);
      }
    }

    // --- Apply ---------------------------------------------------------------
    if (first.current || reducedMotion) {
      // Reduced motion: cut, don't glide.
      camera.position.copy(desiredPos);
      currentLook.copy(desiredLook);
      first.current = false;
    } else if (focusId && fly.current.t < 1) {
      const t = fly.current.t;
      camera.position.lerpVectors(fly.current.fromPos, desiredPos, t);
      currentLook.lerpVectors(fly.current.fromLook, desiredLook, t);
    } else {
      const k = 1 - Math.exp(-delta * damping);
      camera.position.lerp(desiredPos, k);
      currentLook.lerp(desiredLook, k);
    }
    camera.lookAt(currentLook);
  });

  return null;
}
