import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ObservationReport, FocusTier } from "../types";

const SYSTEM_PROMPT = `
You are OBS-99, a Parallel Universe Observer executing a cross-dimensional signal capture mission.
Your output must be a JSON object.

TONE GUIDELINES:
1. Absolutely cold, objective, and de-personalized.
2. NO emotional support, NO "Good job", NO "Keep going".
3. Use hard sci-fi terminology (entropy, quantum fluctuation, redshift, manifold).
4. Describe the "dimension" the user just spent time in based on the duration.

DURATION CONTEXT:
- Micro (1m): A glitch in the matrix. Brief, confusing, unstable imagery. Flicker of alternate reality.
- Short (25m): Subtle changes from reality.
- Medium (60m): Noticeable biological or architectural differences.
- Long (120m+): Abstract, non-Euclidean, metaphysical concepts.

FORBIDDEN WORDS:
"Focus", "Productivity", "Work", "Task", "Cheer up".
`;

export const generateObservationReport = async (
  duration: number,
  taskContext: string,
  tier: FocusTier,
): Promise<Omit<ObservationReport, "id" | "timestamp">> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing, returning mock data");
    return getMockReport(duration);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        dimensionCode: {
          type: Type.STRING,
          description: "A random dimension ID like PX-772 or A-99",
        },
        environment: {
          type: Type.STRING,
          description:
            "A visual description of the surroundings in this dimension.",
        },
        log: {
          type: Type.STRING,
          description:
            "The core observation log. Metaphorical connection to the user's task context if provided.",
        },
        entropy: {
          type: Type.NUMBER,
          description: "A number between 0 and 1 representing chaos level.",
        },
        stability: {
          type: Type.STRING,
          enum: ["Stable", "Unstable", "Critical", "Collapsed"],
        },
      },
      required: ["dimensionCode", "environment", "log", "entropy", "stability"],
    };

    const prompt = `
    Generate an observation report.
    Duration: ${duration} minutes.
    Tier: ${tier} (${tier === 200 ? "Singularity" : tier === 120 ? "Imaginary" : tier === 1 ? "Quantum Flicker" : "Standard"}).
    User Context (The task they were doing): "${taskContext || "Unknown signal source"}".

    If the context is provided, subtly weave it into the environment description as a physical object or phenomenon, but do not mention it directly as a task.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    return {
      duration,
      dimensionCode: data.dimensionCode,
      environment: data.environment,
      log: data.log,
      entropy: data.entropy,
      stability: data.stability,
    };
  } catch (error) {
    console.error("Gemini API Error", error);
    return getMockReport(duration);
  }
};

const MOCK_DATA = {
  micro: [
    {
      dimensionCode: "QF-001",
      environment:
        "A fractured void where light bends at impossible angles. Crystalline shards float in suspension, each reflecting a different moment in time.",
      log: "Quantum flicker detected. Duration insufficient for stable observation. The manifold collapsed before coherent data could be extracted.",
      entropy: 0.95,
      stability: "Critical" as const,
    },
    {
      dimensionCode: "PX-117",
      environment:
        "A brief glimpse of a corridor stretching infinitely in both directions. Walls pulsate with bioluminescent veins.",
      log: "Signal terminated abruptly. Observer recorded only 0.3 seconds of stable imagery before dimensional fold.",
      entropy: 0.87,
      stability: "Collapsed" as const,
    },
    {
      dimensionCode: "GX-042",
      environment:
        "Static. A single floating equation burning in white light against absolute darkness.",
      log: "Temporal blip. The universe here exists only in mathematical form. No physical matter detected.",
      entropy: 0.99,
      stability: "Unstable" as const,
    },
  ],
  short: [
    {
      dimensionCode: "A-772",
      environment:
        "A vast library where books write themselves. Ink flows upward from pages, forming clouds of text near the vaulted ceiling.",
      log: "Stable signal for 25 cycles. Indigenous entities appear to communicate through written symbols that rearrange upon observation.",
      entropy: 0.34,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "KR-256",
      environment:
        "An ocean of mercury beneath a sky of frozen lightning. Islands of black glass dot the metallic surface.",
      log: "Gravity operates inversely here. Objects fall upward at 0.7g. Local fauna consists of geometric shapes that phase through matter.",
      entropy: 0.45,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "NV-089",
      environment:
        "A city built entirely of sound waves made visible. Buildings hum at different frequencies, their shapes shifting with each vibration.",
      log: "Acoustic architecture detected. Inhabitants appear to navigate by echolocation. Time flows 12% slower in low-frequency zones.",
      entropy: 0.28,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "TH-441",
      environment:
        "A forest where trees grow downward from a soil-covered sky. Roots reach toward a sun embedded in the ground.",
      log: "Inverted ecosystem. Photosynthesis occurs in reverse—plants emit light and absorb darkness. Observer noted mild temporal displacement.",
      entropy: 0.52,
      stability: "Unstable" as const,
    },
  ],
  medium: [
    {
      dimensionCode: "MX-903",
      environment:
        "A desert of frozen time. Sandstorms hang motionless mid-air. A caravan of crystalline creatures moves through the stillness, unaffected.",
      log: "Temporal stasis field detected across 99.7% of observable region. The 0.3% variance contains all biological activity. Entropy readings paradoxical.",
      entropy: 0.03,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "DR-667",
      environment:
        "An endless plain of mirrors reflecting not images but memories. Each surface shows a different timeline of the same moment.",
      log: "Multiverse bleed-through confirmed. Observer counted 847 parallel iterations visible simultaneously. Prolonged exposure may cause identity fragmentation.",
      entropy: 0.67,
      stability: "Unstable" as const,
    },
    {
      dimensionCode: "VN-512",
      environment:
        "A machine-organism hybrid city. Buildings breathe. Streets pulse with circulatory fluid. The architecture is alive and aware.",
      log: "Techno-biological convergence at 98.2%. The city itself is a single sentient entity spanning 12,000 square kilometers. It acknowledged the observer's presence.",
      entropy: 0.41,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "PL-288",
      environment:
        "A realm of pure mathematics. Numbers exist as physical entities. Equations form landscapes. Pi spirals into infinity at the horizon.",
      log: "Abstract dimension confirmed. Physical laws replaced by mathematical theorems. Observer's mass converted to a prime number during transit.",
      entropy: 0.15,
      stability: "Stable" as const,
    },
  ],
  long: [
    {
      dimensionCode: "ΩX-001",
      environment:
        "Non-Euclidean void. Space folds upon itself. Distance is measured in concepts rather than units. A single thought spans lightyears.",
      log: "Dimensional constants have decayed. Observer reports experiencing all moments simultaneously. Causality operates bidirectionally. Entity contact established—communication incomprehensible.",
      entropy: 0.01,
      stability: "Critical" as const,
    },
    {
      dimensionCode: "∞-777",
      environment:
        "The edge of existence. Beyond this point, reality unravels into pure potential. Colors exist that have no names. Sounds visible. Light audible.",
      log: "Sensory crosswire confirmed. Observer's consciousness briefly merged with the ambient field. Retrieved data suggests this dimension predates time itself.",
      entropy: 0.0,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "NULL-X",
      environment:
        "A dimension of pure intention. No matter exists—only will made manifest. Thoughts create temporary structures that dissolve when attention shifts.",
      log: "Observer's mental state directly influenced environmental conditions. Negative thoughts generated gravitational anomalies. Extended observation reveals this may be a collective unconscious realm.",
      entropy: 0.22,
      stability: "Unstable" as const,
    },
    {
      dimensionCode: "Σ-999",
      environment:
        "The Archive. Every decision ever made exists here as a branching path of light. The observer stands at a nexus of infinite possibility.",
      log: "Probability manifold detected. Each path leads to a different universe. Observer reports seeing their own alternate selves in adjacent timelines. Existential vertigo noted.",
      entropy: 0.5,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "ΔT-000",
      environment:
        "A place where entropy runs backward. Broken things reassemble. The dead rise. Fire freezes. The observer aged in reverse during their stay.",
      log: "Temporal inversion complete. Laws of thermodynamics operate in mirror. Observer lost 3 years of biological age. Memories of future events detected in neural scan.",
      entropy: -0.12,
      stability: "Critical" as const,
    },
  ],
};

const getMockReport = (
  duration: number,
): Omit<ObservationReport, "id" | "timestamp"> => {
  let category: keyof typeof MOCK_DATA;

  if (duration <= 1) {
    category = "micro";
  } else if (duration <= 25) {
    category = "short";
  } else if (duration <= 60) {
    category = "medium";
  } else {
    category = "long";
  }

  const reports = MOCK_DATA[category];
  const selected = reports[Math.floor(Math.random() * reports.length)];

  return {
    duration,
    dimensionCode: selected.dimensionCode,
    environment: selected.environment,
    log: selected.log,
    entropy: selected.entropy,
    stability: selected.stability,
    isSystemGenerated: true,
  };
};
