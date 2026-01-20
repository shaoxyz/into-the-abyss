import React, { useEffect, useRef } from 'react';

interface SpaceMusicProps {
  active: boolean;
  muted: boolean;
  onAnalyserReady?: (analyser: AnalyserNode) => void;
}

// Layer management interface
interface LayerRefs {
  cosmicWind: {
    source: AudioBufferSourceNode | null;
    filter: BiquadFilterNode | null;
    gain: GainNode | null;
    lfoInterval: number | null;
  };
  stellarShimmer: {
    interval: number | null;
  };
  deepVoid: {
    osc: OscillatorNode | null;
    gain: GainNode | null;
    lfoInterval: number | null;
  };
  distantSignal: {
    interval: number | null;
  };
  padSequencer: {
    droneInterval: number | null;
    melodyInterval: number | null;
  };
}

const SpaceMusic: React.FC<SpaceMusicProps> = ({ active, muted, onAnalyserReady }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const layersRef = useRef<LayerRefs>({
    cosmicWind: { source: null, filter: null, gain: null, lfoInterval: null },
    stellarShimmer: { interval: null },
    deepVoid: { osc: null, gain: null, lfoInterval: null },
    distantSignal: { interval: null },
    padSequencer: { droneInterval: null, melodyInterval: null },
  });

  // Interstellar-esque Scale (C Minor / Dorian feel)
  const SCALE = [130.81, 155.56, 196.00, 233.08, 261.63, 293.66, 311.13];
  // Extended scale for shimmer (higher octaves)
  const SHIMMER_FREQS = [523.25, 622.25, 783.99, 932.33, 1046.50, 1174.66, 1318.51];

  // ============================================
  // LAYER 1: Cosmic Wind (Filtered Pink Noise)
  // ============================================
  const createCosmicWind = (ctx: AudioContext, masterGain: GainNode) => {
    // Generate pink noise buffer
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise algorithm (Paul Kellet's refined method)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass filter for "wind" character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 200;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();

    layersRef.current.cosmicWind.source = source;
    layersRef.current.cosmicWind.filter = filter;
    layersRef.current.cosmicWind.gain = gain;

    // Slow LFO for filter sweep (simulates solar wind fluctuations)
    let lfoPhase = 0;
    layersRef.current.cosmicWind.lfoInterval = window.setInterval(() => {
      lfoPhase += 0.02;
      const lfoValue = Math.sin(lfoPhase) * 0.5 + 0.5; // 0-1
      const freq = 80 + lfoValue * 300; // 80-380 Hz sweep
      filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.5);

      // Subtle volume drift
      const volDrift = 0.03 + Math.sin(lfoPhase * 0.3) * 0.015;
      gain.gain.setTargetAtTime(volDrift, ctx.currentTime, 1);
    }, 100);
  };

  // ============================================
  // LAYER 2: Stellar Shimmer (High Harmonics)
  // ============================================
  const playShimmer = (ctx: AudioContext, masterGain: GainNode) => {
    const freq = SHIMMER_FREQS[Math.floor(Math.random() * SHIMMER_FREQS.length)];
    const now = ctx.currentTime;

    // Very quiet, ethereal sine
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.02); // Slight detune

    // High-pass to make it airy
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    const duration = 3 + Math.random() * 4;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.01, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Stereo panner for width
    const panner = ctx.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * 1.6;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.5);

    setTimeout(() => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
      panner.disconnect();
    }, (duration + 1) * 1000);
  };

  const startStellarShimmer = (ctx: AudioContext, masterGain: GainNode) => {
    // Random interval between shimmers (2-6 seconds)
    const scheduleNext = () => {
      playShimmer(ctx, masterGain);
      const nextDelay = 2000 + Math.random() * 4000;
      layersRef.current.stellarShimmer.interval = window.setTimeout(scheduleNext, nextDelay);
    };
    scheduleNext();
  };

  // ============================================
  // LAYER 3: Deep Void (Sub-bass Pulse)
  // ============================================
  const createDeepVoid = (ctx: AudioContext, masterGain: GainNode) => {
    // Very low sine wave (barely audible, more felt than heard)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 30; // 30 Hz - at the edge of hearing

    const gain = ctx.createGain();
    gain.gain.value = 0;

    // Low-pass to remove any harmonics
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 60;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();

    layersRef.current.deepVoid.osc = osc;
    layersRef.current.deepVoid.gain = gain;

    // Very slow breathing LFO
    let phase = 0;
    layersRef.current.deepVoid.lfoInterval = window.setInterval(() => {
      phase += 0.008; // Very slow
      // Breathing pattern: mostly quiet with occasional swells
      const breath = Math.pow(Math.sin(phase), 4) * 0.08; // 0 - 0.08
      gain.gain.setTargetAtTime(breath, ctx.currentTime, 0.5);

      // Subtle frequency drift
      const freqDrift = 28 + Math.sin(phase * 0.5) * 4; // 24-32 Hz
      osc.frequency.setTargetAtTime(freqDrift, ctx.currentTime, 1);
    }, 100);
  };

  // ============================================
  // LAYER 4: Distant Signal (Pulsar/Radio)
  // ============================================
  const playDistantSignal = (ctx: AudioContext, masterGain: GainNode) => {
    const now = ctx.currentTime;

    // Random signal type
    const signalType = Math.random();

    if (signalType < 0.4) {
      // Type A: Quick pulse burst (like a pulsar)
      const pulseCount = 2 + Math.floor(Math.random() * 3);
      const pulseInterval = 0.08 + Math.random() * 0.05;

      for (let i = 0; i < pulseCount; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 800 + Math.random() * 400;

        const gain = ctx.createGain();
        const t = now + i * pulseInterval;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.02, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 5;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.1);

        setTimeout(() => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        }, (i * pulseInterval + 0.2) * 1000);
      }
    } else if (signalType < 0.7) {
      // Type B: Slow descending tone (like a distant transmission)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const startFreq = 600 + Math.random() * 300;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.7, now + 1.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.3);
      gain.gain.setValueAtTime(0.015, now + 1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 3;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2);

      setTimeout(() => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 2500);
    } else {
      // Type C: Filtered noise burst (like cosmic static)
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500 + Math.random() * 1000;
      filter.Q.value = 8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      source.start(now);

      setTimeout(() => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 500);
    }
  };

  const startDistantSignal = (ctx: AudioContext, masterGain: GainNode) => {
    // Very sparse - signals every 8-20 seconds
    const scheduleNext = () => {
      playDistantSignal(ctx, masterGain);
      const nextDelay = 8000 + Math.random() * 12000;
      layersRef.current.distantSignal.interval = window.setTimeout(scheduleNext, nextDelay);
    };
    // Initial delay before first signal
    layersRef.current.distantSignal.interval = window.setTimeout(scheduleNext, 5000 + Math.random() * 5000);
  };

  // ============================================
  // ORIGINAL PAD LAYER (Enhanced)
  // ============================================
  const playNote = (freq: number, duration: number, volume: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.002;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350 + (Math.random() * 150);
    filter.Q.value = 0.8;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume * 0.12, now + 2.5);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 5);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.5;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.35;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGainRef.current);
    noteGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay);
    delay.connect(masterGainRef.current);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 6);
    osc2.stop(now + duration + 6);

    setTimeout(() => {
      osc1.disconnect();
      osc2.disconnect();
      filter.disconnect();
      noteGain.disconnect();
      delay.disconnect();
      delayGain.disconnect();
    }, (duration + 7) * 1000);
  };

  const startPadSequencer = () => {
    if (!audioCtxRef.current || !masterGainRef.current) return;

    const playDrone = () => {
      playNote(65.41, 12, 0.5); // C2 drone
    };
    playDrone();
    layersRef.current.padSequencer.droneInterval = window.setInterval(playDrone, 10000);

    const playNextNote = () => {
      const r = Math.random();
      let freq;
      if (r > 0.75) freq = SCALE[Math.floor(Math.random() * SCALE.length)];
      else if (r > 0.45) freq = SCALE[2]; // G
      else if (r > 0.2) freq = SCALE[0]; // C
      else freq = SCALE[4]; // C4

      if (Math.random() > 0.85) freq *= 2;

      const duration = 5 + Math.random() * 3;
      playNote(freq, duration, 0.35);
    };

    playNextNote();
    layersRef.current.padSequencer.melodyInterval = window.setInterval(playNextNote, 4000);
  };

  // ============================================
  // AUDIO INITIALIZATION
  // ============================================
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();

        const ctx = audioCtxRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;

        masterGain.connect(analyser);
        analyser.connect(ctx.destination);

        masterGainRef.current = masterGain;
        analyserRef.current = analyser;

        if (onAnalyserReady) {
          onAnalyserReady(analyser);
        }
      }
    };

    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      // Cleanup all layers
      const layers = layersRef.current;
      if (layers.cosmicWind.lfoInterval) clearInterval(layers.cosmicWind.lfoInterval);
      if (layers.stellarShimmer.interval) clearTimeout(layers.stellarShimmer.interval);
      if (layers.deepVoid.lfoInterval) clearInterval(layers.deepVoid.lfoInterval);
      if (layers.distantSignal.interval) clearTimeout(layers.distantSignal.interval);
      if (layers.padSequencer.droneInterval) clearInterval(layers.padSequencer.droneInterval);
      if (layers.padSequencer.melodyInterval) clearInterval(layers.padSequencer.melodyInterval);
      audioCtxRef.current?.close();
    };
  }, []);

  // ============================================
  // LAYER ACTIVATION/DEACTIVATION
  // ============================================
  useEffect(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const layers = layersRef.current;

    if (active && !muted) {
      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Fade in master
      masterGain.gain.setTargetAtTime(0.5, ctx.currentTime, 2);

      // Start all layers
      if (!layers.cosmicWind.source) {
        createCosmicWind(ctx, masterGain);
      }
      if (!layers.stellarShimmer.interval) {
        startStellarShimmer(ctx, masterGain);
      }
      if (!layers.deepVoid.osc) {
        createDeepVoid(ctx, masterGain);
      }
      if (!layers.distantSignal.interval) {
        startDistantSignal(ctx, masterGain);
      }
      if (!layers.padSequencer.droneInterval) {
        startPadSequencer();
      }
    } else {
      // Fade out master
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 1.5);

      // Stop all layers
      if (layers.cosmicWind.lfoInterval) {
        clearInterval(layers.cosmicWind.lfoInterval);
        layers.cosmicWind.lfoInterval = null;
      }
      if (layers.cosmicWind.source) {
        layers.cosmicWind.source.stop();
        layers.cosmicWind.source = null;
        layers.cosmicWind.filter = null;
        layers.cosmicWind.gain = null;
      }
      if (layers.stellarShimmer.interval) {
        clearTimeout(layers.stellarShimmer.interval);
        layers.stellarShimmer.interval = null;
      }
      if (layers.deepVoid.lfoInterval) {
        clearInterval(layers.deepVoid.lfoInterval);
        layers.deepVoid.lfoInterval = null;
      }
      if (layers.deepVoid.osc) {
        layers.deepVoid.osc.stop();
        layers.deepVoid.osc = null;
        layers.deepVoid.gain = null;
      }
      if (layers.distantSignal.interval) {
        clearTimeout(layers.distantSignal.interval);
        layers.distantSignal.interval = null;
      }
      if (layers.padSequencer.droneInterval) {
        clearInterval(layers.padSequencer.droneInterval);
        layers.padSequencer.droneInterval = null;
      }
      if (layers.padSequencer.melodyInterval) {
        clearInterval(layers.padSequencer.melodyInterval);
        layers.padSequencer.melodyInterval = null;
      }
    }
  }, [active, muted]);

  return null;
};

export default SpaceMusic;