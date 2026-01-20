import { ObservationReport, FocusTier } from "../types";

export type Language = 'en' | 'zh';

export const generateObservationReport = async (
  duration: number,
  taskContext: string,
  tier: FocusTier,
  language: Language = 'en',
): Promise<Omit<ObservationReport, "id" | "timestamp">> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        duration,
        taskContext,
        tier,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

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
    return getMockReport(duration, language);
  }
};

const MOCK_DATA_EN = {
  micro: [
    {
      dimensionCode: "QF-001",
      environment: "A fractured void where light bends at impossible angles. Crystalline shards float in suspension, each reflecting a different moment in time.",
      log: "Quantum flicker detected. Duration insufficient for stable observation. The manifold collapsed before coherent data could be extracted.",
      entropy: 0.95,
      stability: "Critical" as const,
    },
    {
      dimensionCode: "PX-117",
      environment: "A brief glimpse of a corridor stretching infinitely in both directions. Walls pulsate with bioluminescent veins.",
      log: "Signal terminated abruptly. Observer recorded only 0.3 seconds of stable imagery before dimensional fold.",
      entropy: 0.87,
      stability: "Collapsed" as const,
    },
    {
      dimensionCode: "GX-042",
      environment: "Static. A single floating equation burning in white light against absolute darkness.",
      log: "Temporal blip. The universe here exists only in mathematical form. No physical matter detected.",
      entropy: 0.99,
      stability: "Unstable" as const,
    },
  ],
  short: [
    {
      dimensionCode: "A-772",
      environment: "A vast library where books write themselves. Ink flows upward from pages, forming clouds of text near the vaulted ceiling.",
      log: "Stable signal for 25 cycles. Indigenous entities appear to communicate through written symbols that rearrange upon observation.",
      entropy: 0.34,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "KR-256",
      environment: "An ocean of mercury beneath a sky of frozen lightning. Islands of black glass dot the metallic surface.",
      log: "Gravity operates inversely here. Objects fall upward at 0.7g. Local fauna consists of geometric shapes that phase through matter.",
      entropy: 0.45,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "NV-089",
      environment: "A city built entirely of sound waves made visible. Buildings hum at different frequencies, their shapes shifting with each vibration.",
      log: "Acoustic architecture detected. Inhabitants appear to navigate by echolocation. Time flows 12% slower in low-frequency zones.",
      entropy: 0.28,
      stability: "Stable" as const,
    },
  ],
  medium: [
    {
      dimensionCode: "MX-903",
      environment: "A desert of frozen time. Sandstorms hang motionless mid-air. A caravan of crystalline creatures moves through the stillness, unaffected.",
      log: "Temporal stasis field detected across 99.7% of observable region. The 0.3% variance contains all biological activity. Entropy readings paradoxical.",
      entropy: 0.03,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "DR-667",
      environment: "An endless plain of mirrors reflecting not images but memories. Each surface shows a different timeline of the same moment.",
      log: "Multiverse bleed-through confirmed. Observer counted 847 parallel iterations visible simultaneously. Prolonged exposure may cause identity fragmentation.",
      entropy: 0.67,
      stability: "Unstable" as const,
    },
    {
      dimensionCode: "VN-512",
      environment: "A machine-organism hybrid city. Buildings breathe. Streets pulse with circulatory fluid. The architecture is alive and aware.",
      log: "Techno-biological convergence at 98.2%. The city itself is a single sentient entity spanning 12,000 square kilometers. It acknowledged the observer's presence.",
      entropy: 0.41,
      stability: "Stable" as const,
    },
  ],
  long: [
    {
      dimensionCode: "ΩX-001",
      environment: "Non-Euclidean void. Space folds upon itself. Distance is measured in concepts rather than units. A single thought spans lightyears.",
      log: "Dimensional constants have decayed. Observer reports experiencing all moments simultaneously. Causality operates bidirectionally. Entity contact established—communication incomprehensible.",
      entropy: 0.01,
      stability: "Critical" as const,
    },
    {
      dimensionCode: "∞-777",
      environment: "The edge of existence. Beyond this point, reality unravels into pure potential. Colors exist that have no names. Sounds visible. Light audible.",
      log: "Sensory crosswire confirmed. Observer's consciousness briefly merged with the ambient field. Retrieved data suggests this dimension predates time itself.",
      entropy: 0.0,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "Σ-999",
      environment: "The Archive. Every decision ever made exists here as a branching path of light. The observer stands at a nexus of infinite possibility.",
      log: "Probability manifold detected. Each path leads to a different universe. Observer reports seeing their own alternate selves in adjacent timelines. Existential vertigo noted.",
      entropy: 0.5,
      stability: "Stable" as const,
    },
  ],
};

