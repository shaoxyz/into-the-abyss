import { GoogleGenAI, Type, Schema } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
}

interface RequestBody {
  duration: number;
  taskContext: string;
  tier: number;
}

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json() as RequestBody;
    const { duration, taskContext, tier } = body;

    const ai = new GoogleGenAI({ apiKey });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        dimensionCode: {
          type: Type.STRING,
          description: "A random dimension ID like PX-772 or A-99",
        },
        environment: {
          type: Type.STRING,
          description: "A visual description of the surroundings in this dimension.",
        },
        log: {
          type: Type.STRING,
          description: "The core observation log. Metaphorical connection to the user's task context if provided.",
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
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text);

    return new Response(
      JSON.stringify({
        duration,
        dimensionCode: data.dimensionCode,
        environment: data.environment,
        log: data.log,
        entropy: data.entropy,
        stability: data.stability,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate report" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
