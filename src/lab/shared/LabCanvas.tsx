import React, { Suspense, createContext, useContext } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabEnv } from './useLabEnv';

/** False while the lab section is scrolled out of view: the canvas stops rendering. */
export const LabVisibleContext = createContext(true);

interface LabCanvasProps extends Omit<CanvasProps, 'children'> {
  children: React.ReactNode;
  /** Accessible description of what the canvas shows. */
  label: string;
}

/**
 * One WebGL context per lab tool. DPR and antialiasing follow the global
 * quality tier; unmounting the tool unmounts this Canvas, and R3F then
 * disposes the scene graph and releases the context (forceContextLoss).
 */
export const LabCanvas: React.FC<LabCanvasProps> = ({ children, label, gl, ...rest }) => {
  const { profile, quality } = useLabEnv();
  const visible = useContext(LabVisibleContext);
  return (
    <div className="absolute inset-0" role="img" aria-label={label}>
      <Canvas
        key={quality /* antialias can only be set at context creation */}
        dpr={profile.dpr}
        frameloop={visible ? 'always' : 'never'}
        gl={{ antialias: profile.antialias, powerPreference: 'high-performance', alpha: false, ...(gl as object) }}
        onCreated={({ gl: renderer }) => {
          renderer.setClearColor(new THREE.Color('#03040A'));
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
        }}
        {...rest}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
};
