import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.theme as Theme) || "system"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      localStorage.removeItem("theme");
    } else {
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-3 rounded-xl bg-surface-container-low border border-vellum-outline/10 text-vellum-on-surface-variant hover:text-vellum-primary transition-all flex items-center justify-center relative w-11 h-11 focus:outline-none"
      title={`Current Theme: ${theme}`}
    >
        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none" style={{ opacity: theme === 'dark' ? 1 : 0 }}>
            <Moon size={18} />
        </span>
        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none" style={{ opacity: theme === 'light' ? 1 : 0 }}>
            <Sun size={18} />
        </span>
        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none" style={{ opacity: theme === 'system' ? 1 : 0 }}>
            <Monitor size={18} />
        </span>
    </button>
  );
};

export default ThemeToggle;
