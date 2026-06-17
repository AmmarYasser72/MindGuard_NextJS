import Icon from "../common/Icon";
import type { ReactNode } from "react";

type PatientListButtonProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  leading?: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
  subtitle?: ReactNode;
};

export default function PatientListButton({
  title,
  eyebrow,
  icon = "circle",
  iconBg = "#eef2ff",
  iconColor = "#6366f1",
  leading,
  meta,
  onClick,
  subtitle,
}: PatientListButtonProps) {
  return (
    <button
      type="button"
      className="patient-list-row grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
    >
      {leading || (
        <span
          className="grid h-10 w-10 place-items-center rounded-2xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon name={icon} size={20} color={iconColor} />
        </span>
      )}
      <span className="min-w-0">
        {eyebrow ? (
          <small className="block text-xs font-semibold text-app-faint">
            {eyebrow}
          </small>
        ) : null}
        <strong className="block text-sm font-bold text-app-text">
          {title}
        </strong>
        {subtitle ? (
          <small className="mt-1 block text-xs font-semibold text-app-muted">
            {subtitle}
          </small>
        ) : null}
        {meta ? (
          <em className="mt-1 block text-xs not-italic leading-5 text-app-faint">
            {meta}
          </em>
        ) : null}
      </span>
      <Icon name="chevron-right" size={16} color="#9ca3af" />
    </button>
  );
}
