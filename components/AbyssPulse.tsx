/**
 * ============================================================================
 * ABYSS PULSE - 深渊脉动
 * ============================================================================
 *
 * A living, breathing entity at the heart of the 4th Dimension.
 *
 * 设计灵感 | Inspiration:
 *   - Journey (风之旅人) - 飘逸的粒子，与音乐完美融合
 *   - Flower (花) - 极简却情感充沛
 *   - Deep sea bioluminescence - 深海发光生物的神秘
 *   - Distant stars - 远方恒星的呼吸
 *
 * 设计哲学 | Design Philosophy:
 *   - 它不是一个 UI 元素，而是一个"存在"
 *     It's not a UI element, but a presence
 *   - 用户与它共处，而不是控制它
 *     Users coexist with it, not control it
 *   - 音频是共鸣，而非驱动
 *     Audio resonates, not drives
 *
 * 四层视觉系统 | Four-Layer Visual System:
 *
 *   1. Core (核心光球)
 *      - 自然呼吸节律 (4.5秒周期)
 *      - 低频音频让它膨胀脉动
 *      - 多层光晕，由内到外渐隐
 *
 *   2. Ripples (涟漪波纹)
 *      - 从中心向外扩散
 *      - 音频节拍自动触发
 *      - 用户点击/触摸也会触发
 *
 *   3. Particles (星尘粒子)
 *      - 70个微小光点围绕核心漂浮
 *      - 各有自己的轨道和相位
 *      - 高频音频让它们更活跃、更亮
 *      - 闪烁效果增加生命感
 *
 *   4. Interaction (交互反馈)
 *      - 悬停: 粒子被轻微吸引，好奇地靠近
 *      - 按住: 粒子被强力吸引并旋转 (漩涡效果)
 *      - 释放: 产生涟漪，粒子被推开后缓慢回归
 *
 * ============================================================================
 */

import React, { useEffect, useRef, useCallback } from "react";
import { useMotionParallaxContext } from "../contexts/MotionParallaxContext";

interface AbyssPulseProps {
  analyser: AnalyserNode | null;
  active: boolean;
}

// Particle in the star dust system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseOrbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  size: number;
  baseSize: number;
  opacity: number;
  phase: number;
}

