import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { gsap } from 'gsap';
import { useCosmosStore, selectReducedMotion } from '../../store/useCosmosStore';

const MIN_DURATION_MS = 2200;

/**
 * Cinematic loader: a single point of light condenses, then stars form around it
 * while the 3D scene compiles. Real asset progress comes from drei's useProgress;
 * textures in this project are mostly procedural, so a minimum duration keeps the
 * reveal from flashing.
 */
export const LoadingScreen: React.FC = () => {
  const { progress, active } = useProgress();
  const reducedMotion = useCosmosStore(selectReducedMotion);
  const setLoaded = useCosmosStore((s) => s.setLoaded);
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setMinElapsed(true), reducedMotion ? 400 : MIN_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  // Star formation on a 2D canvas (cheap, runs before WebGL is ready).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 420 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.pow(Math.random(), 0.6),
      size: Math.random() * 1.4 + 0.3,
      delay: Math.random() * 1.6,
      hue: Math.random() < 0.2 ? '231,184,107' : Math.random() < 0.4 ? '105,217,239' : '238,242,250',
    }));
    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.hypot(w, h) / 2;
      ctx.clearRect(0, 0, w, h);

      // Central point of light
      const core = Math.min(t / 0.8, 1);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * dpr * core + 1);
      g.addColorStop(0, `rgba(238,242,250,${0.95 * core})`);
      g.addColorStop(0.2, `rgba(105,217,239,${0.35 * core})`);
      g.addColorStop(1, 'rgba(3,4,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 * dpr * core + 1, 0, Math.PI * 2);
      ctx.fill();

      for (const s of stars) {
        const local = Math.max(0, Math.min((t - 0.5 - s.delay) / 1.4, 1));
        if (local <= 0) continue;
        const eased = 1 - Math.pow(1 - local, 3);
        const r = s.dist * maxR * eased;
        const x = cx + Math.cos(s.angle + (1 - eased) * 0.6) * r;
        const y = cy + Math.sin(s.angle + (1 - eased) * 0.6) * r;
        ctx.fillStyle = `rgba(${s.hue},${0.85 * local})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  const done = minElapsed && (!active || progress >= 100);

  useEffect(() => {
    if (!done || !rootRef.current) return;
    setLoaded();
    const tween = gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: reducedMotion ? 0.2 : 1.2,
      ease: 'power2.inOut',
      onComplete: () => setVisible(false),
    });
    return () => {
      tween.kill();
    };
  }, [done, reducedMotion, setLoaded]);

  if (!visible) return null;

  const pct = active ? Math.round(progress) : minElapsed ? 100 : 0;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] bg-cosmos-void flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading the universe"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="relative text-center px-6">
        <p className="chapter-label mb-6">Initialising the cosmos</p>
        <h1 className="font-display text-5xl sm:text-7xl text-cosmos-white tracking-tight">Universe Within</h1>
        <p className="mt-4 font-mono text-[11px] tracking-[0.35em] text-cosmos-muted uppercase">
          A journey beyond the visible
        </p>
        <div className="mx-auto mt-10 h-px w-48 bg-white/10 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-cosmos-cyan transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <span className="sr-only">{pct}% loaded</span>
      </div>
    </div>
  );
};
