"use client";

import { useContext } from "react";
import { Moon, Sun } from "phosphor-react";
import { ThemeContext } from "../../../../context/ThemeProvider";

export default function ThemeToggle() {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;

  const { theme, handleChange } = themeContext;
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={handleChange}
      className="fixed top-3 right-6 z-50 p-2 rounded-xl 
                 bg-background/80 backdrop-blur-md border shadow-sm
                 hover:bg-muted/70 transition-opacity"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
