"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../services/storage";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const storageKey = "theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function detectTheme(): Theme {
  const savedTheme = storage.get<Theme | null>(storageKey, null);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => detectTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.set(storageKey, theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
