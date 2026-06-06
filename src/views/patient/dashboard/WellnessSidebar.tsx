import Icon from "../../../components/common/Icon";
import EmptyState from "../../../components/common/EmptyState";
import {
  dailyGoals,
  recentActivities,
  wellnessMetrics,
} from "../../../data/patientData";
import DashboardPanel from "./DashboardPanel";
import GoalRow from "./GoalRow";
import MetricTile from "./MetricTile";

type WellnessSidebarProps = {
  completedGoals: number;
  onNavigate: (path: string) => void;
};

export default function WellnessSidebar({
  completedGoals,
  onNavigate,
}: WellnessSidebarProps) {
  return (
    <aside className="space-y-6">
      <DashboardPanel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-[var(--primary)]">
              <Icon name="calendar" size={18} />
            </span>
            <h2 className="text-base font-bold text-slate-950">
              Wellness Summary
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">Today</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {wellnessMetrics.map((metric) => (
            <MetricTile metric={metric} key={metric.label} />
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">Daily Goals</h2>
            <p className="mt-1 text-sm text-slate-500">
              {completedGoals} of {dailyGoals.length} on track
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--primary)] hover:bg-violet-50"
            onClick={() => onNavigate("/daily-goals")}
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {dailyGoals.length ? (
            dailyGoals.map((goal) => <GoalRow goal={goal} key={goal.title} />)
          ) : (
            <EmptyState message="No daily goals yet." />
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Recent Activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest care actions
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--primary)] hover:bg-violet-50"
            onClick={() => onNavigate("/recent-activity")}
          >
            See all
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.length ? (
            recentActivities.map((activity) => (
              <div
                className="patient-list-row grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                key={activity.title}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-lg"
                  style={{ backgroundColor: `${activity.color}1a` }}
                >
                  <Icon name={activity.icon} size={20} color={activity.color} />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-bold text-slate-900">
                    {activity.title}
                  </strong>
                  <small className="block text-xs font-medium text-slate-500">
                    {activity.time}
                  </small>
                </span>
              </div>
            ))
          ) : (
            <EmptyState message="No recent activity yet." />
          )}
        </div>
      </DashboardPanel>
    </aside>
  );
}
