"use client";

import Icon from "./Icon";
import { useTheme } from "../../providers/ThemeProvider";
import { cn } from "../../utils/cn";

type ThemeToggleProps = {
  className?: string;
  variant?: "auth" | "default" | "patient";
};

export default function ThemeToggle({ className = "", variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  const label = darkMode ? "Light mode" : "Dark mode";
  const shouldAddDefaultDisplay = !/\bhidden\b/.test(className);
  const patientVariant = variant === "patient";
  const authVariant = variant === "auth";

  const buttonClass = patientVariant
    ? "min-h-10 gap-[0.65rem] border border-white/20 bg-white/12 px-[0.8rem] py-[0.35rem] text-white shadow-[0_0.85rem_1.8rem_rgba(15,23,42,0.16)] backdrop-blur-[18px] hover:border-white/35 hover:bg-white/18 focus:ring-2 focus:ring-white/60 max-[540px]:gap-0 max-[540px]:px-[0.35rem]"
    : authVariant
      ? "min-h-10 gap-[0.65rem] border border-white/18 bg-white/70 px-[0.8rem] py-[0.35rem] text-app-text-soft shadow-[0_0.85rem_1.8rem_rgba(15,23,42,0.1)] backdrop-blur-[18px] hover:border-white/35 hover:bg-white/82 hover:text-app-text focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/6 dark:text-app-text dark:hover:bg-white/10"
    : "min-h-10 gap-[0.65rem] border border-app-line bg-app-card px-[0.8rem] py-[0.35rem] text-app-text-soft shadow-app hover:border-[color-mix(in_srgb,var(--primary)_34%,var(--line))] hover:bg-[var(--surface-muted)] hover:text-app-primary focus:ring-4 focus:ring-violet-100";

  const trackClass = patientVariant
    ? "bg-white/16 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
    : authVariant
      ? "bg-[color-mix(in_srgb,var(--primary)_14%,white)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] dark:bg-white/10 dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.16)]"
    : "bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface-muted))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_16%,var(--line))]";

  const thumbClass = patientVariant
    ? "bg-white text-[#4f46e5]"
    : authVariant
      ? "bg-white text-[var(--theme-toggle-icon-color)] dark:bg-[var(--auth-card-bg,#111827)]"
    : "bg-app-card text-[var(--theme-toggle-icon-color)]";

  return (
    <button
      type="button"
      className={cn(
        "items-center justify-center whitespace-nowrap rounded-full text-sm font-extrabold leading-none transition focus:outline-none",
        shouldAddDefaultDisplay && "inline-flex",
        buttonClass,
        className,
      )}
      onClick={toggleTheme}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      data-state={darkMode ? "dark" : "light"}
    >
      <span className={cn(patientVariant && "max-[540px]:hidden")}>{label}</span>
      <span className={cn("relative inline-flex h-7 w-13 flex-none items-center rounded-full transition", trackClass)} aria-hidden="true">
        <span
          className={cn(
            "grid h-[1.35rem] w-[1.35rem] place-items-center rounded-full shadow-[0_0.35rem_0.9rem_rgba(15,23,42,0.18)] transition duration-200",
            thumbClass,
            darkMode ? "translate-x-[1.68rem]" : "translate-x-[0.22rem]",
          )}
        >
          <Icon name={darkMode ? "sun-medium" : "moon-star"} size={14} />
        </span>
      </span>
    </button>
  );
}
