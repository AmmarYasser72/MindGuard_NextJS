import Icon from "./Icon";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
};

export default function IconButton({
  icon,
  label,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl border border-app-line bg-app-card text-app-text-soft transition hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--line))] hover:bg-[var(--surface-soft)] hover:text-app-text focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
