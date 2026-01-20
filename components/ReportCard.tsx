import React, { useState } from "react";
import { ObservationReport, FocusTier } from "../types";
import { useI18n, useTierConfig } from "../contexts/I18nContext";

interface ReportCardProps {
  report: ObservationReport;
  onClose: () => void;
}

// Primary Button Style
const primaryButtonStyle = {
  background: `linear-gradient(
    135deg,
    #ffffff 0%,
    #f8fafc 30%,
    #e2e8f0 100%
  )`,
  boxShadow: `
    0 4px 16px rgba(255, 255, 255, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05)
  `,
  borderRadius: "var(--radius-default)",
};

const primaryButtonHoverStyle = {
  ...primaryButtonStyle,
  boxShadow: `
    0 6px 24px rgba(255, 255, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.08)
  `,
  transform: "scale(1.02)",
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onClose }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { t } = useI18n();
  const TIER_CONFIG = useTierConfig();

  // Determine tier styles based on duration
  const tier =
    report.duration >= 200
      ? FocusTier.SINGULARITY
      : report.duration >= 120
        ? FocusTier.IMAGINARY
        : report.duration >= 60
          ? FocusTier.MIRROR_RIFT
          : report.duration >= 25
            ? FocusTier.NEIGHBORING
            : FocusTier.QUANTUM_FLICKER;

  const config = TIER_CONFIG[tier];

  return (
    <div className="relative z-50 max-w-3xl w-full mx-4 animate-in fade-in zoom-in duration-700">
      {/* Outer Glow Effect */}
      <div
        className="absolute -inset-2 blur-2xl opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)`,
        }}
      ></div>

      {/* Card Container - Neumorphic Raised */}
      <div
        className="relative"
        style={{
          background: `linear-gradient(
            145deg,
            color-mix(in srgb, var(--background) 115%, #1a1a2e) 0%,
            var(--background) 50%,
            color-mix(in srgb, var(--background) 90%, black) 100%
          )`,
          boxShadow: `
            0 16px 48px rgba(0, 0, 0, 0.6),
            0 4px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2)
          `,
          borderRadius: "var(--radius-xl)",
          padding: "4px",
        }}
      >
        {/* Inner Border Frame */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(
              180deg,
              color-mix(in srgb, var(--surface) 90%, transparent) 0%,
              var(--surface) 100%
            )`,
            borderRadius: "calc(var(--radius-xl) - 4px)",
            border:
              "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
            padding: "24px",
          }}
        >
          {/* Background Texture */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Decorative Corners */}
          <div
            className="neu-corner top-left"
            style={{ top: 12, left: 12 }}
          ></div>
          <div
            className="neu-corner top-right"
            style={{ top: 12, right: 12 }}
          ></div>
          <div
            className="neu-corner bottom-left"
            style={{ bottom: 12, left: 12 }}
          ></div>
          <div
            className="neu-corner bottom-right"
            style={{ bottom: 12, right: 12 }}
          ></div>

          {/* Header Data */}
          <div
            className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-10 pb-6 font-mono text-xs tracking-widest uppercase relative z-10 gap-4 md:gap-0"
            style={{
              borderBottom: "2px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold text-2xl md:text-3xl font-display tracking-normal">
                {report.dimensionCode}
              </span>
              <span className={`${config.color} font-bold`}>
                // {config.name}
              </span>
            </div>
            <div className="text-left md:text-right flex flex-row md:flex-col gap-2 flex-wrap">
              {/* Entropy Badge - Inset Style */}
              <div
                className="px-3 py-1 whitespace-nowrap"
                style={{
                  background: `linear-gradient(
                    180deg,
                    color-mix(in srgb, var(--background) 100%, black) 0%,
                    var(--background) 100%
                  )`,
                  boxShadow: `
                    inset 0 2px 4px rgba(0, 0, 0, 0.4),
                    0 1px 0 rgba(255, 255, 255, 0.03)
                  `,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                {t('report.entropy')}{" "}
                <span className="text-white">{report.entropy.toFixed(4)}</span>
              </div>
              {/* Status Badge - Neumorphic Raised */}
              <div
                className="px-3 py-1 whitespace-nowrap font-bold"
                style={{
                  background:
                    report.stability === "Stable"
                      ? `linear-gradient(135deg, var(--tier-quantum) 0%, color-mix(in srgb, var(--tier-quantum) 70%, black) 100%)`
                      : `linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 70%, black) 100%)`,
                  boxShadow:
                    report.stability === "Stable"
                      ? `0 2px 8px color-mix(in srgb, var(--tier-quantum) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)`
                      : `0 2px 8px color-mix(in srgb, var(--destructive) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  borderRadius: "var(--radius-sm)",
                  color: "white",
                }}
              >
                {t('report.integrity')} {report.stability}
              </div>
            </div>
          </div>

          {/* Main Narrative - Blur Reveal */}
          <div className="mb-8 md:mb-12 animate-blur-reveal relative z-10">
            <div className="flex items-baseline gap-4 mb-4">
              <h3
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                {t('report.visualFeed')}
              </h3>
              <div
                className="h-[1px] flex-1"
                style={{ background: "var(--border)" }}
              ></div>
            </div>
            <p
              className="font-serif-literary text-lg md:text-xl leading-relaxed mb-8 italic pl-4 md:pl-6"
              style={{
                color: "var(--foreground)",
                borderLeft: "2px solid var(--border)",
              }}
            >
              "{report.environment}"
            </p>

            <div className="flex items-baseline gap-4 mb-4">
              <h3
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                {t('report.observerLog')}
              </h3>
              <div
                className="h-[1px] flex-1"
                style={{ background: "var(--border)" }}
              ></div>
            </div>
            <p
              className="font-serif-literary text-xl md:text-2xl text-white leading-relaxed pl-4 md:pl-6"
              style={{ borderLeft: "2px solid var(--border)" }}
            >
              {report.log}
            </p>
          </div>

          {/* Footer / Actions */}
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 relative z-10"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div
              className="text-[10px] font-mono w-full text-center md:text-left"
              style={{ color: "var(--muted)" }}
            >
              {t('report.refId')} {report.id.substring(0, 12).toUpperCase()} <br />
              {t('report.timestamp')} {new Date(report.timestamp).toISOString()}
            </div>

            {/* Primary Action Button - Neumorphic */}
            <button
              onClick={onClose}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="w-full md:w-auto group relative overflow-hidden px-8 py-3 text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200"
              style={
                isButtonHovered ? primaryButtonHoverStyle : primaryButtonStyle
              }
            >
              <span className="relative z-10">{t('button.secureData')}</span>
              <div
                className="absolute inset-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--primary) 15%, transparent) 100%)",
                }}
              ></div>
            </button>
          </div>

          {/* Stamp Effect */}
          <div
            className="hidden md:flex absolute bottom-10 right-10 w-32 h-32 items-center justify-center opacity-15 pointer-events-none rotate-[-15deg]"
            style={{ border: "4px solid var(--border)" }}
          >
            <span className="font-display font-bold text-xs text-center uppercase leading-none">
              {t('report.official')}
              <br />
              {t('report.record')}
              <br />
              OBS-99
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
