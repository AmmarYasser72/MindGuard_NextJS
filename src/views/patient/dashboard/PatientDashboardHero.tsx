import Icon from "../../../components/common/Icon";
import ThemeToggle from "../../../components/common/ThemeToggle";
import { dailyGoals, wellnessMetrics } from "../../../data/patientData";

const iconButtonClass =
  "grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:hover:translate-y-0";

type PatientDashboardHeroProps = {
  average: number;
  completedGoals: number;
  currentStreak: number;
  greeting: string;
  isRefreshing: boolean;
  nextGoalTitle: string;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onRefresh: () => void;
  patientName: string;
  unreadCount: number;
};

export default function PatientDashboardHero({
  average,
  completedGoals,
  currentStreak,
  greeting,
  isRefreshing,
  nextGoalTitle,
  onLogout,
  onOpenNotifications,
  onRefresh,
  patientName,
  unreadCount,
}: PatientDashboardHeroProps) {
  return (
    <header className="patient-hero overflow-hidden rounded-lg border text-white shadow-lg shadow-indigo-950/10">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)] lg:p-7">
        <div className="grid content-between gap-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
                Patient dashboard
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
                {greeting}, {patientName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-violet-100 sm:text-base">
                Your care plan is steady today. Keep the next step small,
                visible, and easy to finish.
              </p>
            </div>
            <div className="patient-hero-actions flex shrink-0 flex-wrap justify-end gap-2">
              <ThemeToggle variant="patient" />
              <button
                type="button"
                className={iconButtonClass}
                aria-label="Logout"
                title="Logout"
                onClick={onLogout}
              >
                <Icon name="log-out" size={20} color="#fff" />
              </button>
              <button
                type="button"
                className={iconButtonClass}
                aria-label="Refresh dashboard"
                title="Refresh dashboard"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <Icon
                  name="refresh-cw"
                  size={20}
                  color="#fff"
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                type="button"
                className={`${iconButtonClass} relative`}
                aria-label="Notifications"
                title="Notifications"
                onClick={onOpenNotifications}
              >
                <Icon name="bell" size={20} color="#fff" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-indigo-500">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <HeaderStat
              icon="activity"
              label="Weekly mood"
              value={`${average}%`}
            />
            <HeaderStat
              icon="check-circle"
              label="Goals on track"
              value={`${completedGoals}/${dailyGoals.length}`}
            />
            <HeaderStat
              icon="flame"
              label="Mood streak"
              value={`${currentStreak} day${currentStreak === 1 ? "" : "s"}`}
            />
          </div>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-sm shadow-indigo-950/10 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-violet-100">
                Today
              </span>
              <h2 className="mt-1 text-lg font-bold">Care snapshot</h2>
            </div>
            <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-violet-50">
              On pace
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {wellnessMetrics.slice(0, 3).map((metric) => (
              <div
                className="rounded-lg border border-white/10 bg-white/10 p-3"
                key={metric.label}
              >
                <span className="text-xs font-semibold text-violet-100">
                  {metric.label}
                </span>
                <strong className="mt-2 block text-2xl font-bold">
                  {metric.value}
                </strong>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-white/10 p-3">
            <span className="text-xs font-semibold text-violet-100">
              Next useful step
            </span>
            <strong className="mt-1 block text-sm font-bold text-white">
              {nextGoalTitle}
            </strong>
          </div>
        </div>
      </div>
    </header>
  );
}

type HeaderStatProps = {
  icon: string;
  label: string;
  value: string;
};

function HeaderStat({ icon, label, value }: HeaderStatProps) {
  return (
    <div className="patient-hero-stat flex min-h-16 items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
        <Icon name={icon} size={18} color="#fff" />
      </span>
      <span className="min-w-0">
        <small className="block truncate text-xs font-semibold text-violet-100">
          {label}
        </small>
        <strong className="block text-base font-bold text-white">
          {value}
        </strong>
      </span>
    </div>
  );
}
