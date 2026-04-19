"use client";

import { Moon, Power, Sun } from "phosphor-react";

type Props = {
  isDark: boolean;
  onThemeChange: () => void;
  onLogout: () => void;
};

export function BottomBar({ isDark, onThemeChange, onLogout }: Props) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3
                 border-border rounded-xl px-3 py-2 bg-background/80 backdrop-blur-md
                 border shadow-sm hover:bg-muted/70 transition-opacity cursor-pointer"
    >
      <button
        type="button"
        onClick={onThemeChange}
        aria-label="Toggle theme"
        className="text-sm text-muted-foreground hover:text-accent transition-[color] cursor-pointer"
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </button>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Logout"
        className="text-sm text-muted-foreground hover:text-accent transition-[color] cursor-pointer"
      >
        <Power size={22} />
      </button>
    </div>
  );
}
