import React, { useEffect, useRef } from 'react';

interface SpaceMusicProps {
  active: boolean;
  muted: boolean;
  onAnalyserReady?: (analyser: AnalyserNode) => void;
}

const SpaceMusic: React.FC<SpaceMusicProps> = ({ active, muted, onAnalyserReady }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sequenceIntervalRef = useRef<number | null>(null);
  const noteIndexRef = useRef<number>(0);

  // Interstellar-esque Scale (C Minor / Dorian feel)
  // C3, Eb3, G3, Bb3, C4, D4, Eb4
  const SCALE = [130.81, 155.56, 196.00, 233.08, 261.63, 293.66, 311.13]; 
  
  // Initialize Audio Context
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();

        // Master Gain for Music
        const ctx = audioCtxRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0;

        // Analyser for visualization
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;

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
      if (sequenceIntervalRef.current) window.clearInterval(sequenceIntervalRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  // Play a single swelling note (Organ/Pad style)
  const playNote = (freq: number, duration: number, volume: number) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // 1. Oscillators (Mix Sine for depth + Triangle for texture)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.001; // Slight detune for "width"

    // 2. Filter (Darken the sound)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400 + (Math.random() * 200); // Dynamic brightness
    filter.Q.value = 1;

    // 3. Note Envelope (Long Attack, Long Release = "Swell")
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume * 0.15, now + 2); // 2s Attack
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 4); // 4s Release

    // 4. Delay Effect (Simulate vast space)
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.4; // 400ms echo
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.4; // Feedback amount

    // Connect Graph
    // Osc -> Filter -> NoteGain -> Master
    //                   |-> Delay -> DelayGain -> Delay (Loop) -> Master
    
    osc1.connect(filter);
    osc2.connect(filter);
    
    filter.connect(noteGain);
    
    noteGain.connect(masterGainRef.current);
    
    // Echo Loop
    noteGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay);
    delay.connect(masterGainRef.current);

    // Start/Stop
    osc1.start(now);
    osc2.start(now);
    
    // Cleanup
    osc1.stop(now + duration + 5);
    osc2.stop(now + duration + 5);
    setTimeout(() => {
        osc1.disconnect();
        osc2.disconnect();
        filter.disconnect();
        noteGain.disconnect();
        delay.disconnect();
    }, (duration + 5) * 1000);
  };

  // Sequencer Logic
  useEffect(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;

    if (active && !muted) {
      // Fade In Master
      masterGainRef.current.gain.setTargetAtTime(0.4, ctx.currentTime, 2);
      
      if (!sequenceIntervalRef.current) {
        // Play the "Drone" (Base note)
        const playDrone = () => {
             // Low C2 drone
             playNote(65.41, 10, 0.6);
        };
        playDrone();
        const droneInterval = setInterval(playDrone, 8000); // Loop drone every 8s

        // Play the "Melody" (Arpeggio)
        const playNextNote = () => {
            // Pick a note from scale, prioritizing root and fifths
            const r = Math.random();
            let freq;
            if (r > 0.7) freq = SCALE[Math.floor(Math.random() * SCALE.length)]; // Random high note
            else if (r > 0.4) freq = SCALE[2]; // Fifth (G)
            else freq = SCALE[0]; // Root (C)

            // Randomize octave slightly
            if (Math.random() > 0.8) freq *= 2;

            // Vary duration
            const duration = 4 + Math.random() * 2;
            
            playNote(freq, duration, 0.4);
        };

        // Start melody loop
        playNextNote();
        sequenceIntervalRef.current = window.setInterval(playNextNote, 3000) as unknown as number; // New note every 3s
        
        return () => {
           clearInterval(droneInterval);
        };
      }
    } else {
      // Fade Out
      masterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 1);
      
      if (sequenceIntervalRef.current) {
        clearInterval(sequenceIntervalRef.current);
        sequenceIntervalRef.current = null;
      }
    }
  }, [active, muted]);

  return null; // Minimalist (Invisible)
};

export default SpaceMusic;