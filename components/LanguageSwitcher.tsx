import React from 'react';
import { useI18n, Language } from '../contexts/I18nContext';

const ghostButtonStyle = {
  background: `linear-gradient(
    135deg,
    color-mix(in srgb, var(--surface-elevated) 60%, transparent) 0%,
    color-mix(in srgb, var(--surface-elevated) 40%, transparent) 100%
  )`,
  boxShadow: `
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05)
  `,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="font-mono text-[10px] md:text-xs uppercase tracking-widest px-3 py-2 transition-all duration-200"
      style={{
        ...ghostButtonStyle,
        color: 'var(--muted)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.borderColor = 'var(--border-light)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--muted)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      [{language === 'en' ? '中文' : 'EN'}]
    </button>
  );
};

export default LanguageSwitcher;
