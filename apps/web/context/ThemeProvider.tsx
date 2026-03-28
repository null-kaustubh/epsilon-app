"use client";

import React from "react";
import Cookie from "js-cookie";

export type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  handleChange: () => void;
  themeSwitching: boolean;
};
type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme: Theme;
};

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export default function ThemeProvider({
  children,
  initialTheme,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(initialTheme);
  const [themeSwitching, setThemeSwitching] = React.useState(false);

  function handleChange() {
    const nextTheme = theme === "light" ? "dark" : "light";

    Cookie.set("color-theme", nextTheme, {
      expires: 1000,
    });

    const root = document.documentElement;

    root.setAttribute("data-color-theme", nextTheme);

    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    setTheme(nextTheme);
    setThemeSwitching(true);
  }

  React.useEffect(() => {
    if (!themeSwitching) return;

    const id = setTimeout(() => {
      setThemeSwitching(false);
    }, 0);

    return () => {
      clearTimeout(id);
    };
  }, [themeSwitching]);

  return (
    <ThemeContext.Provider value={{ theme, handleChange, themeSwitching }}>
      {children}
    </ThemeContext.Provider>
  );
}
