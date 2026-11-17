import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const droneOsc1Ref = useRef<OscillatorNode | null>(null);
  const droneOsc2Ref = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Resonant lowpass filter to create deep, space-like acoustic atmosphere
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);
      filter.Q.setValueAtTime(4.0, ctx.currentTime);
      filter.connect(masterGain);
      filterRef.current = filter;

      // Low frequency sub-bass drone oscillator 1 (55Hz - A1)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);

      const oscGain1 = ctx.createGain();
      oscGain1.gain.setValueAtTime(0.25, ctx.currentTime);
      osc1.connect(oscGain1);
      oscGain1.connect(filter);
      osc1.start();
      droneOsc1Ref.current = osc1;

      // Binaural detuned oscillator 2 (55.6Hz for subtle slow 0.6Hz beating)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(55.6, ctx.currentTime);

      const oscGain2 = ctx.createGain();
      oscGain2.gain.setValueAtTime(0.3, ctx.currentTime);
      osc2.connect(oscGain2);
      oscGain2.connect(filter);
      osc2.start();
      droneOsc2Ref.current = osc2;

      // Slow LFO to pulse the atmospheric filter cutoff (0.08Hz cycle)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      lfoRef.current = lfo;

    } catch (e) {
      console.warn('Web Audio API not supported in this environment', e);
    }
  }, []);

  const toggleSound = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (isPlaying) {
      // Fade out
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setIsPlaying(false);
    } else {
      // Fade in to current volume
      master.gain.setTargetAtTime(volume, ctx.currentTime, 0.8);
      setIsPlaying(true);
    }
  }, [initAudio, isPlaying, volume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (audioCtxRef.current && masterGainRef.current && isPlaying) {
      masterGainRef.current.gain.setTargetAtTime(newVol, audioCtxRef.current.currentTime, 0.1);
    }
  }, [isPlaying]);

  // Subtle interactive UI feedback sound
  const playClickFeedback = useCallback(() => {
    if (!audioCtxRef.current || !isPlaying) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore
    }
  }, [isPlaying, volume]);

  // Warp transition sound when leaping to a planet
  const playWarpSound = useCallback(() => {
    if (!audioCtxRef.current || !isPlaying) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.9);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.95);
    } catch {
      // Ignore
    }
  }, [isPlaying, volume]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isPlaying,
    volume,
    toggleSound,
    setVolume: handleVolumeChange,
    playClickFeedback,
    playWarpSound,
  };
}
