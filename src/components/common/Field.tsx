import Icon from "./Icon";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

type FieldProps = {
  children: ReactNode;
  label: string;
  className?: string;
  error?: string;
  icon?: string;
};

export default function Field({ label, icon, error, children, className = "" }: FieldProps) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-2xl border px-4 transition",
          error
            ? "border-red-300 bg-red-50/70 ring-1 ring-red-100"
            : "border-slate-200 bg-slate-50/80 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100",
        )}
      >
        {icon ? <Icon name={icon} size={20} color="#9ca3af" /> : null}
        {children}
      </span>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
