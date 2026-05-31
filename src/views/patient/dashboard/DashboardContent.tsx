import { useEffect, useMemo, useState } from "react";
import NotificationPanel from "../../../components/patient/NotificationPanel";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "../../../hooks/useRouter";
import { readingService } from "../../../services/readingService";
import { getTodayMoodSnapshot, recordMoodForToday } from "../../../services/moodCalendarService";
import { dailyGoals, moodOptions, patientNotifications, weeklyMood } from "../../../data/patientData";
import FindDoctorSection from "./FindDoctorSection";
import MoodCheckInPanel from "./MoodCheckInPanel";
import MoodTrendPanel from "./MoodTrendPanel";
import PatientDashboardHero from "./PatientDashboardHero";
import QuickActionsSection from "./QuickActionsSection";
import WellnessSidebar from "./WellnessSidebar";
import { dashboardGreeting, nameFromEmail } from "./dashboardUtils";

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

  function handleLogout() {
    signOut();
    navigate("/login");
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

      <PatientDashboardHero
        average={average}
        completedGoals={completedGoals}
        currentStreak={currentStreak}
        greeting={dashboardGreeting()}
        isRefreshing={isRefreshing}
        nextGoalTitle={nextGoal?.title || "Record today's mood"}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onRefresh={handleRefreshDashboard}
        patientName={nameFromEmail(email)}
        unreadCount={unreadCount}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          <MoodCheckInPanel
            currentStreak={currentStreak}
            isSavingMood={isSavingMood}
            moodSaveError={moodSaveError}
            onRecordMood={handleRecordMood}
            onSelectMood={setSelectedMood}
            recordedMood={recordedMood}
            selectedMood={selectedMood}
          />
          <MoodTrendPanel average={average} bestMoodDay={bestMoodDay} />
          <FindDoctorSection onNavigate={navigate} />
          <QuickActionsSection onNavigate={navigate} />
        </div>

        <WellnessSidebar completedGoals={completedGoals} onNavigate={navigate} />
      </div>
    </section>
  );
}
