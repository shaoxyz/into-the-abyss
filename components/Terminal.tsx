import React, { useState } from "react";
import { Task } from "../types";
import { useI18n } from "../contexts/I18nContext";

interface TerminalProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Terminal: React.FC<TerminalProps> = ({ tasks, setTasks }) => {
  const [input, setInput] = useState("");
  const { t } = useI18n();

  const addTask = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: input.trim(),
        completed: false,
        priority: false,
      };
      setTasks((prev) => [newTask, ...prev]);
      setInput("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      className="relative w-full max-w-md overflow-hidden"
      style={{
        background: `linear-gradient(
          145deg,
          color-mix(in srgb, var(--surface) 105%, white) 0%,
          var(--surface) 50%,
          color-mix(in srgb, var(--surface) 85%, black) 100%
        )`,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.5),
          0 2px 8px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
        borderRadius: "var(--radius-lg)",
        padding: "24px",
      }}
    >
      {/* Decorative Corner Accents */}
      <div className="neu-corner top-left" style={{ top: 8, left: 8 }}></div>
      <div className="neu-corner top-right" style={{ top: 8, right: 8 }}></div>
      <div
        className="neu-corner bottom-left"
        style={{ bottom: 8, left: 8 }}
      ></div>
      <div
        className="neu-corner bottom-right"
        style={{ bottom: 8, right: 8 }}
      ></div>

      <h2
        className="text-xs font-bold tracking-[0.2em] mb-4 uppercase"
        style={{ color: "var(--primary)", opacity: 0.8 }}
      >
        {t('terminal.title')}
      </h2>

      {/* Input Area - Inset Effect */}
      <div
        className="flex items-center gap-2 mb-4 md:mb-6"
        style={{
          background: `linear-gradient(
            180deg,
            color-mix(in srgb, var(--background) 100%, black) 0%,
            var(--background) 100%
          )`,
          boxShadow: `
            inset 0 2px 6px rgba(0, 0, 0, 0.5),
            inset 0 1px 2px rgba(0, 0, 0, 0.3),
            0 1px 0 rgba(255, 255, 255, 0.03)
          `,
          borderRadius: "var(--radius-sm)",
          border:
            "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
          padding: "12px 16px",
        }}
      >
        <span style={{ color: "var(--primary)", fontSize: "18px" }}>›</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={addTask}
          placeholder={t('terminal.placeholder')}
          className="bg-transparent border-none outline-none w-full font-mono text-base md:text-sm"
          style={{ color: "var(--foreground)" }}
          autoFocus
        />
      </div>

      <ul className="space-y-3 max-h-[200px] md:max-h-[300px] overflow-y-auto no-scrollbar">
        {tasks.length === 0 && (
          <li
            className="text-xs text-center py-4 italic"
            style={{ color: "var(--muted)" }}
          >
            {t('terminal.empty')}
          </li>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Checkbox - Neumorphic Style */}
              <button
                onClick={() => toggleTask(task.id)}
                className="flex-shrink-0 w-5 h-5 md:w-5 md:h-5 flex items-center justify-center transition-all duration-200"
                style={{
                  background: task.completed
                    ? `linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, black) 100%)`
                    : `linear-gradient(180deg, color-mix(in srgb, var(--background) 90%, black) 0%, var(--background) 100%)`,
                  boxShadow: task.completed
                    ? `0 2px 6px color-mix(in srgb, var(--primary) 40%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                    : `inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.03)`,
                  borderRadius: "0",
                  border: task.completed
                    ? "1px solid var(--primary)"
                    : "1px solid var(--border)",
                }}
              >
                {task.completed && (
                  <div
                    className="w-2 h-2"
                    style={{ backgroundColor: "white" }}
                  />
                )}
              </button>
              <span
                className={`font-mono transition-all truncate ${task.completed ? "line-through" : ""}`}
                style={{
                  color: task.completed ? "var(--muted)" : "var(--foreground)",
                  opacity: task.completed ? 0.6 : 1,
                }}
              >
                {task.text}
              </span>
            </div>
            <button
              onClick={() => removeTask(task.id)}
              className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all px-3 py-1 text-lg leading-none hover:scale-110"
              style={{
                color: "var(--muted)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--destructive)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Terminal;
