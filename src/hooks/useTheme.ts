"use client";

import { useState, useEffect } from "react";
import {
  ThemeSettings,
  DEFAULT_THEME,
  ACCENT_COLORS,
  loadTheme,
  saveTheme,
} from "@/lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeSettings>(DEFAULT_THEME);

  useEffect(() => {
    setThemeState(loadTheme());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const accent = ACCENT_COLORS[theme.accent].hex;

    function hexToRgba(hex: string, alpha: number): string {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-dim", hexToRgba(accent, 0.1));
    root.style.setProperty("--accent-glow", hexToRgba(accent, 0.15));

    if (theme.mode === "light") {
      root.style.setProperty("--bg-base", "#F5F5F5");
      root.style.setProperty("--bg-surface", "#FFFFFF");
      root.style.setProperty("--bg-hover", "#F0F0F0");
      root.style.setProperty("--bg-active", "#E8E8E8");
      root.style.setProperty("--bg-input", "#FFFFFF");
      root.style.setProperty("--border", "rgba(0,0,0,0.08)");
      root.style.setProperty("--border-hi", "rgba(0,0,0,0.15)");
      root.style.setProperty("--border-focus", accent);
      root.style.setProperty("--text1", "#111111");
      root.style.setProperty("--text2", "#555555");
      root.style.setProperty("--text3", "#999999");
    } else {
      root.style.setProperty("--bg-base", "#06080C");
      root.style.setProperty("--bg-surface", "#0B0E14");
      root.style.setProperty("--bg-hover", "#111520");
      root.style.setProperty("--bg-active", "#1A1E28");
      root.style.setProperty("--bg-input", "#1A1E28");
      root.style.setProperty("--border", "rgba(255,255,255,0.07)");
      root.style.setProperty("--border-hi", "rgba(255,255,255,0.13)");
      root.style.setProperty("--border-focus", accent);
      root.style.setProperty("--text1", "#EEF0F5");
      root.style.setProperty("--text2", "#8891A8");
      root.style.setProperty("--text3", "#3E4456");
    }

    saveTheme(theme);
  }, [theme]);

  const updateTheme = (partial: Partial<ThemeSettings>) => {
    setThemeState((prev) => ({ ...prev, ...partial }));
  };

  return { theme, updateTheme };
}
