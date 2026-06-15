import { useCallback, useEffect, useMemo, useState } from "react";
import NotificationPanel from "../../../components/patient/NotificationPanel";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "../../../hooks/useRouter";
import { readingService } from "../../../services/readingService";
import {
  MOOD_CALENDAR_UPDATED_EVENT,
  getTodayMoodSnapshot,
  moodCalendarMonthKey,
  recordMoodForToday,
  type MoodCalendarUpdateDetail,
} from "../../../services/moodCalendarService";
import { loadMoodCalendarEntries } from "../../../services/moodCalendarRemote";
import {
  dailyGoals,
  moodOptions,
  patientNotifications,
  weeklyMood,
} from "../../../data/patientData";
import { slotService } from "../../../services/slotService";
import {
  SLOT_CHANGE_EVENT,
  isSlotStorageEvent,
} from "../../../services/slotSync";
import FindDoctorSection from "./FindDoctorSection";
import MoodCheckInPanel from "./MoodCheckInPanel";
import MoodTrendPanel from "./MoodTrendPanel";
import PatientAppointmentsSection from "./PatientAppointmentsSection";
import PatientDashboardHero from "./PatientDashboardHero";
import QuickActionsSection from "./QuickActionsSection";
import WellnessSidebar from "./WellnessSidebar";
import { dashboardGreeting, nameFromEmail } from "./dashboardUtils";
import type { DoctorSession } from "../../../types/doctor";

type PatientNotification = (typeof patientNotifications)[number];

export default function DashboardContent({ email }: { email: string }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [moodSaveError, setMoodSaveError] = useState("");
  const [recordedMood, setRecordedMood] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [sessionNotifications, setSessionNotifications] = useState<
    PatientNotification[]
  >([]);
  const { navigate } = useRouter();
  const { signOut, user } = useAuth();
  const { showToast } = useToast();
  const patientKey = user?.uid || user?.email || email || "guest-patient";
  const currentMoodMonthKey = moodCalendarMonthKey();
  const patientDetails = useMemo(
    () => ({
      patientEmail: user?.email || email || "",
      patientId: user?.uid || user?._id || user?.id || user?.email || email,
      patientName: user?.displayName || email?.split("@")[0] || "Patient",
    }),
    [email, user],
  );
  const [currentStreak, setCurrentStreak] = useState(0);

  const average = useMemo(
    () =>
      Math.round(
        (weeklyMood.reduce((sum, item) => sum + item.value, 0) /
          weeklyMood.length) *
          100,
      ),
    [],
  );
  const completedGoals = dailyGoals.filter(
    (goal) => goal.progress >= 0.7,
  ).length;
  const notifications = useMemo(
    () =>
      [...sessionNotifications, ...patientNotifications].map(
        (notification) => ({
          ...notification,
          unread:
            notification.unread && !readNotificationIds.has(notification.id),
        }),
      ),
    [readNotificationIds, sessionNotifications],
  );
  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;
  const nextGoal =
    dailyGoals.find((goal) => goal.progress < 0.7) || dailyGoals[0];
  const bestMoodDay = weeklyMood.reduce(
    (best, item) => (item.value > best.value ? item : best),
    weeklyMood[0],
  );

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

  const syncTodayMoodSnapshot = useCallback(() => {
    const snapshot = getTodayMoodSnapshot(patientKey);
    setCurrentStreak(snapshot.currentStreak);

    if (snapshot.todayEntry?.recorded) {
      setSelectedMood(snapshot.todayEntry.mood - 1);
      setRecordedMood(snapshot.todayEntry.label);
      return;
    }

    setSelectedMood(null);
    setRecordedMood(null);
  }, [patientKey]);

  useEffect(() => {
    let isMounted = true;

    loadMoodCalendarEntries(patientKey)
      .catch(() => null)
      .then(() => {
        if (!isMounted) return;
        syncTodayMoodSnapshot();
      });

    return () => {
      isMounted = false;
    };
  }, [patientKey, syncTodayMoodSnapshot]);

  useEffect(() => {
    function handleMoodCalendarUpdated(event: Event) {
      const detail = (event as CustomEvent<MoodCalendarUpdateDetail>).detail;
      if (
        detail?.patientKey !== patientKey ||
        detail.monthKey !== currentMoodMonthKey
      ) {
        return;
      }

      syncTodayMoodSnapshot();
    }

    window.addEventListener(
      MOOD_CALENDAR_UPDATED_EVENT,
      handleMoodCalendarUpdated,
    );
    return () =>
      window.removeEventListener(
        MOOD_CALENDAR_UPDATED_EVENT,
        handleMoodCalendarUpdated,
      );
  }, [currentMoodMonthKey, patientKey, syncTodayMoodSnapshot]);

  const loadSessionNotifications = useCallback(async () => {
    try {
      const patientSlots = await slotService.getPatientSlots(patientDetails);
      setSessionNotifications(
        patientSlots
          .map(sessionUpdateNotification)
          .filter((notification): notification is PatientNotification =>
            Boolean(notification),
          ),
      );
    } catch {
      setSessionNotifications([]);
    }
  }, [patientDetails]);

  useEffect(() => {
    window.queueMicrotask(loadSessionNotifications);
  }, [loadSessionNotifications]);

  useEffect(() => {
    function handleSlotChange() {
      void loadSessionNotifications();
    }

    function handleStorage(event: StorageEvent) {
      if (!isSlotStorageEvent(event)) return;
      void loadSessionNotifications();
    }

    window.addEventListener(SLOT_CHANGE_EVENT, handleSlotChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(SLOT_CHANGE_EVENT, handleSlotChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadSessionNotifications]);

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  function handleMarkAllRead() {
    setReadNotificationIds(
      new Set(notifications.map((notification) => notification.id)),
    );
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
      const label =
        moodSnapshot.todayEntry?.label || moodOptions[selectedMood].label;
      setRecordedMood(label);
      setCurrentStreak(moodSnapshot.currentStreak);
      showToast(
        `Mood "${label}" recorded. ${moodSnapshot.currentStreak} day streak.`,
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save mood right now.";
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
          <PatientAppointmentsSection onNavigate={navigate} />
          <FindDoctorSection onNavigate={navigate} />
          <QuickActionsSection onNavigate={navigate} />
        </div>

        <WellnessSidebar
          completedGoals={completedGoals}
          onNavigate={navigate}
        />
      </div>
    </section>
  );
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sessionUpdateNotification(
  session: DoctorSession,
): PatientNotification | null {
  const note =
    cleanText(session.notes) ||
    cleanText(session.raw?.doctorNote) ||
    cleanText(session.raw?.notes);
  const updatedAt =
    cleanText(session.raw?.patientNotificationAt) ||
    cleanText(session.raw?.sessionUpdatedAt);
  const message = cleanText(session.raw?.patientNotificationMessage);

  if (!updatedAt || (!note && !message)) return null;

  return {
    id: `session-update-${session.id}-${updatedAt}`,
    title: cleanText(session.raw?.patientNotificationTitle) || "Session updated",
    message:
      message ||
      `Your doctor updated your session for ${formatNotificationDate(session.scheduledAt)}. Note: ${note}`,
    time: relativeNotificationTime(updatedAt),
    icon: "calendar-check",
    color: "#0f766e",
    bg: "#ccfbf1",
    category: cleanText(session.raw?.patientNotificationCategory) || "Session",
    value: cleanText(session.raw?.patientNotificationValue) || "Doctor note",
    unread: true,
  };
}

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function relativeNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated recently";

  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 60000),
  );
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
