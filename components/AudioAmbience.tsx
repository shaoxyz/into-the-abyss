import React, { useEffect, useRef } from 'react';

interface AudioAmbienceProps {
  active: boolean;
  muted: boolean;
}

const AudioAmbience: React.FC<AudioAmbienceProps> = ({ active, muted }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Initialize Audio Context
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
    };
    
    // Initialize on first user interaction to bypass autoplay policies
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
      audioCtxRef.current?.close();
    };
  }, []);

  // Manage Sound
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Create Brown Noise Buffer (Deep Rumble)
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for gain loss
    }

    // Source
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter (Low Pass for "Space" feel)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120; // Deep bass only

    // Gain (Volume)
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // Start silent

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noiseSource.start();
    
    gainNodeRef.current = gainNode;

    return () => {
      noiseSource.stop();
      noiseSource.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };
  }, []);

  // Handle Fade In/Out
  useEffect(() => {
    if (!gainNodeRef.current || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const gain = gainNodeRef.current.gain;
    const now = ctx.currentTime;

    // Resume context if suspended
    if (ctx.state === 'suspended') ctx.resume();

    if (active && !muted) {
      // Fade In
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(0.3, now + 3); // 3s fade in
    } else {
      // Fade Out
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(0, now + 1.5); // 1.5s fade out
    }
  }, [active, muted]);

  return null; // No UI
};

export default AudioAmbience;