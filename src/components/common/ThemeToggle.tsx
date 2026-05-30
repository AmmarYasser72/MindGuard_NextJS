"use client";

import Icon from "./Icon";
import { useTheme } from "../../providers/ThemeProvider";
import { cn } from "../../utils/cn";

type ThemeToggleProps = {
  className?: string;
  variant?: "default" | "patient";
};

export default function ThemeToggle({ className = "", variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  const label = darkMode ? "Light mode" : "Dark mode";
  const variantClass = variant === "patient" ? "theme-toggle--patient" : "theme-toggle--default dashboard-outline-btn";
  const shouldAddDefaultDisplay = !/\bhidden\b/.test(className);

  return (
    <button
      type="button"
      className={cn("theme-toggle", shouldAddDefaultDisplay && "inline-flex", variantClass, className)}
      onClick={toggleTheme}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      data-state={darkMode ? "dark" : "light"}
    >
      <span className="theme-toggle__label">{label}</span>
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          <Icon name={darkMode ? "sun-medium" : "moon-star"} size={14} />
        </span>
      </span>
    </button>
  );
}
