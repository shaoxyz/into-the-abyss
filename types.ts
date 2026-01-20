export enum AppState {
  IDLE = 'IDLE',
  FOCUSING = 'FOCUSING',
  PROCESSING = 'PROCESSING', // Analyzing dimension...
  REPORT = 'REPORT',
  SIGNAL_LOST = 'SIGNAL_LOST',
  ARCHIVE = 'ARCHIVE'
}

export enum FocusTier {
  QUANTUM_FLICKER = 1, // 1 min
  NEIGHBORING = 25, // 25 min
  MIRROR_RIFT = 60, // 60 min
  IMAGINARY = 120, // 120 min
  SINGULARITY = 200 // 200 min
}

export interface ObservationReport {
  id: string;
  timestamp: number;
  duration: number; // in minutes
  dimensionCode: string; // e.g., PX-772
  environment: string; // Visual description
  log: string; // The narrative
  entropy: number; // 0.0 to 1.0
  stability: 'Stable' | 'Unstable' | 'Critical' | 'Collapsed';
  isSystemGenerated?: boolean; // If it was a failure fallback
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: boolean;
}

export const TIER_CONFIG: Record<FocusTier, { name: string; color: string; desc: string }> = {
  [FocusTier.QUANTUM_FLICKER]: { name: "Quantum Flicker", color: "text-emerald-400", desc: "Momentary phase shift. Rapid instability." },
  [FocusTier.NEIGHBORING]: { name: "Neighboring Dimension", color: "text-cyan-400", desc: "Minimal deviation. Minor physical anomalies." },
  [FocusTier.MIRROR_RIFT]: { name: "Mirror Rift", color: "text-blue-400", desc: "High anomalies. Biological divergence detected." },
  [FocusTier.IMAGINARY]: { name: "Imaginary Horizon", color: "text-purple-400", desc: "Physics breakdown. Abstract existence." },
  [FocusTier.SINGULARITY]: { name: "Singularity Prime", color: "text-fuchsia-500", desc: "Total reality collapse. The end of meaning." },
};