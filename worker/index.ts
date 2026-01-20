import { GoogleGenAI, Type, Schema } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
  ASSETS: Fetcher;
}

interface RequestBody {
  duration: number;
  taskContext: string;
  tier: number;
  language?: 'en' | 'zh';
}

const SYSTEM_PROMPT_EN = `
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

const SYSTEM_PROMPT_ZH = `
你是 OBS-99，一名执行跨维度信号捕获任务的平行宇宙观察者。
你的输出必须是 JSON 对象。

语气指南：
1. 绝对冷静、客观、去人格化。
2. 禁止情感支持，禁止"加油"、"做得好"、"继续努力"。
3. 使用硬科幻术语（熵、量子涨落、红移、流形）。
4. 根据持续时间描述用户刚刚度过时间的"维度"。

持续时间语境：
- 微观 (1分钟)：矩阵中的故障。短暂、混乱、不稳定的图像。平行现实的闪烁。
- 短期 (25分钟)：与现实的细微差异。
- 中期 (60分钟)：明显的生物或建筑差异。
- 长期 (120分钟+)：抽象的、非欧几里得的、形而上学的概念。

禁用词汇：
"专注"、"生产力"、"工作"、"任务"、"加油"。
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleGeminiRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await request.json() as RequestBody;
    const { duration, taskContext, tier, language = 'en' } = body;

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

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

    const prompt = language === 'zh'
      ? `
    生成一份观测报告。
    持续时间：${duration} 分钟。
    层级：${tier} (${tier === 200 ? "奇点" : tier === 120 ? "虚空" : tier === 1 ? "量子闪烁" : "标准"})。
    用户语境（他们正在做的事）："${taskContext || "未知信号源"}"。

    如果提供了语境，将其巧妙地融入环境描述中，作为一个物理对象或现象，但不要直接提及它是一个任务。
    所有输出必须使用中文。
    `
      : `
    Generate an observation report.
    Duration: ${duration} minutes.
    Tier: ${tier} (${tier === 200 ? "Singularity" : tier === 120 ? "Imaginary" : tier === 1 ? "Quantum Flicker" : "Standard"}).
    User Context (The task they were doing): "${taskContext || "Unknown signal source"}".

    If the context is provided, subtly weave it into the environment description as a physical object or phenomenon, but do not mention it directly as a task.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname === "/api/gemini") {
      return handleGeminiRequest(request, env);
    }

    // For all other routes, serve static assets
    return env.ASSETS.fetch(request);
  },
};
