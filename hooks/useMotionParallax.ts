import { useEffect, useRef, useCallback, useState } from "react";

export interface MotionOffset {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

export interface UseMotionParallaxOptions {
  /** Damping factor for following the target (0-1, higher = faster follow) */
  followSpeed?: number;
  /** Decay factor for returning to center (0-1, closer to 1 = slower decay) */
  centerAttraction?: number;
  /** Whether the effect is enabled */
  enabled?: boolean;
}

export interface UseMotionParallaxReturn {
  isGyroscopeSupported: boolean;
  isGyroscopePermissionGranted: boolean;
  requestGyroscopePermission: () => Promise<boolean>;
  /** Get current displacement for canvas-based components that can't use CSS variables */
  getDisplacement: (
    depth: number,
    maxDisplacement: number,
  ) => { x: number; y: number };
}

const DEFAULT_OPTIONS: Required<UseMotionParallaxOptions> = {
  followSpeed: 0.1,
  centerAttraction: 0.998,
  enabled: true,
};

/**
 * High-performance parallax hook using CSS Custom Properties
 * Updates CSS variables directly, bypassing React render cycle for 60fps animation
 */
export function useMotionParallax(
  options: UseMotionParallaxOptions = {},
): UseMotionParallaxReturn {
  const { followSpeed, centerAttraction, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Check if we're on a mobile device (has touch AND small screen)
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const [isGyroscopeSupported, setIsGyroscopeSupported] = useState(false);
  const [isGyroscopePermissionGranted, setIsGyroscopePermissionGranted] =
    useState(false);

  // Refs for animation loop (no React state = no re-renders)
  const targetOffset = useRef<MotionOffset>({ x: 0, y: 0 });
  const currentOffset = useRef<MotionOffset>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  // Check gyroscope support
  useEffect(() => {
    const hasGyroscope = "DeviceOrientationEvent" in window;
    setIsGyroscopeSupported(hasGyroscope);

    if (
      hasGyroscope &&
      typeof (DeviceOrientationEvent as any).requestPermission !== "function"
    ) {
      setIsGyroscopePermissionGranted(true);
    }
  }, []);

  // Request gyroscope permission (iOS)
  const requestGyroscopePermission = useCallback(async (): Promise<boolean> => {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        const granted = permission === "granted";
        setIsGyroscopePermissionGranted(granted);
        return granted;
      } catch {
        setIsGyroscopePermissionGranted(false);
        return false;
      }
    }
    setIsGyroscopePermissionGranted(true);
    return true;
  }, []);

  // Get displacement for canvas-based components (reads from current refs)
  const getDisplacement = useCallback(
    (depth: number = 1, maxDisplacement: number = 20) => {
      const current = currentOffset.current;
      return {
        x: current.x * maxDisplacement * depth,
        y: current.y * maxDisplacement * depth,
      };
    },
    [],
  );

  // Handle device orientation (gyroscope) - mobile only when permission granted
  useEffect(() => {
    if (
      !enabled ||
      !isMobile ||
      !isGyroscopeSupported ||
      !isGyroscopePermissionGranted
    )
      return;

    console.log("Parallax: Gyroscope input enabled");

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      const maxAngle = 30;
      const x = Math.max(-1, Math.min(1, gamma / maxAngle));
      const y = Math.max(-1, Math.min(1, (beta - 45) / maxAngle));

      targetOffset.current = { x, y };
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [enabled, isMobile, isGyroscopeSupported, isGyroscopePermissionGranted]);

  // Handle mouse movement (desktop only)
  useEffect(() => {
    // Only use mouse on desktop (not mobile)
    if (!enabled || isMobile) return;

    console.log("Parallax: Mouse input enabled");

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      // Map mouse position to -1 ~ 1 (relative to center)
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      targetOffset.current = { x, y };
    };

    const handleMouseLeave = () => {
      targetOffset.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, isMobile]);

  // Determine if animation should run:
  // - Desktop: always when enabled
  // - Mobile: only when gyroscope permission is granted
  const shouldAnimate = enabled && (!isMobile || isGyroscopePermissionGranted);

  // GPU-accelerated animation loop using CSS Custom Properties
  useEffect(() => {
    if (!shouldAnimate) {
      // Reset CSS variables when disabled
      document.documentElement.style.setProperty("--parallax-x", "0");
      document.documentElement.style.setProperty("--parallax-y", "0");
      return;
    }

    const animate = () => {
      const current = currentOffset.current;
      const target = targetOffset.current;

      // Smooth interpolation with easing
      current.x += (target.x - current.x) * followSpeed;
      current.y += (target.y - current.y) * followSpeed;

      // Apply center attraction
      current.x *= centerAttraction;
      current.y *= centerAttraction;

      // Update CSS Custom Properties directly (no React re-render!)
      // This is GPU-accelerated and runs at 60fps
      document.documentElement.style.setProperty(
        "--parallax-x",
        current.x.toFixed(4),
      );
      document.documentElement.style.setProperty(
        "--parallax-y",
        current.y.toFixed(4),
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [shouldAnimate, followSpeed, centerAttraction]);

  return {
    isGyroscopeSupported,
    isGyroscopePermissionGranted,
    requestGyroscopePermission,
    getDisplacement,
  };
}