// Ripple expanding from center
interface Ripple {
  radius: number;
  opacity: number;
  speed: number;
  maxRadius: number;
}
const AbyssPulse: React.FC<AbyssPulseProps> = ({ analyser, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const opacityRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const audioHistoryRef = useRef<number[]>([]);

  // Interaction state
  const mouseRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    pressing: boolean;
    pressStartTime: number;
  }>({ x: 0, y: 0, active: false, pressing: false, pressStartTime: 0 });

  const touchRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    startTime: number;
  }>({ x: 0, y: 0, active: false, startTime: 0 });

  const { getDisplacement } = useMotionParallaxContext();

  // Configuration
  const PARTICLE_COUNT = 70;
  const BREATH_CYCLE = 4.5; // seconds
  const CORE_BASE_RADIUS = 0.06; // ratio of canvas size
  const CORE_BREATH_AMPLITUDE = 0.025;
  const MAX_RIPPLES = 6;

  // Initialize particles
  const initParticles = useCallback(
    (centerX: number, centerY: number, size: number) => {
      const particles: Particle[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const orbitRadius = size * (0.15 + Math.random() * 0.25);
        const angle = Math.random() * Math.PI * 2;
        const baseSize = 1 + Math.random() * 2.5;
        particles.push({
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle) * orbitRadius,
          vx: 0,
          vy: 0,
          baseOrbitRadius: orbitRadius,
          orbitAngle: angle,
          orbitSpeed:
            (0.1 + Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1),
          size: baseSize,
          baseSize,
          opacity: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
      return particles;
    },
    [],
  );

  // Create a ripple
  const createRipple = useCallback((maxRadius: number, speed: number = 1) => {
    if (ripplesRef.current.length < MAX_RIPPLES) {
      ripplesRef.current.push({
        radius: 0,
        opacity: 0.6,
        speed: 30 * speed,
        maxRadius,
      });
    }
  }, []);

  // Mouse/Touch event handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getCoords = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getCoords(e.clientX, e.clientY);
      mouseRef.current.x = coords.x;
      mouseRef.current.y = coords.y;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.pressing = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const coords = getCoords(e.clientX, e.clientY);
      mouseRef.current.x = coords.x;
      mouseRef.current.y = coords.y;
      mouseRef.current.pressing = true;
      mouseRef.current.pressStartTime = Date.now();
    };

    const handleMouseUp = () => {
      if (mouseRef.current.pressing) {
        // Create ripple on release
        const size = Math.min(container.clientWidth, container.clientHeight);
        createRipple(size * 0.4, 1.5);
      }
      mouseRef.current.pressing = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const coords = getCoords(e.touches[0].clientX, e.touches[0].clientY);
        touchRef.current = {
          x: coords.x,
          y: coords.y,
          active: true,
          startTime: Date.now(),
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const coords = getCoords(e.touches[0].clientX, e.touches[0].clientY);
        touchRef.current.x = coords.x;
        touchRef.current.y = coords.y;
      }
    };

    const handleTouchEnd = () => {
      if (touchRef.current.active) {
        const size = Math.min(container.clientWidth, container.clientHeight);
        createRipple(size * 0.4, 1.5);
      }
      touchRef.current.active = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [createRipple]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.7;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;

    // Initialize particles if needed
    if (particlesRef.current.length === 0) {
      particlesRef.current = initParticles(centerX, centerY, size);
    }

    let lastTime = performance.now();

    const draw = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, size, size);

      // Fade in/out
      const targetOpacity = active ? 1 : 0;
      opacityRef.current += (targetOpacity - opacityRef.current) * 0.03;

      if (opacityRef.current < 0.01 && !active) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const globalOpacity = opacityRef.current;
      const time = currentTime * 0.001;

      // Get parallax displacement
      const displacement = getDisplacement(1.0, 12);
      const cx = centerX + displacement.x;
      const cy = centerY + displacement.y;

      // Audio analysis
      let bassLevel = 0;
      let midLevel = 0;
      let highLevel = 0;
      let beatDetected = false;

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Split into frequency bands
        const bassEnd = Math.floor(bufferLength * 0.1);
        const midEnd = Math.floor(bufferLength * 0.5);

        let bassSum = 0,
          midSum = 0,
          highSum = 0;
        for (let i = 0; i < bufferLength; i++) {
          if (i < bassEnd) bassSum += dataArray[i];
          else if (i < midEnd) midSum += dataArray[i];
          else highSum += dataArray[i];
        }

        bassLevel = bassSum / (bassEnd * 255);
        midLevel = midSum / ((midEnd - bassEnd) * 255);
        highLevel = highSum / ((bufferLength - midEnd) * 255);

        // Simple beat detection
        audioHistoryRef.current.push(bassLevel);
        if (audioHistoryRef.current.length > 10) {
          audioHistoryRef.current.shift();
        }
        const avgBass =
          audioHistoryRef.current.reduce((a, b) => a + b, 0) /
          audioHistoryRef.current.length;
        if (
          bassLevel > avgBass * 1.5 &&
          bassLevel > 0.3 &&
          time - lastBeatTimeRef.current > 0.3
        ) {
          beatDetected = true;
          lastBeatTimeRef.current = time;
        }
      }

      // Create ripple on beat
      if (beatDetected) {
        createRipple(size * 0.35, 0.8 + bassLevel);
      }

      // === LAYER 1: Core (breathing heart) ===
      const breathPhase = (time % BREATH_CYCLE) / BREATH_CYCLE;
      const breathValue = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;
      const audioExpansion = bassLevel * 0.03;
      const coreRadius =
        size *
        (CORE_BASE_RADIUS +
          breathValue * CORE_BREATH_AMPLITUDE +
          audioExpansion);

      // Core glow layers
      const glowLayers = [
        { radius: coreRadius * 3, opacity: 0.03 },
        { radius: coreRadius * 2, opacity: 0.06 },
        { radius: coreRadius * 1.4, opacity: 0.1 },
        { radius: coreRadius, opacity: 0.4 + breathValue * 0.2 },
      ];

      for (const layer of glowLayers) {
        const gradient = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          layer.radius,
        );
        gradient.addColorStop(
          0,
          `rgba(255, 255, 255, ${layer.opacity * globalOpacity})`,
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, layer.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // === LAYER 2: Ripples ===
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += ripple.speed * deltaTime * 60;
        ripple.opacity *= 0.98;

        if (ripple.radius > ripple.maxRadius || ripple.opacity < 0.01) {
          return false;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * globalOpacity * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        return true;
      });

      // === LAYER 3: Particles (star dust) ===
      // Get interaction point
      let interactionX = cx;
      let interactionY = cy;
      let interactionStrength = 0;
      let isAttracting = false;

      if (mouseRef.current.active) {
        interactionX = mouseRef.current.x;
        interactionY = mouseRef.current.y;
        if (mouseRef.current.pressing) {
          const pressDuration =
            (Date.now() - mouseRef.current.pressStartTime) / 1000;
          interactionStrength = Math.min(1, pressDuration * 2);
          isAttracting = true;
        } else {
          interactionStrength = 0.3; // Gentle attraction on hover
          isAttracting = true;
        }
      }

      if (touchRef.current.active) {
        interactionX = touchRef.current.x;
        interactionY = touchRef.current.y;
        const touchDuration = (Date.now() - touchRef.current.startTime) / 1000;
        interactionStrength = Math.min(1, touchDuration * 2);
        isAttracting = true;
      }

      for (const particle of particlesRef.current) {
        // Natural orbit motion
        particle.orbitAngle += particle.orbitSpeed * deltaTime;

        // Target position on orbit
        const orbitWobble = Math.sin(time * 0.5 + particle.phase) * size * 0.02;
        const currentOrbitRadius = particle.baseOrbitRadius + orbitWobble;
        const targetX = cx + Math.cos(particle.orbitAngle) * currentOrbitRadius;
        const targetY = cy + Math.sin(particle.orbitAngle) * currentOrbitRadius;

        // Interaction force
        if (interactionStrength > 0) {
          const dx = interactionX - particle.x;
          const dy = interactionY - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = size * 0.3;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * interactionStrength * 2;
            const dirX = dx / dist;
            const dirY = dy / dist;

            if (isAttracting) {
              // Attract + swirl
              const swirlAngle = Math.PI / 2;
              const swirlX =
                dirX * Math.cos(swirlAngle) - dirY * Math.sin(swirlAngle);
              const swirlY =
                dirX * Math.sin(swirlAngle) + dirY * Math.cos(swirlAngle);
              particle.vx +=
                (dirX * 0.5 + swirlX * 0.5) * force * 50 * deltaTime;
              particle.vy +=
                (dirY * 0.5 + swirlY * 0.5) * force * 50 * deltaTime;
            }
          }
        }

        // Spring back to orbit
        particle.vx += (targetX - particle.x) * 0.5 * deltaTime;
        particle.vy += (targetY - particle.y) * 0.5 * deltaTime;

        // Damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Apply velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Audio response: high frequencies increase particle activity and size
        const audioSize = particle.baseSize * (1 + highLevel * 1.5);
        particle.size += (audioSize - particle.size) * 0.1;

        // Twinkle effect
        const twinkle = Math.sin(time * 3 + particle.phase) * 0.3 + 0.7;
        const particleOpacity = particle.opacity * twinkle * globalOpacity;

        // Draw particle with glow
        const glowSize = particle.size * (2 + midLevel * 2);
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${particleOpacity})`);
        gradient.addColorStop(
          0.3,
          `rgba(255, 255, 255, ${particleOpacity * 0.3})`,
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // === LAYER 4: Interaction feedback ===
      if (interactionStrength > 0) {
        const feedbackOpacity = interactionStrength * 0.15 * globalOpacity;
        const feedbackRadius = 10 + interactionStrength * 20;

        const gradient = ctx.createRadialGradient(
          interactionX,
          interactionY,
          0,
          interactionX,
          interactionY,
          feedbackRadius,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${feedbackOpacity})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(interactionX, interactionY, feedbackRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, active, getDisplacement, initParticles, createRipple]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.7;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);

      // Reinitialize particles for new size
      const centerX = size / 2;
      const centerY = size / 2;
      particlesRef.current = initParticles(centerX, centerY, size);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initParticles]);

  const containerSize =
    typeof window !== "undefined"
      ? Math.min(window.innerWidth, window.innerHeight) * 0.7
      : 500;

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};

export default AbyssPulse;
