import React, { createContext, useContext, ReactNode } from 'react';
import {
  useMotionParallax,
  UseMotionParallaxReturn,
  MotionOffset,
  getParallaxStyle,
  getParallaxDisplacement,
} from '../hooks/useMotionParallax';

interface MotionParallaxContextValue extends UseMotionParallaxReturn {
  getStyle: (depth?: number, maxDisplacement?: number) => React.CSSProperties;
  getDisplacement: (depth?: number, maxDisplacement?: number) => { x: number; y: number };
}

const MotionParallaxContext = createContext<MotionParallaxContextValue | null>(null);

interface MotionParallaxProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function MotionParallaxProvider({
  children,
  enabled = true,
}: MotionParallaxProviderProps) {
  const motion = useMotionParallax({ enabled });

  const getStyle = (depth: number = 1, maxDisplacement: number = 15) => {
    return getParallaxStyle(motion.offset, depth, maxDisplacement);
  };

  const getDisplacement = (depth: number = 1, maxDisplacement: number = 15) => {
    return getParallaxDisplacement(motion.offset, depth, maxDisplacement);
  };

  const value: MotionParallaxContextValue = {
    ...motion,
    getStyle,
    getDisplacement,
  };

  return (
    <MotionParallaxContext.Provider value={value}>
      {children}
    </MotionParallaxContext.Provider>
  );
}

export function useMotionParallaxContext(): MotionParallaxContextValue {
  const context = useContext(MotionParallaxContext);
  if (!context) {
    throw new Error(
      'useMotionParallaxContext must be used within a MotionParallaxProvider'
    );
  }
  return context;
}

/**
 * Parallax wrapper component for easy use
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
  maxDisplacement = 15,
  className,
  style,
  as: Component = 'div',
}: ParallaxLayerProps) {
  const { getStyle } = useMotionParallaxContext();
  const parallaxStyle = getStyle(depth, maxDisplacement);

  return (
    <Component
      className={className}
      style={{
        ...style,
        ...parallaxStyle,
        willChange: 'transform',
      }}
    >
      {children}
    </Component>
  );
}
