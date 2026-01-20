import { useState, useEffect, useRef, useCallback } from 'react';

export interface MotionOffset {
  x: number;  // -1 to 1
  y: number;  // -1 to 1
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
  offset: MotionOffset;
  isGyroscopeSupported: boolean;
  isGyroscopePermissionGranted: boolean;
  requestGyroscopePermission: () => Promise<boolean>;
}

const DEFAULT_OPTIONS: Required<UseMotionParallaxOptions> = {
  followSpeed: 0.08,
  centerAttraction: 0.995,
  enabled: true,
};

export function useMotionParallax(
  options: UseMotionParallaxOptions = {}
): UseMotionParallaxReturn {
  const { followSpeed, centerAttraction, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [offset, setOffset] = useState<MotionOffset>({ x: 0, y: 0 });
  const [isGyroscopeSupported, setIsGyroscopeSupported] = useState(false);
  const [isGyroscopePermissionGranted, setIsGyroscopePermissionGranted] = useState(false);

  // Refs for animation loop
  const targetOffset = useRef<MotionOffset>({ x: 0, y: 0 });
  const currentOffset = useRef<MotionOffset>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  // Check gyroscope support
  useEffect(() => {
    const hasGyroscope = 'DeviceOrientationEvent' in window;
    setIsGyroscopeSupported(hasGyroscope);

    // Check if permission is needed (iOS 13+)
    if (
      hasGyroscope &&
      typeof (DeviceOrientationEvent as any).requestPermission !== 'function'
    ) {
      // Android or older iOS - no permission needed
      setIsGyroscopePermissionGranted(true);
    }
  }, []);

  // Request gyroscope permission (iOS)
  const requestGyroscopePermission = useCallback(async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permission === 'granted';
        setIsGyroscopePermissionGranted(granted);
        return granted;
      } catch {
        setIsGyroscopePermissionGranted(false);
        return false;
      }
    }
    // No permission needed
    setIsGyroscopePermissionGranted(true);
    return true;
  }, []);

  // Handle device orientation (gyroscope)
  useEffect(() => {
    if (!enabled || !isGyroscopeSupported || !isGyroscopePermissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      // Map ±30 degrees to -1 ~ 1
      const maxAngle = 30;
      const x = Math.max(-1, Math.min(1, gamma / maxAngle));
      const y = Math.max(-1, Math.min(1, (beta - 45) / maxAngle)); // 45° is "neutral" holding position

      targetOffset.current = { x, y };
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [enabled, isGyroscopeSupported, isGyroscopePermissionGranted]);

  // Handle mouse movement (desktop fallback)
  useEffect(() => {
    if (!enabled) return;
    // Only use mouse if gyroscope is not available or not permitted
    if (isGyroscopeSupported && isGyroscopePermissionGranted) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      // Map mouse position to -1 ~ 1 (relative to center)
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      targetOffset.current = { x, y };
    };

    const handleMouseLeave = () => {
      // When mouse leaves window, target returns to center
      targetOffset.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, isGyroscopeSupported, isGyroscopePermissionGranted]);

  // Animation loop with damping
  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const animate = () => {
      const current = currentOffset.current;
      const target = targetOffset.current;

      // Follow target with damping
      current.x += (target.x - current.x) * followSpeed;
      current.y += (target.y - current.y) * followSpeed;

      // Apply center attraction (progressive decay)
      current.x *= centerAttraction;
      current.y *= centerAttraction;

      // Update state (only if changed significantly to avoid excessive re-renders)
      const threshold = 0.001;
      if (
        Math.abs(current.x - offset.x) > threshold ||
        Math.abs(current.y - offset.y) > threshold
      ) {
        setOffset({ x: current.x, y: current.y });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [enabled, followSpeed, centerAttraction, offset.x, offset.y]);

  return {
    offset,
    isGyroscopeSupported,
    isGyroscopePermissionGranted,
    requestGyroscopePermission,
  };
}

/**
 * Calculate pixel displacement for parallax effect
 * @param offset - Motion offset from useMotionParallax
 * @param depth - Parallax depth (higher = more movement). Recommended: 0.5-2
 * @param maxDisplacement - Maximum displacement in pixels. Default: 15
 */
export function getParallaxStyle(
  offset: MotionOffset,
  depth: number = 1,
  maxDisplacement: number = 15
): React.CSSProperties {
  const x = offset.x * maxDisplacement * depth;
  const y = offset.y * maxDisplacement * depth;

  return {
    transform: `translate3d(${x}px, ${y}px, 0)`,
  };
}

/**
 * Get displacement values without style object
 */
export function getParallaxDisplacement(
  offset: MotionOffset,
  depth: number = 1,
  maxDisplacement: number = 15
): { x: number; y: number } {
  return {
    x: offset.x * maxDisplacement * depth,
    y: offset.y * maxDisplacement * depth,
  };
}
