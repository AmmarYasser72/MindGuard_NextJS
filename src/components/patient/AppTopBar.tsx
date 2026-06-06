import Icon from "../common/Icon";
import IconButton from "../common/IconButton";

type AppTopBarProps = {
  actionIcon?: string;
  actionLabel?: string;
  onAction?: () => void;
  onBack: () => void;
  subtitle?: string;
  title: string;
};

export default function AppTopBar({
  title,
  subtitle,
  onBack,
  actionIcon,
  actionLabel,
  onAction,
}: AppTopBarProps) {
  return (
    <header className="app-topbar dashboard-glass sticky top-0 z-20 border-b px-4 py-3 [html:not([data-theme='dark'])_&]:border-[rgba(203,213,225,0.76)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,252,255,0.9))] [html:not([data-theme='dark'])_&]:py-2 [html:not([data-theme='dark'])_&]:shadow-[0_0.7rem_1.8rem_rgba(55,65,118,0.07)] sm:px-6">
      <div className="app-topbar-inner mx-auto grid max-w-5xl grid-cols-[44px_1fr_44px] items-center gap-3 [html:not([data-theme='dark'])_&]:min-h-[3.85rem] [html:not([data-theme='dark'])_&]:max-w-[82rem] [html:not([data-theme='dark'])_&]:grid-cols-[auto_minmax(0,1fr)_auto] [html:not([data-theme='dark'])_&]:rounded-[1.35rem] [html:not([data-theme='dark'])_&]:border [html:not([data-theme='dark'])_&]:border-[rgba(203,213,225,0.72)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(236,254,255,0.54)_48%,rgba(245,243,255,0.58))] [html:not([data-theme='dark'])_&]:px-[0.55rem] [html:not([data-theme='dark'])_&]:py-[0.45rem] [html:not([data-theme='dark'])_&]:shadow-[0_0.85rem_2rem_rgba(55,65,118,0.08),inset_0_0_0_1px_rgba(255,255,255,0.62)] max-sm:[html:not([data-theme='dark'])_&]:rounded-[1.15rem]">
        <IconButton
          className="app-topbar-back [html:not([data-theme='dark'])_&]:!h-[2.65rem] [html:not([data-theme='dark'])_&]:!w-[2.65rem] [html:not([data-theme='dark'])_&]:rounded-2xl [html:not([data-theme='dark'])_&]:border-[rgba(14,116,144,0.16)] [html:not([data-theme='dark'])_&]:bg-white/85 [html:not([data-theme='dark'])_&]:text-[var(--patient-doctor-accent)] [html:not([data-theme='dark'])_&]:shadow-[0_0.45rem_1rem_rgba(14,116,144,0.08)] [html:not([data-theme='dark'])_&]:hover:-translate-y-px [html:not([data-theme='dark'])_&]:hover:border-[rgba(14,116,144,0.28)] [html:not([data-theme='dark'])_&]:hover:bg-white [html:not([data-theme='dark'])_&]:hover:text-cyan-800"
          icon="arrow-left"
          label="Back"
          onClick={onBack}
        />
        <div className="app-topbar-heading min-w-0 text-center [html:not([data-theme='dark'])_&]:grid [html:not([data-theme='dark'])_&]:justify-items-center [html:not([data-theme='dark'])_&]:gap-[0.1rem] [html:not([data-theme='dark'])_&]:px-3">
          {subtitle ? (
            <span className="app-topbar-kicker [html:not([data-theme='dark'])_&]:text-[0.68rem] [html:not([data-theme='dark'])_&]:font-black [html:not([data-theme='dark'])_&]:uppercase [html:not([data-theme='dark'])_&]:leading-none [html:not([data-theme='dark'])_&]:tracking-[0.14em] [html:not([data-theme='dark'])_&]:text-[var(--patient-doctor-accent)] max-sm:[html:not([data-theme='dark'])_&]:hidden">
              {subtitle}
            </span>
          ) : null}
          <h1 className="app-topbar-title truncate text-xl font-bold text-slate-950 [html:not([data-theme='dark'])_&]:text-[1.12rem] [html:not([data-theme='dark'])_&]:leading-tight [html:not([data-theme='dark'])_&]:text-[#172033] max-sm:[html:not([data-theme='dark'])_&]:text-base">
            {title}
          </h1>
        </div>
        {actionIcon ? (
          <button
            type="button"
            className="app-topbar-action grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-indigo-900/15 transition hover:-translate-y-0.5 hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-violet-200 [html:not([data-theme='dark'])_&]:!h-[2.85rem] [html:not([data-theme='dark'])_&]:!w-[2.85rem] [html:not([data-theme='dark'])_&]:rounded-2xl [html:not([data-theme='dark'])_&]:border [html:not([data-theme='dark'])_&]:border-white/70 [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,#0e7490,#6366f1)] [html:not([data-theme='dark'])_&]:shadow-[0_0.8rem_1.5rem_rgba(14,116,144,0.18)] [html:not([data-theme='dark'])_&]:hover:brightness-[0.98] [html:not([data-theme='dark'])_&]:hover:shadow-[0_0.95rem_1.7rem_rgba(79,70,229,0.2)]"
            onClick={onAction}
            aria-label={actionLabel || title}
          >
            <Icon name={actionIcon} size={20} color="#fff" />
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
