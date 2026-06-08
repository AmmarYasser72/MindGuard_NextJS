import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { firstName, greeting } from "./dashboardShared";

type DoctorTopBarProps = {
  doctorName: string;
  onLogout: () => void;
  onNewSession: () => void;
};

export default function DoctorTopBar({
  doctorName,
  onLogout,
  onNewSession,
}: DoctorTopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 shadow-[var(--shadow)] backdrop-blur-[18px] sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-[var(--primary)]">
            {greeting()}
          </span>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950">
            Dr. {firstName(doctorName)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <button
            type="button"
            className="hidden min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--doctor-line)] bg-[var(--doctor-card)] px-3 py-2 text-sm font-bold text-slate-700 shadow-sm shadow-violet-950/5 transition hover:bg-[var(--doctor-card-muted)] hover:text-[var(--primary)] sm:inline-flex"
            onClick={onNewSession}
          >
            <Icon name="calendar-plus" size={18} />
            New session
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--doctor-line)] bg-[var(--doctor-card)] text-slate-700 shadow-sm shadow-violet-950/5 transition hover:bg-[var(--doctor-card-muted)] hover:text-[var(--primary)]"
            aria-label="Logout"
            title="Logout"
            onClick={onLogout}
          >
            <Icon name="log-out" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
