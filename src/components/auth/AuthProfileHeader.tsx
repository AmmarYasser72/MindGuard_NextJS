import AuthLogo from "./AuthLogo";
import Icon from "../common/Icon";
import IconButton from "../common/IconButton";
import type { ComponentProps } from "react";

type AuthProfileHeaderProps = {
  backLabel: string;
  description: string;
  eyebrow: string;
  icon: string;
  onBack: () => void;
  title: string;
  badge?: {
    icon: string;
    label: string;
  };
  tone?: ComponentProps<typeof AuthLogo>["tone"];
};

export default function AuthProfileHeader({
  badge,
  backLabel,
  description,
  eyebrow,
  icon,
  onBack,
  title,
  tone = "indigo",
}: AuthProfileHeaderProps) {
  return (
    <header className="grid gap-4 sm:grid-cols-[auto_auto_1fr] sm:items-center">
      <IconButton
        icon="arrow-left"
        label={backLabel}
        className="h-11 w-11 rounded-2xl border-slate-200 bg-white shadow-sm shadow-slate-950/5"
        onClick={onBack}
      />
      <AuthLogo tone={tone} size={56} icon={icon} />
      <div className="grid gap-2">
        <span className={`text-xs font-black uppercase tracking-[0.22em] ${tone === "green" ? "text-emerald-600" : "text-[var(--primary)]"}`}>
          {eyebrow}
        </span>
        <div>
          <h1 className="text-[clamp(1.9rem,5vw,2.5rem)] font-bold leading-tight text-slate-950">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {badge ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Icon name={badge.icon} size={16} color="#059669" />
            {badge.label}
          </span>
        ) : null}
      </div>
    </header>
  );
}
