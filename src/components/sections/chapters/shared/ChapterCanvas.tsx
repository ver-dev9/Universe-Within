import React, { MutableRefObject, ReactNode, Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useInView } from './useInView';
import { useChapterSettings } from './useChapterSettings';

export type InvalidateRef = MutableRefObject<(() => void) | null>;

interface ChapterCanvasProps {
  children: ReactNode;
  /** Accessible description of what the 3D scene shows. */
  label: string;
  camera?: { position: [number, number, number]; fov?: number; near?: number; far?: number };
  /** Receives R3F's invalidate() so DOM code (ScrollTrigger, buttons) can request frames in demand mode. */
  invalidateRef?: InvalidateRef;
  className?: string;
}

/** Exposes invalidate() to the DOM side and re-renders when the frameloop wakes up. */
function InvalidateBridge({ invalidateRef, wake }: { invalidateRef?: InvalidateRef; wake: string }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (invalidateRef) invalidateRef.current = () => invalidate();
    return () => {
      if (invalidateRef) invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);
  useEffect(() => {
    invalidate();
  }, [wake, invalidate]);
  return null;
}

/**
 * A self-contained, lazily mounted WebGL canvas for one chapter.
 *  - mounts only once the chapter approaches the viewport
 *  - renders continuously only while visible ('never' off-screen)
 *  - under reduced motion renders on demand (static frames, no ambient animation)
 *  - DPR / antialias follow the global quality tier
 */
export function ChapterCanvas({ children, label, camera, invalidateRef, className }: ChapterCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { mounted, inView } = useInView(hostRef);
  const { profile, reducedMotion, quality } = useChapterSettings();
  const frameloop = !inView ? 'never' : reducedMotion ? 'demand' : 'always';

  return (
    <div ref={hostRef} className={className ?? 'absolute inset-0'} role="img" aria-label={label}>
      {mounted && (
        <Canvas
          key={profile.antialias ? 'aa' : 'noaa'}
          dpr={profile.dpr}
          // No tone mapping: the chapter shaders write display-ready colour, and
          // standard materials (asteroids, nuclei) should match them.
          flat
          frameloop={frameloop}
          gl={{ antialias: profile.antialias, powerPreference: 'high-performance', alpha: false }}
          camera={{
            position: camera?.position ?? [0, 0, 8],
            fov: camera?.fov ?? 40,
            near: camera?.near ?? 0.05,
            far: camera?.far ?? 400,
          }}
        >
          <color attach="background" args={['#03040A']} />
          <InvalidateBridge invalidateRef={invalidateRef} wake={`${frameloop}-${quality}`} />
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      )}
    </div>
  );
}
