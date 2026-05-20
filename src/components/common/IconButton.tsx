import Icon from "./Icon";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
};

export default function IconButton({ icon, label, className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60",
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
