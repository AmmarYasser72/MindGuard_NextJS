import Card from "../common/Card";
import Icon from "../common/Icon";
import ErrorBanner from "./ErrorBanner";
import type { FormEventHandler, ReactNode } from "react";

type SignupFormCardProps = {
  children: ReactNode;
  description: string;
  error: string;
  footerActionClassName?: string;
  footerActionLabel: string;
  footerPrompt: string;
  heading: string;
  icon: string;
  iconColor: string;
  iconSurfaceClassName: string;
  onFooterAction: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function SignupFormCard({
  children,
  description,
  error,
  footerActionClassName = "text-[var(--primary)]",
  footerActionLabel,
  footerPrompt,
  heading,
  icon,
  iconColor,
  iconSurfaceClassName,
  onFooterAction,
  onSubmit,
}: SignupFormCardProps) {
  return (
    <Card className="auth-card p-6 sm:p-7">
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-app-text">{heading}</h2>
            <p className="mt-1 text-sm text-app-muted">{description}</p>
          </div>
          <span className={`auth-field-icon grid h-11 w-11 place-items-center rounded-2xl ${iconSurfaceClassName}`}>
            <Icon name={icon} size={22} color={iconColor} />
          </span>
        </div>
        <ErrorBanner error={error} />
        {children}
      </form>
      <p className="mt-5 text-center text-sm text-app-muted">
        {footerPrompt}{" "}
        <button className={`font-bold ${footerActionClassName}`} type="button" onClick={onFooterAction}>
          {footerActionLabel}
        </button>
      </p>
    </Card>
  );
}
