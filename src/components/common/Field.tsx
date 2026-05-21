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
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span
        className={cn(
          "group flex min-h-14 items-center gap-3 rounded-xl border px-4 shadow-sm shadow-slate-950/5 transition",
          error
            ? "border-red-300 bg-red-50/80 ring-4 ring-red-100"
            : "border-slate-200 bg-white hover:border-slate-300 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100",
        )}
      >
        {icon ? (
          <span className={cn(
            "grid h-9 w-9 place-items-center rounded-lg transition",
            error ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-400 group-focus-within:bg-violet-50 group-focus-within:text-[var(--primary)]",
          )}>
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        {children}
      </span>
      {error ? <span className="text-xs font-bold text-red-600">{error}</span> : null}
    </label>
  );
}
