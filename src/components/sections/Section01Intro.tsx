import React, { useLayoutEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, getLenis, scrollToId } from '../../animations/smoothScroll';
import { introRig, INTRO_START, INTRO_STATIC } from '../../scenes/rigState';
import { useCosmosStore, selectReducedMotion } from '../../store/useCosmosStore';

interface Section01IntroProps {
  /** Fired when the visitor presses "Begin" (plays the warp cue). */
  onEnter: () => void;
}

/**
 * Chapter 01 — The Beginning.
 * A tall scroll section with a sticky viewport. One GSAP timeline, scrubbed by a
 * ScrollTrigger over the section, animates both the DOM copy and the mutable
 * `introRig` that the 3D camera reads in useFrame. No React state changes on
 * scroll. Under reduced motion the chapter is a single static composition.
 */
export const Section01Intro: React.FC<Section01IntroProps> = ({ onEnter }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useCosmosStore(selectReducedMotion);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      Object.assign(introRig, INTRO_STATIC);
      return;
    }

    Object.assign(introRig, INTRO_START);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true },
      });
      const q = (k: string) => section.querySelector(`[data-intro="${k}"]`);

      // 0 — near-black, a single glowing point beneath the title.
      tl.to(q('cue'), { autoAlpha: 0, duration: 0.5 }, 0.2);
      tl.to(q('title'), { autoAlpha: 0, y: -70, duration: 1.5, ease: 'power1.in' }, 0.6);
      // Stars form.
      tl.to(introRig, { starReveal: 1, duration: 2.6, ease: 'power2.out' }, 0.3);
      // The point condenses into Earth as the camera approaches.
      tl.to(introRig, { camX: -9, camY: 4, camZ: -48, lookY: 0, duration: 2.4, ease: 'power2.inOut' }, 1.6);
      tl.to(introRig, { earthReveal: 1, duration: 1.8, ease: 'power2.out' }, 2.0);
      tl.to(introRig, { pointGlow: 0, duration: 1.2, ease: 'power1.in' }, 2.2);
      // Close approach — Earth fills the right of the frame.
      tl.to(introRig, { camX: -6.5, camY: 2.2, camZ: -13.5, lookX: 4.6, lookY: 0.6, duration: 2, ease: 'power2.inOut' }, 4.0);
      tl.fromTo(q('tagline'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 4.6);
      tl.to(q('tagline'), { autoAlpha: 0, y: -30, duration: 0.7 }, 6.1);
      // Skim the limb, inside the blue of the upper atmosphere.
      tl.to(introRig, { camX: -1.2, camY: 5.75, camZ: -1.6, lookX: -3, lookY: 5.2, lookZ: 12, duration: 1.6, ease: 'power1.inOut' }, 6.0);
      tl.to(q('haze'), { autoAlpha: 1, duration: 0.8 }, 6.2);
      // Pull out of the atmosphere into space.
      tl.to(introRig, { camX: 10, camY: 9, camZ: -58, lookX: 4, lookY: -1, lookZ: 0, duration: 2.4, ease: 'power2.inOut' }, 7.6);
      tl.to(q('haze'), { autoAlpha: 0, duration: 0.9 }, 7.7);
      tl.fromTo(q('exit'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 8.4);
      tl.to(q('exit'), { autoAlpha: 0, duration: 0.4 }, 9.6);
    }, section);

    return () => {
      ctx.revert(); // kills the ScrollTrigger and restores inline styles
      // Leave the rest of the page with a fully formed starfield.
      introRig.starReveal = 1;
    };
  }, [reducedMotion]);

  const begin = () => {
    onEnter();
    const section = sectionRef.current;
    const lenis = getLenis();
    if (!section) return;
    // Jump to the close approach (where the tagline lands), ~53% through the scrub.
    const y = section.offsetTop + (section.offsetHeight - window.innerHeight) * 0.53;
    if (lenis) lenis.scrollTo(y, { duration: 3.2, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      id="intro"
      ref={sectionRef}
      aria-labelledby="intro-title"
      className="relative pointer-events-none"
      style={{ height: reducedMotion ? '100vh' : '420vh' }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Upper-atmosphere haze while the camera skims the limb */}
        <div
          data-intro="haze"
          aria-hidden="true"
          className="absolute inset-0 invisible opacity-0"
          style={{
            background:
              'radial-gradient(120% 70% at 50% 110%, rgba(90,184,255,0.55) 0%, rgba(52,120,212,0.28) 40%, rgba(3,4,10,0) 75%)',
          }}
        />

        {/* Title card */}
        <div
          data-intro="title"
          className={`absolute inset-0 flex flex-col items-center px-6 text-center ${
            reducedMotion ? 'justify-start pt-[18vh]' : 'justify-center pb-[14vh]'
          }`}
        >
          <p className="chapter-label mb-6">Chapter 01 · The Beginning</p>
          <h1 id="intro-title" className="cinematic-heading text-cosmos-white drop-shadow-[0_0_40px_rgba(3,4,10,0.9)]">
            UNIVERSE WITHIN
          </h1>
          <p className="mt-6 font-mono text-xs sm:text-sm tracking-[0.42em] text-cosmos-cyan uppercase">
            A Journey Beyond the Visible.
          </p>
          {reducedMotion && (
            <p className="mt-10 font-heading text-sm sm:text-base tracking-[0.3em] text-cosmos-white/90 uppercase">
              Explore the infinite. Discover the unknown.
            </p>
          )}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
            <button
              onClick={begin}
              className="px-7 py-3 rounded-full border border-cosmos-cyan/50 bg-cosmos-void/40 backdrop-blur font-mono text-[11px] tracking-[0.3em] uppercase text-cosmos-white hover:border-cosmos-cyan hover:bg-cosmos-cyan/10 transition-colors"
            >
              Begin the journey
            </button>
            <button
              onClick={() => scrollToId('solar-system')}
              className="font-mono text-[11px] tracking-[0.3em] uppercase text-cosmos-muted hover:text-cosmos-white transition-colors underline-offset-4 hover:underline"
            >
              Skip to the Solar System
            </button>
          </div>
        </div>

        {/* Tagline at the close approach (scrubbed) */}
        {!reducedMotion && (
          <div data-intro="tagline" className="invisible absolute inset-y-0 left-0 flex items-center px-6 sm:px-12 lg:px-20 max-w-3xl">
            <p className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.02] text-cosmos-white drop-shadow-[0_0_30px_rgba(3,4,10,0.95)]">
              Explore the infinite.
              <br />
              <span className="italic text-cosmos-cyan">Discover the unknown.</span>
            </p>
          </div>
        )}

        {/* Leaving the atmosphere */}
        {!reducedMotion && (
          <div data-intro="exit" className="invisible absolute bottom-[14vh] left-0 px-6 sm:px-12 lg:px-20 max-w-xl">
            <p className="chapter-label mb-3" style={{ color: '#69D9EF' }}>Leaving the atmosphere</p>
            <p className="font-body text-sm sm:text-base text-cosmos-white/85 leading-relaxed">
              About 100 km up — the Kármán line, the conventional edge of space — the blue sky gives way to black.
              Beyond it lies everything else.
            </p>
          </div>
        )}

        {/* Scroll cue */}
        {!reducedMotion && (
          <div data-intro="cue" aria-hidden="true" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cosmos-muted">
            <span className="font-mono text-[10px] tracking-[0.35em] uppercase">Scroll</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-cosmos-cyan" />
          </div>
        )}
      </div>
    </section>
  );
};
