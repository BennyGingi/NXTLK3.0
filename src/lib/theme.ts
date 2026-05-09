export type AccentColor = "teal" | "purple" | "orange" | "pink" | "blue" | "red";
export type AppMode = "dark" | "light";
export type ChatBackground =
  | "none"
  | "bg-1"
  | "bg-2"
  | "bg-3"
  | "bg-4"
  | "bg-5"
  | "bg-6"
  | "bg-7"
  | "bg-8";

export interface ThemeSettings {
  mode: AppMode;
  accent: AccentColor;
  chatBackground: ChatBackground;
}

export const ACCENT_COLORS: Record<AccentColor, { hex: string; label: string }> = {
  teal:   { hex: "#00D4A8", label: "Teal" },
  purple: { hex: "#7C6AF5", label: "Purple" },
  orange: { hex: "#FF6B35", label: "Orange" },
  pink:   { hex: "#D4537E", label: "Pink" },
  blue:   { hex: "#378ADD", label: "Blue" },
  red:    { hex: "#E24B4A", label: "Red" },
};

export const BACKGROUNDS: Record<ChatBackground, { label: string; file: string | null }> = {
  none:   { label: "None",             file: null },
  "bg-1": { label: "Geometric I",      file: "/backgrounds/bg-1.jpg" },
  "bg-2": { label: "Geometric II",     file: "/backgrounds/bg-2.jpg" },
  "bg-3": { label: "Constellation I",  file: "/backgrounds/bg-3.jpg" },
  "bg-4": { label: "Constellation II", file: "/backgrounds/bg-4.jpg" },
  "bg-5": { label: "Topographic I",    file: "/backgrounds/bg-5.jpg" },
  "bg-6": { label: "Topographic II",   file: "/backgrounds/bg-6.jpg" },
  "bg-7": { label: "Circuit I",        file: "/backgrounds/bg-7.jpg" },
  "bg-8": { label: "Circuit II",       file: "/backgrounds/bg-8.jpg" },
};

export const DEFAULT_THEME: ThemeSettings = {
  mode: "dark",
  accent: "teal",
  chatBackground: "none",
};

export function loadTheme(): ThemeSettings {
  try {
    const stored = localStorage.getItem("nxtlk_theme");
    if (stored) return { ...DEFAULT_THEME, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: ThemeSettings): void {
  localStorage.setItem("nxtlk_theme", JSON.stringify(theme));
}
