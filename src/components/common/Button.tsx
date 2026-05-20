import Icon from "./Icon";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses = {
  blue: "bg-[var(--blue)] text-white shadow-sm shadow-blue-950/10 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-4 focus:ring-slate-200",
  green: "bg-[var(--green)] text-white shadow-sm shadow-emerald-950/10 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-200",
  indigo: "bg-[var(--primary)] text-white shadow-sm shadow-indigo-950/10 hover:bg-[#4f46e5] focus:ring-4 focus:ring-violet-200",
  primary: "bg-[var(--primary)] text-white shadow-sm shadow-indigo-950/10 hover:bg-[#4f46e5] focus:ring-4 focus:ring-violet-200",
} as const;

type ButtonVariant = keyof typeof variantClasses;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: string;
  variant?: ButtonVariant;
};

export default function Button({
  children,
  icon,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-65",
        variantClasses[variant] || variantClasses.primary,
        className,
      )}
      {...props}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}
