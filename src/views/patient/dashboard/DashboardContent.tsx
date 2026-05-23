import { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/common/Icon";
import NotificationPanel from "../../../components/patient/NotificationPanel";
import LineChart from "../../../components/common/LineChart";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import ThemeToggle from "../../../components/common/ThemeToggle";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "../../../hooks/useRouter";
import { readingService } from "../../../services/readingService";
import { getTodayMoodSnapshot, recordMoodForToday } from "../../../services/moodCalendarService";
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

const iconButtonClass = "grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:hover:translate-y-0";

export default function DashboardContent({ email }: { email: string }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [moodSaveError, setMoodSaveError] = useState("");
  const [recordedMood, setRecordedMood] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(patientNotifications);
  const { navigate } = useRouter();
  const { signOut, user } = useAuth();
  const { showToast } = useToast();
  const patientKey = user?.uid || user?.email || email || "guest-patient";
  const [currentStreak, setCurrentStreak] = useState(0);
  const average = useMemo(() => Math.round((weeklyMood.reduce((sum, item) => sum + item.value, 0) / weeklyMood.length) * 100), []);
  const completedGoals = dailyGoals.filter((goal) => goal.progress >= 0.7).length;
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const nextGoal = dailyGoals.find((goal) => goal.progress < 0.7) || dailyGoals[0];
  const bestMoodDay = weeklyMood.reduce((best, item) => (item.value > best.value ? item : best), weeklyMood[0]);

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

  useEffect(() => {
    window.queueMicrotask(() => {
      const snapshot = getTodayMoodSnapshot(patientKey);
      setCurrentStreak(snapshot.currentStreak);

      if (snapshot.todayEntry?.recorded) {
        setSelectedMood(snapshot.todayEntry.mood - 1);
        setRecordedMood(snapshot.todayEntry.label);
      }
    });
  }, [patientKey]);

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
      const moodSnapshot = recordMoodForToday(patientKey, moodValue);
      const label = moodSnapshot.todayEntry?.label || moodOptions[selectedMood].label;
      setRecordedMood(label);
      setCurrentStreak(moodSnapshot.currentStreak);
      showToast(`Mood "${label}" recorded. ${moodSnapshot.currentStreak} day streak.`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save mood right now.";
      setMoodSaveError(message);
      showToast(message, "error");
    } finally {
      setIsSavingMood(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      {isNotificationsOpen ? (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={handleMarkAllRead}
        />
      ) : null}

      <header className="patient-hero overflow-hidden rounded-lg border text-white shadow-lg shadow-indigo-950/10">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)] lg:p-7">
          <div className="grid content-between gap-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-100">Patient dashboard</span>
                <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">{greeting()}, {firstName()}</h1>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-violet-100 sm:text-base">
                  Your care plan is steady today. Keep the next step small, visible, and easy to finish.
                </p>
              </div>
              <div className="patient-hero-actions flex shrink-0 flex-wrap justify-end gap-2">
                <ThemeToggle variant="patient" />
                <button type="button" className={iconButtonClass} aria-label="Logout" title="Logout" onClick={() => { signOut(); navigate("/login"); }}>
                  <Icon name="log-out" size={20} color="#fff" />
                </button>
                <button type="button" className={iconButtonClass} aria-label="Refresh dashboard" title="Refresh dashboard" onClick={handleRefreshDashboard} disabled={isRefreshing}>
                  <Icon name="refresh-cw" size={20} color="#fff" className={isRefreshing ? "animate-spin" : ""} />
                </button>
                <button type="button" className={`${iconButtonClass} relative`} aria-label="Notifications" title="Notifications" onClick={handleOpenNotifications}>
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
              <HeaderStat icon="activity" label="Weekly mood" value={`${average}%`} />
              <HeaderStat icon="check-circle" label="Goals on track" value={`${completedGoals}/${dailyGoals.length}`} />
              <HeaderStat icon="flame" label="Mood streak" value={`${currentStreak} day${currentStreak === 1 ? "" : "s"}`} />
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-sm shadow-indigo-950/10 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-violet-100">Today</span>
                <h2 className="mt-1 text-lg font-bold">Care snapshot</h2>
              </div>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-violet-50">On pace</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {wellnessMetrics.slice(0, 3).map((metric) => (
                <div className="rounded-lg border border-white/10 bg-white/10 p-3" key={metric.label}>
                  <span className="text-xs font-semibold text-violet-100">{metric.label}</span>
                  <strong className="mt-2 block text-2xl font-bold">{metric.value}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-white/10 p-3">
              <span className="text-xs font-semibold text-violet-100">Next useful step</span>
              <strong className="mt-1 block text-sm font-bold text-white">{nextGoal?.title || "Record today's mood"}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          <DashboardPanel className="patient-checkin-panel">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[var(--primary)] shadow-sm shadow-violet-950/5">
                  <Icon name="heart" size={19} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-950">How are you feeling today?</h2>
                  <p className="text-sm text-slate-600">Choose the closest match for this moment.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="w-fit rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm shadow-violet-950/5">1 minute check-in</span>
                <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-amber-600 shadow-sm shadow-violet-950/5">
                  <Icon name="flame" size={14} color="#f59e0b" />
                  {currentStreak} day streak
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {moodOptions.map((mood, index) => {
                const active = selectedMood === index;
                return (
                  <button
                    type="button"
                    className={`patient-mood-button grid min-h-28 content-center justify-items-center rounded-lg border p-3 text-center transition focus:outline-none focus:ring-4 focus:ring-violet-200 ${active ? "is-active border-[var(--primary)] bg-white shadow-md shadow-violet-950/10" : "border-violet-100 bg-white/70 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white hover:shadow-sm"}`}
                    key={`${mood.label}-${index}`}
                    onClick={() => setSelectedMood(index)}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-lg text-3xl leading-none" style={{ backgroundColor: mood.bg }}>
                      {mood.emoji}
                    </span>
                    <small className={`mt-3 block text-xs font-bold ${active ? "text-[var(--primary)]" : "text-slate-600"}`}>{mood.label}</small>
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
              className="dashboard-primary-btn mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-slate-300"
              disabled={selectedMood === null || isSavingMood}
              onClick={handleRecordMood}
            >
              <Icon name={isSavingMood ? "loader-circle" : "check-circle"} size={18} color="#fff" className={isSavingMood ? "animate-spin" : ""} />
              {isSavingMood ? "Saving mood..." : "Record today's mood"}
            </button>
          </DashboardPanel>

          <DashboardPanel>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Mood trend</span>
                <h2 className="mt-1 text-lg font-bold text-slate-950">Weekly Mood Journey</h2>
                <p className="mt-1 text-sm text-slate-500">Average mood this week: <strong className="text-[var(--primary)]">{average}%</strong></p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-right sm:min-w-44">
                <MiniStat label="Peak" value={`${Math.round(bestMoodDay.value * 100)}%`} />
                <MiniStat label="Status" value="Stable" />
              </div>
            </div>
            <LineChart data={weeklyMood.map((item) => item.value * 100)} color="#6366f1" labels={weeklyMood.map((item) => item.day)} />
          </DashboardPanel>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Tools</span>
                <h2 className="mt-1 text-lg font-bold text-slate-950">Quick Actions</h2>
              </div>
              <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm shadow-violet-950/5">{quickActions.length} tools</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  type="button"
                  className="patient-action-card group grid min-h-32 content-between rounded-lg border border-violet-100 bg-white p-4 text-left shadow-sm shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-100"
                  key={action.label}
                  onClick={() => navigate(action.path)}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: action.bg }}>
                      <Icon name={action.icon} size={20} color={action.color} />
                    </span>
                    <Icon name="arrow-up-right" size={16} color="#94a3b8" className="transition group-hover:text-[var(--primary)]" />
                  </span>
                  <strong className="text-sm font-bold text-slate-900">{action.label}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <DashboardPanel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-[var(--primary)]">
                  <Icon name="calendar" size={18} />
                </span>
                <h2 className="text-base font-bold text-slate-950">Wellness Summary</h2>
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
                <p className="mt-1 text-sm text-slate-500">{completedGoals} of {dailyGoals.length} on track</p>
              </div>
              <button type="button" className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--primary)] hover:bg-violet-50" onClick={() => navigate("/daily-goals")}>View all</button>
            </div>
            <div className="space-y-3">
              {dailyGoals.length ? dailyGoals.map((goal) => <GoalRow goal={goal} key={goal.title} />) : <EmptyState message="No daily goals yet." />}
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest care actions</p>
              </div>
              <button type="button" className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--primary)] hover:bg-violet-50" onClick={() => navigate("/recent-activity")}>See all</button>
            </div>
            <div className="space-y-3">
              {recentActivities.length ? recentActivities.map((activity) => (
                <div className="patient-list-row grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3" key={activity.title}>
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

function HeaderStat({ icon, label, value }) {
  return (
    <div className="patient-hero-stat flex min-h-16 items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
        <Icon name={icon} size={18} color="#fff" />
      </span>
      <span className="min-w-0">
        <small className="block truncate text-xs font-semibold text-violet-100">{label}</small>
        <strong className="block text-base font-bold text-white">{value}</strong>
      </span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <span className="patient-mini-stat rounded-lg bg-violet-50 px-3 py-2 text-left">
      <small className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</small>
      <strong className="mt-1 block text-sm font-bold text-slate-900">{value}</strong>
    </span>
  );
}
