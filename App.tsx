import React, { useState, useEffect, useRef } from "react";
import { AppState, FocusTier, ObservationReport, Task } from "./types";
import StarTunnel from "./components/StarTunnel";
import Terminal from "./components/Terminal";
import ReportCard from "./components/ReportCard";
import ArchiveView from "./components/ArchiveView";
import AudioAmbience from "./components/AudioAmbience";
import SpaceMusic from "./components/SpaceMusic";
import AbyssPulse from "./components/AbyssPulse";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { generateObservationReport } from "./services/geminiService";
import {
  MotionParallaxProvider,
  ParallaxLayer,
  useMotionParallaxContext,
} from "./contexts/MotionParallaxContext";
import { I18nProvider, useI18n, useTierConfig } from "./contexts/I18nContext";

// Constants
const LOCAL_STORAGE_KEY_ARCHIVE = "4th_dim_archive";
const LOCAL_STORAGE_KEY_TASKS = "4th_dim_tasks";

// Tier Button Styles
const getTierButtonStyle = (isSelected: boolean, tierColor: string) => {
  const baseStyle = {
    background: isSelected
      ? `linear-gradient(
          145deg,
          color-mix(in srgb, var(--surface-elevated) 115%, white) 0%,
          var(--surface-elevated) 50%,
          color-mix(in srgb, var(--surface-elevated) 75%, black) 100%
        )`
      : `linear-gradient(
          145deg,
          color-mix(in srgb, var(--surface) 108%, white) 0%,
          var(--surface) 50%,
          color-mix(in srgb, var(--surface) 85%, black) 100%
        )`,
    boxShadow: isSelected
      ? `0 0 0 2px rgba(255, 255, 255, 0.15),
         0 8px 24px rgba(0, 0, 0, 0.5),
         inset 0 1px 0 rgba(255, 255, 255, 0.12),
         inset 0 -1px 0 rgba(0, 0, 0, 0.2)`
      : `0 4px 16px rgba(0, 0, 0, 0.3),
         inset 0 1px 0 rgba(255, 255, 255, 0.05),
         inset 0 -1px 0 rgba(0, 0, 0, 0.2)`,
    borderRadius: "var(--radius-default)",
    border: isSelected
      ? "1px solid rgba(255, 255, 255, 0.15)"
      : "1px solid var(--border)",
    transition: "all 0.2s ease",
  };
  return baseStyle;
};

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

// Ghost Button Style
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
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
};

