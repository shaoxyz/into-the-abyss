import React, { useState } from "react";
import { ObservationReport, FocusTier } from "../types";
import { useI18n, useTierConfig } from "../contexts/I18nContext";

interface ArchiveViewProps {
  archive: ObservationReport[];
  onBack: () => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ archive, onBack }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { t } = useI18n();
  const TIER_CONFIG = useTierConfig();

  return (
    <div className="relative z-10 min-h-screen p-4 md:p-16 w-full max-w-7xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div
        className="flex justify-between items-end mb-8 md:mb-12 pb-4 md:pb-6 sticky top-0 z-20 pt-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--background) 90%, transparent)",
        }}
      >
        <div>
          <h1 className="font-display text-2xl md:text-4xl text-white mb-2 tracking-widest uppercase">
            {t('archive.title')}
          </h1>
          <p
            className="font-mono text-[10px] md:text-xs tracking-[0.2em]"
            style={{ color: "var(--muted)" }}
          >
            {t('archive.subtitle')} {archive.length}
          </p>
        </div>
        {/* Back Button - Ghost Style */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 font-mono text-xs uppercase transition-all duration-200 px-4 py-2"
          style={{
            background: `linear-gradient(
              135deg,
              color-mix(in srgb, var(--surface-elevated) 60%, transparent) 0%,
              color-mix(in srgb, var(--surface-elevated) 40%, transparent) 100%
            )`,
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            color: "var(--primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span className="hidden md:inline opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
            ←
          </span>
          {t('button.return')}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
        {archive.map((item) => {
          // Resolve Tier Color
          const tier =
            item.duration >= 200
              ? FocusTier.SINGULARITY
              : item.duration >= 120
                ? FocusTier.IMAGINARY
                : item.duration >= 60
                  ? FocusTier.MIRROR_RIFT
                  : item.duration >= 25
                    ? FocusTier.NEIGHBORING
                    : FocusTier.QUANTUM_FLICKER;
          const config = TIER_CONFIG[tier];
          const isHovered = hoveredCard === item.id;

          // Get tier CSS variable
          const tierVar =
            tier === FocusTier.QUANTUM_FLICKER
              ? "--tier-quantum"
              : tier === FocusTier.NEIGHBORING
                ? "--tier-neighboring"
                : tier === FocusTier.MIRROR_RIFT
                  ? "--tier-mirror"
                  : tier === FocusTier.IMAGINARY
                    ? "--tier-imaginary"
                    : "--tier-singularity";

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative transition-all duration-300 cursor-pointer"
              style={{
                background: `linear-gradient(
                  145deg,
                  color-mix(in srgb, var(--surface) ${isHovered ? "115%" : "108%"}, white) 0%,
                  var(--surface) 50%,
                  color-mix(in srgb, var(--surface) ${isHovered ? "80%" : "88%"}, black) 100%
                )`,
                boxShadow: isHovered
                  ? `0 12px 40px rgba(0, 0, 0, 0.5),
                     0 4px 12px rgba(0, 0, 0, 0.3),
                     inset 0 1px 0 rgba(255, 255, 255, 0.1),
                     inset 0 -1px 0 rgba(0, 0, 0, 0.15)`
                  : `0 4px 16px rgba(0, 0, 0, 0.3),
                     inset 0 1px 0 rgba(255, 255, 255, 0.05),
                     inset 0 -1px 0 rgba(0, 0, 0, 0.1)`,
                borderRadius: "var(--radius-default)",
                border: "1px solid var(--border)",
                padding: "20px",
                transform: isHovered
                  ? "translateY(-4px) scale(1.01)"
                  : "translateY(0) scale(1)",
              }}
            >
              {/* Top Accent Bar - Tier Color Gradient */}
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent, var(${tierVar}), transparent)`,
                  borderRadius:
                    "var(--radius-default) var(--radius-default) 0 0",
                }}
              ></div>

              {/* Metadata */}
              <div
                className="flex justify-between items-start mb-4 md:mb-5 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                <div className="flex flex-col">
                  <span className={`font-bold text-lg ${config.color}`}>
                    {item.dimensionCode}
                  </span>
                  <span>{config.name}</span>
                </div>
                <div className="text-right">
                  <div>{new Date(item.timestamp).toLocaleDateString()}</div>
                  <div className="opacity-50">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4 md:mb-5 relative">
                {/* Left Border Accent */}
                <div
                  className="absolute -left-2 top-0 bottom-0 w-[2px] transition-colors"
                  style={{
                    background: isHovered
                      ? `linear-gradient(180deg, var(${tierVar}), transparent)`
                      : "var(--border)",
                  }}
                ></div>
                <p
                  className="font-serif-literary italic text-sm leading-relaxed pl-4 line-clamp-4 transition-colors"
                  style={{ color: isHovered ? "white" : "var(--foreground)" }}
                >
                  "{item.log}"
                </p>
              </div>

              {/* Footer Specs */}
              <div
                className="flex justify-between items-center pt-4 mt-auto"
                style={{
                  borderTop:
                    "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                }}
              >
                {/* Spec Badges - Inset Style */}
                <div className="flex gap-2 text-[10px] font-mono">
                  <span
                    className="px-2 py-1"
                    style={{
                      background: `linear-gradient(
                          180deg,
                          color-mix(in srgb, var(--background) 100%, black) 0%,
                          var(--background) 100%
                        )`,
                      boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.3)`,
                      borderRadius: "0",
                      border:
                        "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                      color: "var(--muted)",
                    }}
                  >
                    Δt: {item.duration}m
                  </span>
                  <span
                    className="px-2 py-1"
                    style={{
                      background: `linear-gradient(
                          180deg,
                          color-mix(in srgb, var(--background) 100%, black) 0%,
                          var(--background) 100%
                        )`,
                      boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.3)`,
                      borderRadius: "0",
                      border:
                        "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                      color: "var(--muted)",
                    }}
                  >
                    ENT: {item.entropy.toFixed(2)}
                  </span>
                </div>
                {/* Status Badge - Raised Style */}
                <div
                  className="text-[10px] font-bold font-mono px-2 py-1"
                  style={{
                    background:
                      item.stability === "Stable"
                        ? `linear-gradient(135deg, var(--tier-quantum) 0%, color-mix(in srgb, var(--tier-quantum) 70%, black) 100%)`
                        : `linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 70%, black) 100%)`,
                    boxShadow:
                      item.stability === "Stable"
                        ? `0 2px 6px color-mix(in srgb, var(--tier-quantum) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)`
                        : `0 2px 6px color-mix(in srgb, var(--destructive) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    borderRadius: "0",
                    color: "white",
                  }}
                >
                  {item.stability}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArchiveView;
