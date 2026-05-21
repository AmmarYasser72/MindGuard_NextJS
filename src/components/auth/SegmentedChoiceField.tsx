import Icon from "../common/Icon";
import { cn } from "../../utils/cn";

type Choice = {
  icon?: string;
  label: string;
  value: string;
};

type SegmentedChoiceFieldProps = {
  choices: Choice[];
  disabled?: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  tone?: "emerald" | "violet";
  value: string;
};

const toneClasses = {
  emerald: {
    active: "border-emerald-300 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100",
    icon: "bg-emerald-100 text-emerald-600",
  },
  violet: {
    active: "border-violet-300 bg-violet-50 text-[var(--primary)] ring-4 ring-violet-100",
    icon: "bg-violet-100 text-[var(--primary)]",
  },
};

export default function SegmentedChoiceField({
  choices,
  disabled,
  error,
  label,
  onChange,
  tone = "violet",
  value,
}: SegmentedChoiceFieldProps) {
  const activeTone = toneClasses[tone];

  return (
    <fieldset className="grid gap-2">
      <legend className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const active = choice.value === value;
          return (
            <button
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-slate-700 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
                active && activeTone.active,
              )}
              key={choice.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(choice.value)}
            >
              <span className={cn("grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-400", active && activeTone.icon)}>
                <Icon name={choice.icon || "circle"} size={18} />
              </span>
              <span className="min-w-0">
                <strong className="block text-sm font-bold">{choice.label}</strong>
                <small className="mt-0.5 block text-xs font-semibold text-slate-400">{active ? "Selected" : "Tap to choose"}</small>
              </span>
            </button>
          );
        })}
      </div>
      {error ? <span className="text-xs font-bold text-red-600">{error}</span> : null}
    </fieldset>
  );
}