// Inner App Component (needs context)
const AppContent: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedTier, setSelectedTier] = useState<FocusTier>(
    FocusTier.NEIGHBORING,
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [archive, setArchive] = useState<ObservationReport[]>([]);
  const [currentReport, setCurrentReport] = useState<ObservationReport | null>(
    null,
  );
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Button hover states
  const [isStartHovered, setIsStartHovered] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  // Refs for timer logic
  const timerRef = useRef<number | null>(null);
  const generatedRef = useRef<boolean>(false);

  // Get parallax context for UI elements
  const {
    isGyroscopeSupported,
    isGyroscopePermissionGranted,
    requestGyroscopePermission,
  } = useMotionParallaxContext();

  // Get i18n context
  const { t, language } = useI18n();
  const TIER_CONFIG = useTierConfig();

  // Load data on mount
  useEffect(() => {
    const savedArchive = localStorage.getItem(LOCAL_STORAGE_KEY_ARCHIVE);
    if (savedArchive) setArchive(JSON.parse(savedArchive));

    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Save tasks on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Save archive on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ARCHIVE, JSON.stringify(archive));
  }, [archive]);

  // Timer Logic
  useEffect(() => {
    if (appState === AppState.FOCUSING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  // AI Trigger Logic
  useEffect(() => {
    if (appState === AppState.FOCUSING && !generatedRef.current) {
      const progress = 1 - timeLeft / (totalDuration * 60);

      if (progress > 0.8) {
        generatedRef.current = true;
        const activeTask = tasks.find((t) => !t.completed)?.text || "";
        console.log("Initiating Sequence: Connecting to Gemini...");

        generateObservationReport(
          totalDuration,
          activeTask,
          selectedTier,
          language,
        ).then((data) => {
          const report: ObservationReport = {
            ...data,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          };
          setCurrentReport(report);
        });
      }
    }
  }, [timeLeft, totalDuration, appState, tasks, selectedTier, language]);

  const startFocus = () => {
    const durationMins = selectedTier;
    setTotalDuration(durationMins);
    setTimeLeft(durationMins * 60);
    setAppState(AppState.FOCUSING);
    generatedRef.current = false;
    setCurrentReport(null);
  };

  const handleComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentReport) {
      setAppState(AppState.REPORT);
    } else {
      setAppState(AppState.PROCESSING);
      const activeTask = tasks.find((t) => !t.completed)?.text || "";
      generateObservationReport(
        totalDuration,
        activeTask,
        selectedTier,
        language,
      ).then((data) => {
        const report: ObservationReport = {
          ...data,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        setCurrentReport(report);
        setAppState(AppState.REPORT);
      });
    }
  };

  const abortFocus = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState(AppState.SIGNAL_LOST);
    setTimeout(() => {
      setAppState(AppState.IDLE);
    }, 4000);
  };

  const closeReport = () => {
    if (currentReport) {
      setArchive((prev) => [currentReport, ...prev]);
    }
    setAppState(AppState.IDLE);
    setCurrentReport(null);
  };

  const getColorStage = () => {
    if (appState !== AppState.FOCUSING) return "start";
    const progress = 1 - timeLeft / (totalDuration * 60);
    if (progress < 0.4) return "start";
    if (progress < 0.8) return "mid";
    return "end";
  };

  const getSpeed = () => {
    if (appState === AppState.IDLE) return 0.02;
    if (appState === AppState.FOCUSING) {
      const progress = 1 - timeLeft / (totalDuration * 60);
      return 0.1 + progress * 0.9;
    }
    return 0;
  };

  // Check if we need to show iOS permission prompt
  const needsGyroscopePermission =
    isGyroscopeSupported &&
    !isGyroscopePermissionGranted &&
    typeof (DeviceOrientationEvent as any).requestPermission === "function";

  // --- Views ---

  // 1. Idle / Setup View
  const renderSetup = () => (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-6 md:gap-12 animate-in fade-in duration-700 py-16 md:py-4">
      {/* Header - depth 0.5 for subtle movement */}
      <ParallaxLayer depth={0.5} className="text-center space-y-2 md:space-y-4">
        <h1 className="font-display text-3xl md:text-6xl text-white tracking-widest uppercase flex items-center justify-center gap-2 md:gap-4">
          <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {t("app.title.prefix")}
          </span>
          <span
            className="relative px-3 md:px-5 py-1 md:py-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)",
              boxShadow: `
                inset 0 0 20px rgba(6, 182, 212, 0.3),
                0 0 30px rgba(6, 182, 212, 0.15)
              `,
              border: "1px solid rgba(6, 182, 212, 0.3)",
            }}
          >
            <span className="relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              {t("app.title.accent")}
            </span>
          </span>
        </h1>
        <p className="text-slate-400 font-mono text-[10px] md:text-sm tracking-[0.2em] uppercase">
          {t("app.subtitle")}
        </p>
      </ParallaxLayer>

      {/* Tier Selection - depth 0.8 for moderate movement */}
      <ParallaxLayer depth={0.8} className="w-full max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {(
            Object.values(FocusTier).filter(
              (v) => typeof v === "number",
            ) as number[]
          )
            .sort((a, b) => a - b)
            .map((tier) => {
              const conf = TIER_CONFIG[tier as FocusTier];
              const isSelected = selectedTier === tier;
              const isHovered = hoveredTier === tier;

              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier as FocusTier)}
                  onMouseEnter={() => setHoveredTier(tier)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className="group relative p-4 md:p-6 transition-all duration-200"
                  style={{
                    ...getTierButtonStyle(isSelected, conf.color),
                    transform:
                      isHovered && !isSelected
                        ? "translateY(-2px)"
                        : "translateY(0)",
                  }}
                >
                  <div
                    className="text-xl md:text-3xl font-bold font-mono mb-1 md:mb-2"
                    style={{ color: isSelected ? "white" : "var(--muted)" }}
                  >
                    {tier}
                    <span className="text-[10px] md:text-xs ml-1 align-top opacity-50">
                      {t("unit.min")}
                    </span>
                  </div>
                  <div
                    className={`text-[9px] md:text-xs uppercase tracking-wider font-bold mb-1 md:mb-2 ${conf.color}`}
                  >
                    {conf.name}
                  </div>
                  <div
                    className="text-[9px] md:text-[10px] leading-tight hidden md:block"
                    style={{ color: "var(--muted)" }}
                  >
                    {conf.desc}
                  </div>
                </button>
              );
            })}
        </div>
      </ParallaxLayer>

      {/* Terminal and CTA - different depths for parallax layering */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-4xl items-start">
        <ParallaxLayer
          depth={0.6}
          className="flex-1 w-full flex justify-center order-2 md:order-1"
        >
          <Terminal tasks={tasks} setTasks={setTasks} />
        </ParallaxLayer>
        <ParallaxLayer
          depth={1.0}
          className="flex-1 w-full flex flex-col items-center justify-center gap-4 md:gap-6 pt-4 md:pt-10 order-1 md:order-2"
        >
          {/* iOS Gyroscope Permission Button */}
          {needsGyroscopePermission && (
            <button
              onClick={requestGyroscopePermission}
              className="text-[10px] md:text-xs font-mono uppercase tracking-widest px-4 py-2 mb-2 transition-all duration-200"
              style={{
                ...ghostButtonStyle,
                color: "var(--primary)",
                borderColor: "var(--primary)",
              }}
            >
              {t("button.enableMotion")}
            </button>
          )}
          {/* Primary CTA Button */}
          <button
            onClick={startFocus}
            onMouseEnter={() => setIsStartHovered(true)}
            onMouseLeave={() => setIsStartHovered(false)}
            className="w-full md:w-auto relative group overflow-hidden px-8 md:px-12 py-3 md:py-4 text-black font-mono font-bold text-base md:text-lg uppercase tracking-widest transition-all duration-200"
            style={
              isStartHovered ? primaryButtonHoverStyle : primaryButtonStyle
            }
          >
            <span className="relative z-10">{t("button.initialize")}</span>
            <div
              className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 -z-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 20%, transparent), transparent)",
              }}
            ></div>
          </button>
          <div
            className="text-[10px] md:text-xs font-mono"
            style={{ color: "var(--muted)" }}
          >
            {t("status.ready")}
          </div>
        </ParallaxLayer>
      </div>

      {archive.length > 0 && (
        <ParallaxLayer depth={0.4}>
          <button
            onClick={() => setAppState(AppState.ARCHIVE)}
            className="text-xs uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-1"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            {t("button.accessArchives")} ({archive.length})
          </button>
        </ParallaxLayer>
      )}
    </div>
  );

  // 2. Focusing View
  const renderFocusing = () => (
    <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center text-white">
      {/* Abyss Pulse - Living, breathing entity with audio + interaction */}
      <AbyssPulse analyser={analyser} active={appState === AppState.FOCUSING} />

      {/* Live Signal indicator - depth 0.3 */}
      <ParallaxLayer
        depth={0.3}
        className="absolute top-8 left-0 w-full flex justify-center"
      >
        <span
          className="animate-pulse font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--destructive)" }}
        >
          {t("status.liveSignal")}
        </span>
      </ParallaxLayer>

      {/* Timer - depth 1.2 for prominent movement */}
      <ParallaxLayer
        depth={1.2}
        className="text-center space-y-2 mix-blend-difference"
      >
        <div
          className="font-mono text-xs md:text-sm tracking-widest mb-4"
          style={{ color: "var(--muted)" }}
        >
          {t("status.timeDilation")}
        </div>

        <div className="font-display text-5xl md:text-6xl opacity-80 tracking-widest">
          {Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0")}
          :{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </ParallaxLayer>

      {/* Abort button - depth 0.5 */}
      <ParallaxLayer depth={0.5} className="absolute bottom-10">
        <button
          onClick={abortFocus}
          className="text-xs font-mono uppercase tracking-widest transition-colors"
          style={{ color: "var(--border)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--destructive)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--border)")}
        >
          {t("button.abort")}
        </button>
      </ParallaxLayer>
    </div>
  );

  // 3. Signal Lost View
  const renderSignalLost = () => (
    <div className="relative z-50 w-full h-screen flex items-center justify-center bg-black">
      <div className="noise-bg opacity-30"></div>
      <div className="scanline"></div>
      <div className="crt-flicker text-center px-4">
        <h1 className="font-mono text-4xl md:text-6xl text-slate-800 font-bold mb-4 tracking-tighter glitch">
          {t("status.signalLost")}
        </h1>
        <p className="font-mono text-xs md:text-base text-red-900 uppercase tracking-widest">
          {t("status.signalLostDesc")}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-cyan-500/30">
      {/* Audio Engine */}
      <AudioAmbience active={appState === AppState.FOCUSING} muted={isMuted} />
      <SpaceMusic
        active={appState === AppState.FOCUSING}
        muted={isMuted}
        onAnalyserReady={setAnalyser}
      />

      {/* Controls - depth 0.3 for subtle movement */}
      <ParallaxLayer
        depth={0.3}
        className="absolute top-4 right-4 z-50 flex gap-3"
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1 transition-colors duration-200 text-[var(--muted)] hover:text-white"
          title={isMuted ? t("button.unmute") : t("button.mute")}
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
        <LanguageSwitcher />
      </ParallaxLayer>

      {/* Background Visuals - no parallax on fixed background */}
      <div className="fixed inset-0 w-full h-full">
        <StarTunnel
          speed={getSpeed()}
          colorStage={getColorStage()}
          isCollapsed={
            appState === AppState.IDLE || appState === AppState.ARCHIVE
          }
        />
      </div>

      {/* Main Content Router */}
      <main className="relative z-10">
        {appState === AppState.IDLE && renderSetup()}
        {appState === AppState.FOCUSING && renderFocusing()}
        {appState === AppState.SIGNAL_LOST && renderSignalLost()}
        {appState === AppState.PROCESSING && (
          <ParallaxLayer
            depth={0.8}
            className="h-screen flex items-center justify-center"
          >
            <div
              className="font-mono animate-pulse text-sm md:text-base"
              style={{ color: "var(--primary)" }}
            >
              {t("status.decrypting")}
            </div>
          </ParallaxLayer>
        )}
        {appState === AppState.REPORT && currentReport && (
          <div className="h-screen flex items-center justify-center bg-black/80">
            <ParallaxLayer depth={0.9}>
              <ReportCard report={currentReport} onClose={closeReport} />
            </ParallaxLayer>
          </div>
        )}
        {appState === AppState.ARCHIVE && (
          <ArchiveView
            archive={archive}
            onBack={() => setAppState(AppState.IDLE)}
          />
        )}
      </main>
    </div>
  );
};

// Main App wrapper with Provider
const App: React.FC = () => {
  return (
    <I18nProvider>
      <MotionParallaxProvider enabled={true}>
        <AppContent />
      </MotionParallaxProvider>
    </I18nProvider>
  );
};

export default App;