const MOCK_DATA_ZH = {
  micro: [
    {
      dimensionCode: "量闪-001",
      environment: "破碎的虚空，光线以不可能的角度弯曲。悬浮的晶体碎片各自映射着不同的时间片段。",
      log: "检测到量子闪烁。持续时间不足以维持稳定观测。流形在提取连贯数据前已坍缩。",
      entropy: 0.95,
      stability: "Critical" as const,
    },
    {
      dimensionCode: "相位-117",
      environment: "短暂一瞥：一条向两端无限延伸的走廊。墙壁上生物发光的脉络在搏动。",
      log: "信号突然中断。观察者仅记录到0.3秒的稳定图像，随后维度折叠。",
      entropy: 0.87,
      stability: "Collapsed" as const,
    },
    {
      dimensionCode: "虚数-042",
      environment: "静止。一个燃烧着白光的方程式漂浮在绝对黑暗中。",
      log: "时间涟漪。此处宇宙仅以数学形式存在。未检测到物质实体。",
      entropy: 0.99,
      stability: "Unstable" as const,
    },
  ],
  short: [
    {
      dimensionCode: "墨渊-772",
      environment: "一座巨大的图书馆，书籍在自我书写。墨水从书页向上流淌，在穹顶附近形成文字云。",
      log: "信号稳定持续25周期。原住实体似乎通过观察时会重新排列的书写符号进行交流。",
      entropy: 0.34,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "镜海-256",
      environment: "水银之海，头顶是凝固的闪电组成的天空。黑色玻璃岛屿点缀在金属表面上。",
      log: "重力在此反向运作。物体以0.7g向上坠落。本地生物群由能穿透物质的几何形状组成。",
      entropy: 0.45,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "声城-089",
      environment: "一座完全由可视化声波构成的城市。建筑以不同频率嗡鸣，形态随每次振动而变化。",
      log: "检测到声学建筑。居民似乎通过回声定位导航。低频区域时间流速减缓12%。",
      entropy: 0.28,
      stability: "Stable" as const,
    },
  ],
  medium: [
    {
      dimensionCode: "冻时-903",
      environment: "时间冻结的沙漠。沙暴悬停在半空。一支晶体生物组成的商队穿行于静止之中，不受影响。",
      log: "检测到时间静止场覆盖99.7%可观测区域。0.3%的偏差区包含所有生物活动。熵值读数自相矛盾。",
      entropy: 0.03,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "镜原-667",
      environment: "无尽的镜面平原，映射的不是图像而是记忆。每个表面展示同一时刻的不同时间线。",
      log: "确认多元宇宙渗透。观察者同时计数到847个平行迭代可见。长时间暴露可能导致身份碎片化。",
      entropy: 0.67,
      stability: "Unstable" as const,
    },
    {
      dimensionCode: "机生-512",
      environment: "机械-有机体混合城市。建筑在呼吸。街道脉动着循环液。建筑是活的，且有意识。",
      log: "技术-生物融合度98.2%。城市本身是一个横跨12000平方公里的单一智慧实体。它承认了观察者的存在。",
      entropy: 0.41,
      stability: "Stable" as const,
    },
  ],
  long: [
    {
      dimensionCode: "欧米伽-001",
      environment: "非欧几里得虚空。空间自我折叠。距离以概念而非单位衡量。一个念头跨越光年。",
      log: "维度常数已衰变。观察者报告同时经历所有时刻。因果律双向运作。已建立实体接触——通讯无法理解。",
      entropy: 0.01,
      stability: "Critical" as const,
    },
    {
      dimensionCode: "无穷-777",
      environment: "存在的边缘。越过此点，现实分解为纯粹的潜能。存在没有名字的颜色。声音可见。光线可听。",
      log: "确认感官交叉。观察者意识短暂与环境场融合。回收数据表明此维度早于时间本身。",
      entropy: 0.0,
      stability: "Stable" as const,
    },
    {
      dimensionCode: "档案-999",
      environment: "档案馆。每一个曾做出的决定都以光之分支路径存在于此。观察者站在无限可能的交汇点。",
      log: "检测到概率流形。每条路径通向不同的宇宙。观察者报告在相邻时间线看到自己的替代版本。记录存在性眩晕。",
      entropy: 0.5,
      stability: "Stable" as const,
    },
  ],
};

const getMockReport = (
  duration: number,
  language: Language = 'en',
): Omit<ObservationReport, "id" | "timestamp"> => {
  const MOCK_DATA = language === 'zh' ? MOCK_DATA_ZH : MOCK_DATA_EN;
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
