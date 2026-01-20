import React, { createContext, useContext, ReactNode } from 'react';
import {
  useMotionParallax,
  UseMotionParallaxReturn,
} from '../hooks/useMotionParallax';

const MotionParallaxContext = createContext<UseMotionParallaxReturn | null>(null);

interface MotionParallaxProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function MotionParallaxProvider({
  children,
  enabled = true,
}: MotionParallaxProviderProps) {
  const motion = useMotionParallax({ enabled });

  return (
    <MotionParallaxContext.Provider value={motion}>
      {children}
    </MotionParallaxContext.Provider>
  );
}

export function useMotionParallaxContext(): UseMotionParallaxReturn {
  const context = useContext(MotionParallaxContext);
  if (!context) {
    throw new Error(
      'useMotionParallaxContext must be used within a MotionParallaxProvider'
    );
  }
  return context;
}

/**
 * GPU-accelerated Parallax wrapper component
 * Uses CSS Custom Properties for 60fps animation without React re-renders
 */
interface ParallaxLayerProps {
  children: ReactNode;
  depth?: number;
  maxDisplacement?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

export function ParallaxLayer({
  children,
  depth = 1,
  maxDisplacement = 20,
  className,
  style,
  as: Component = 'div',
}: ParallaxLayerProps) {
  // CSS calc() with CSS Custom Properties = GPU-accelerated, no re-renders
  const parallaxStyle: React.CSSProperties = {
    transform: `translate3d(
      calc(var(--parallax-x, 0) * ${maxDisplacement * depth}px),
      calc(var(--parallax-y, 0) * ${maxDisplacement * depth}px),
      0
    )`,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    // @ts-ignore - vendor prefix for Safari
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <Component
      className={className}
      style={{
        ...style,
        ...parallaxStyle,
      }}
    >
      {children}
    </Component>
  );
}
