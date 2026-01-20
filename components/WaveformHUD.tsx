import React, { useEffect, useRef } from 'react';
import { useMotionParallaxContext } from '../contexts/MotionParallaxContext';

interface WaveformHUDProps {
  analyser: AnalyserNode | null;
  active: boolean;
}

const WaveformHUD: React.FC<WaveformHUDProps> = ({ analyser, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const opacityRef = useRef<number>(0);
  const prevDataRef = useRef<Float32Array | null>(null);

  // Get parallax context - waveform has higher depth for more dramatic movement
  const { getDisplacement } = useMotionParallaxContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.6;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const baseRadius = size * 0.25;
    const maxAmplitude = size * 0.15;

    // Fallback data for when no analyser
    const fallbackData = new Uint8Array(64);

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Fade in/out
      const targetOpacity = active ? 0.4 : 0;
      opacityRef.current += (targetOpacity - opacityRef.current) * 0.02;

      if (opacityRef.current < 0.01 && !active) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Get parallax displacement - waveform moves with depth 1.5 for more noticeable effect
      const displacement = getDisplacement(1.5, 20);
      const centerX = size / 2 + displacement.x;
      const centerY = size / 2 + displacement.y;

      const time = Date.now() * 0.001;
      const numPoints = 128;

      let rawData: Uint8Array;
      if (analyser) {
        rawData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(rawData);
      } else {
        rawData = fallbackData;
      }

      // Create evenly distributed waveform data
      const waveformData = new Float32Array(numPoints);
      for (let i = 0; i < numPoints; i++) {
        // Gentle breathing animation (slower, smaller amplitude)
        const breathe = Math.sin(time * 0.3 + i * 0.03) * 6 +
                       Math.sin(time * 0.5 + i * 0.06) * 4;

        // Sample from frequency data (mirror for symmetry)
        const freqIndex = Math.floor((i < numPoints / 2 ? i : numPoints - i) * rawData.length / numPoints * 0.5);
        const freqValue = rawData[Math.min(freqIndex, rawData.length - 1)] || 0;

        waveformData[i] = active ? breathe + (freqValue / 255) * maxAmplitude * 0.5 : 0;
      }

      // Spatial smoothing
      const spatialSmoothed = new Float32Array(numPoints);
      const smoothingWindow = 8;
      for (let i = 0; i < numPoints; i++) {
        let sum = 0;
        for (let j = -smoothingWindow; j <= smoothingWindow; j++) {
          const idx = (i + j + numPoints) % numPoints;
          sum += waveformData[idx];
        }
        spatialSmoothed[i] = sum / (smoothingWindow * 2 + 1);
      }

      // Temporal smoothing (interpolate with previous frame)
      if (!prevDataRef.current) {
        prevDataRef.current = new Float32Array(numPoints);
      }
      const smoothedData = new Float32Array(numPoints);
      const temporalSmoothing = 0.85; // Higher = smoother but slower response
      for (let i = 0; i < numPoints; i++) {
        smoothedData[i] = prevDataRef.current[i] * temporalSmoothing +
                         spatialSmoothed[i] * (1 - temporalSmoothing);
        prevDataRef.current[i] = smoothedData[i];
      }

      // Calculate points
      const sliceAngle = (Math.PI * 2) / numPoints;
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const amplitude = smoothedData[i];
        const radius = baseRadius + amplitude;
        const angle = i * sliceAngle - Math.PI / 2;
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacityRef.current})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(255, 255, 255, ${opacityRef.current * 0.5})`;

      // Draw smooth curve using quadratic bezier
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < numPoints; i++) {
        const curr = points[i];
        const next = points[(i + 1) % numPoints];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      }

      ctx.closePath();
      ctx.stroke();

      // Inner circle (subtle reference)
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacityRef.current * 0.2})`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, active, getDisplacement]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.6;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default WaveformHUD;
