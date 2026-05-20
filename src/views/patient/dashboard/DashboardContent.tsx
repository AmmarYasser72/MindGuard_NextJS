import { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/common/Icon";
import NotificationPanel from "../../../components/patient/NotificationPanel";
import LineChart from "../../../components/common/LineChart";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "../../../hooks/useRouter";
import { readingService } from "../../../services/readingService";
import {
  dailyGoals,
  moodOptions,
  patientNotifications,
  quickActions,
  recentActivities,
  weeklyMood,
  wellnessMetrics,
} from "../../../data/patientData";
import DashboardPanel from "./DashboardPanel";
import GoalRow from "./GoalRow";
import MetricTile from "./MetricTile";

const iconButtonClass = "grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60";

export default function DashboardContent({ email }: { email: string }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [moodSaveError, setMoodSaveError] = useState("");
  const [recordedMood, setRecordedMood] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(patientNotifications);
  const { navigate } = useRouter();
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const average = useMemo(() => Math.round((weeklyMood.reduce((sum, item) => sum + item.value, 0) / weeklyMood.length) * 100), []);
  const completedGoals = dailyGoals.filter((goal) => goal.progress >= 0.7).length;
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNotificationsOpen]);

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function firstName() {
    const name = email.split("@")[0].split(".")[0] || "Patient";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  function handleOpenNotifications() {
    setIsNotificationsOpen(true);
  }

  function handleMarkAllRead() {
    setNotifications((currentNotifications) => currentNotifications.map((notification) => ({ ...notification, unread: false })));
    showToast("All notifications marked as read", "success");
  }

  function handleRefreshDashboard() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast("Dashboard refreshed");
    }, 650);
  }

  async function handleRecordMood() {
    if (selectedMood === null) return;

    const moodValue = selectedMood + 1;
    setIsSavingMood(true);
    setMoodSaveError("");

    try {
      await readingService.savePatientMood(moodValue);
      setRecordedMood(moodOptions[selectedMood].label);
      showToast(`Mood "${moodOptions[selectedMood].label}" recorded!`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save mood right now.";
      setMoodSaveError(message);
      showToast(message, "error");
    } finally {
      setIsSavingMood(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5">
      {isNotificationsOpen ? (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={handleMarkAllRead}
        />
      ) : null}

      <header className="overflow-hidden rounded-lg text-white shadow-sm shadow-indigo-950/10" style={{ background: "linear-gradient(135deg, #4a3b8c 0%, #6366f1 58%, #8b5cf6 100%)" }}>
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-end">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-semibold uppercase text-violet-100">{greeting()}</span>
                <h1 className="mt-1 text-3xl font-bold tracking-normal sm:text-4xl">{firstName()}</h1>
              </div>
              <div className="flex gap-2">
                <button type="button" className={iconButtonClass} aria-label="Logout" title="Logout" onClick={() => { signOut(); navigate("/login"); }}>
                  <Icon name="log-out" size={20} color="#fff" />
                </button>
                <button type="button" className={iconButtonClass} aria-label="Refresh dashboard" title="Refresh dashboard" onClick={handleRefreshDashboard} disabled={isRefreshing}>
                  <Icon name="refresh-cw" size={20} color="#fff" className={isRefreshing ? "animate-spin" : ""} />
                </button>
                <button type="button" className={`${iconButtonClass} relative`} aria-label="Notifications" title="Notifications" onClick={handleOpenNotifications}>
                  <Icon name="bell" size={20} color="#fff" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium text-violet-100">Your care plan is steady today. Keep the next step small and visible.</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-violet-50">
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">Weekly mood {average}%</span>
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">{completedGoals}/{dailyGoals.length} goals on track</span>
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">Next check-in today</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {wellnessMetrics.slice(0, 3).map((metric) => (
              <div className="rounded-lg border border-white/10 bg-white/10 p-3" key={metric.label}>
                <span className="text-xs font-semibold text-violet-100">{metric.label}</span>
                <strong className="mt-2 block text-2xl font-bold">{metric.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5">
          <DashboardPanel className="border-violet-100 bg-violet-50/80">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-[var(--primary)] shadow-sm">
                <Icon name="heart" size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-950">How are you feeling today?</h2>
                <p className="text-sm text-slate-600">Choose the closest match for this moment.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {moodOptions.map((mood, index) => {
                const active = selectedMood === index;
                return (
                  <button type="button" className={`min-h-24 rounded-lg border p-3 text-center transition focus:outline-none focus:ring-4 focus:ring-violet-200 ${active ? "border-[var(--primary)] bg-white shadow-sm shadow-violet-950/10" : "border-violet-100 bg-white/70 hover:border-violet-300 hover:bg-white"}`} key={`${mood.label}-${index}`} onClick={() => setSelectedMood(index)}>
                    <span className="block text-3xl leading-none">{mood.emoji}</span>
                    <small className={`mt-3 block text-xs font-bold ${active ? "text-[var(--primary)]" : "text-slate-500"}`}>{mood.label}</small>
                  </button>
                );
              })}
            </div>
            {moodSaveError ? (
              <div className="mt-4">
                <ErrorState title="Mood could not be saved" message={moodSaveError} actionLabel="Try again" onAction={handleRecordMood} />
              </div>
            ) : null}
            {recordedMood && !moodSaveError ? (
              <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {recordedMood} mood saved for today.
              </div>
            ) : null}
            <button
              type="button"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:bg-[#4f46e5] disabled:bg-slate-300"
              disabled={selectedMood === null || isSavingMood}
              onClick={handleRecordMood}
            >
              <Icon name={isSavingMood ? "loader-circle" : "check-circle"} size={18} color="#fff" className={isSavingMood ? "animate-spin" : ""} />
              {isSavingMood ? "Saving Mood..." : "Record Today's Mood"}
            </button>
          </DashboardPanel>

          <DashboardPanel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">Weekly Mood Journey</h2>
                <p className="text-sm text-slate-500">Average mood this week: <strong className="text-[var(--primary)]">{average}%</strong></p>
              </div>
              <span className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-[var(--primary)]">Stable</span>
            </div>
            <LineChart data={weeklyMood.map((item) => item.value * 100)} color="#6366f1" labels={weeklyMood.map((item) => item.day)} />
          </DashboardPanel>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">Quick Actions</h2>
              <span className="text-xs font-semibold text-slate-500">4 tools</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => (
                <button type="button" className="group grid min-h-32 content-between rounded-lg border border-violet-100 bg-white p-4 text-left shadow-sm shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-100" key={action.label} onClick={() => navigate(action.path)}>
                  <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: action.bg }}>
                    <Icon name={action.icon} size={20} color={action.color} />
                  </span>
                  <strong className="text-sm font-bold text-slate-900">{action.label}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <DashboardPanel>
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-[var(--primary)]">
                <Icon name="calendar" size={18} />
              </span>
              <h2 className="text-base font-bold text-slate-950">Today&apos;s Wellness Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {wellnessMetrics.map((metric) => (
                <MetricTile metric={metric} key={metric.label} />
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-950">Daily Goals</h2>
              <button type="button" className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--primary)] hover:bg-violet-50" onClick={() => navigate("/daily-goals")}>View all</button>
            </div>
            <div className="space-y-4">
              {dailyGoals.length ? dailyGoals.map((goal) => <GoalRow goal={goal} key={goal.title} />) : <EmptyState message="No daily goals yet." />}
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-950">Recent Activity</h2>
              <button type="button" className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--primary)] hover:bg-violet-50" onClick={() => navigate("/recent-activity")}>See all</button>
            </div>
            <div className="space-y-3">
              {recentActivities.length ? recentActivities.map((activity) => (
                <div className="grid grid-cols-[auto_1fr] items-center gap-3" key={activity.title}>
                  <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: `${activity.color}1a` }}>
                    <Icon name={activity.icon} size={20} color={activity.color} />
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm font-bold text-slate-900">{activity.title}</strong>
                    <small className="block text-xs font-medium text-slate-500">{activity.time}</small>
                  </span>
                </div>
              )) : <EmptyState message="No recent activity yet." />}
            </div>
          </DashboardPanel>
        </aside>
      </div>
    </section>
  );
}
