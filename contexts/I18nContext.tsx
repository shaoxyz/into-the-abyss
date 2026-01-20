import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LOCAL_STORAGE_KEY = 'gazing_abyss_lang';

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // App title
    'app.title': 'Into the Abyss',
    'app.title.prefix': 'Into the',
    'app.title.accent': 'Abyss',
    'app.subtitle': 'Temporal Observation Interface // OBS-99',

    // Tier names and descriptions
    'tier.quantum.name': 'Quantum Flicker',
    'tier.quantum.desc': 'Momentary phase shift. Rapid instability.',
    'tier.neighboring.name': 'Neighboring Dimension',
    'tier.neighboring.desc': 'Minimal deviation. Minor physical anomalies.',
    'tier.mirror.name': 'Mirror Rift',
    'tier.mirror.desc': 'High anomalies. Biological divergence detected.',
    'tier.imaginary.name': 'Imaginary Horizon',
    'tier.imaginary.desc': 'Physics breakdown. Abstract existence.',
    'tier.singularity.name': 'Singularity Prime',
    'tier.singularity.desc': 'Total reality collapse. The end of meaning.',

    // Buttons and actions
    'button.initialize': 'Initialize Sequence',
    'button.abort': '[ Emergency Abort ]',
    'button.return': 'Return',
    'button.mute': 'MUTE',
    'button.unmute': 'UNMUTE',
    'button.enableMotion': 'Enable Motion Effects',
    'button.secureData': 'Secure Data & Return',
    'button.accessArchives': 'Access Archives',

    // Status messages
    'status.ready': 'System Ready. Awaiting coordinates.',
    'status.liveSignal': '● Live Signal Feed',
    'status.timeDilation': 'TIME DILATION IN PROGRESS',
    'status.decrypting': 'DECRYPTING TELEMETRY...',
    'status.signalLost': 'SIGNAL LOST',
    'status.signalLostDesc': 'Phase alignment failed. Coordinates dropped.',

    // Terminal
    'terminal.title': '// Order_Management_Terminal',
    'terminal.placeholder': 'Input directive...',
    'terminal.empty': 'No active directives.',
    'terminal.record': 'REC',

    // Archive
    'archive.title': 'Deep Storage',
    'archive.subtitle': '// RECOVERED_DIMENSIONAL_ARTIFACTS:',

    // Report
    'report.visualFeed': 'Visual_Feed',
    'report.observerLog': 'Observer_Log',
    'report.entropy': 'ENTROPY:',
    'report.integrity': 'INTEGRITY:',
    'report.refId': 'REF_ID:',
    'report.timestamp': 'TIMESTAMP:',
    'report.official': 'Official',
    'report.record': 'Record',

    // Units
    'unit.min': 'MIN',
  },
  zh: {
    // App title
    'app.title': '凝视深渊',
    'app.title.prefix': '凝视',
    'app.title.accent': '深渊',
    'app.subtitle': '时间观测接口 // OBS-99',

    // Tier names and descriptions
    'tier.quantum.name': '量子闪烁',
    'tier.quantum.desc': '瞬时相位偏移，快速不稳定。',
    'tier.neighboring.name': '邻近维度',
    'tier.neighboring.desc': '最小偏差，轻微物理异常。',
    'tier.mirror.name': '镜像裂隙',
    'tier.mirror.desc': '高度异常，检测到生物分歧。',
    'tier.imaginary.name': '虚空地平线',
    'tier.imaginary.desc': '物理崩溃，抽象存在。',
    'tier.singularity.name': '奇点本源',
    'tier.singularity.desc': '现实全面崩塌，意义的终结。',

    // Buttons and actions
    'button.initialize': '启动序列',
    'button.abort': '[ 紧急中止 ]',
    'button.return': '返回',
    'button.mute': '静音',
    'button.unmute': '取消静音',
    'button.enableMotion': '启用动态效果',
    'button.secureData': '保存数据并返回',
    'button.accessArchives': '访问档案库',

    // Status messages
    'status.ready': '系统就绪，等待坐标输入。',
    'status.liveSignal': '● 实时信号馈送',
    'status.timeDilation': '时间膨胀进行中',
    'status.decrypting': '正在解密遥测数据...',
    'status.signalLost': '信号丢失',
    'status.signalLostDesc': '相位对齐失败，坐标丢失。',

    // Terminal
    'terminal.title': '// 指令管理终端',
    'terminal.placeholder': '输入指令...',
    'terminal.empty': '暂无活动指令。',
    'terminal.record': '记录',

    // Archive
    'archive.title': '深层存储',
    'archive.subtitle': '// 已恢复的维度文物：',

    // Report
    'report.visualFeed': '视觉馈送',
    'report.observerLog': '观察者日志',
    'report.entropy': '熵值：',
    'report.integrity': '完整性：',
    'report.refId': '参考编号：',
    'report.timestamp': '时间戳：',
    'report.official': '官方',
    'report.record': '记录',

    // Units
    'unit.min': '分钟',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as Language | null;
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Helper hook for tier config with translations
export const useTierConfig = () => {
  const { t } = useI18n();

  return {
    1: { name: t('tier.quantum.name'), color: 'text-emerald-400', desc: t('tier.quantum.desc') },
    25: { name: t('tier.neighboring.name'), color: 'text-cyan-400', desc: t('tier.neighboring.desc') },
    60: { name: t('tier.mirror.name'), color: 'text-blue-400', desc: t('tier.mirror.desc') },
    120: { name: t('tier.imaginary.name'), color: 'text-purple-400', desc: t('tier.imaginary.desc') },
    200: { name: t('tier.singularity.name'), color: 'text-fuchsia-500', desc: t('tier.singularity.desc') },
  };
};
