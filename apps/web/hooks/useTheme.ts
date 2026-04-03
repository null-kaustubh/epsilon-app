import { ThemeContext } from "../context/ThemeProvider";
import React from "react";

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
