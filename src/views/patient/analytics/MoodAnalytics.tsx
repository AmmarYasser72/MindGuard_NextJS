import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { moodBars, moodInsights } from "../../../data/analyticsData";
import { readingService } from "../../../services/readingService";
import {
  calendarLabels,
  calculateCurrentStreak,
  createCalendarCells,
  formatCheckInTime,
  getSevenDayStrip,
  moodCalendarStorageKey,
  moodColor,
  moodEmojis,
  moodHighlights,
  moodLabels,
  moodSummaries,
  readMoodCalendarEntries,
  saveMoodCalendarEntries,
} from "../../../services/moodCalendarService";
import { loadMoodCalendarEntries } from "../../../services/moodCalendarRemote";
import MoodCalendarModal from "./MoodCalendarModal";
import MoodAnalyticsHeader from "./MoodAnalyticsHeader";
import MoodDaySpotlight from "./MoodDaySpotlight";
import MoodSevenDayStrip from "./MoodSevenDayStrip";
import MoodSummaryCards from "./MoodSummaryCards";
import MoodTrackerCard from "./MoodTrackerCard";

export default function MoodAnalytics() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isHydratingRef = useRef(false);
  const [bars, setBars] = useState(moodBars);
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayDay = today.getDate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [saveMoodError, setSaveMoodError] = useState("");
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [modalSelectedDay, setModalSelectedDay] = useState(todayDay);
  const monthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthLabel = today.toLocaleString("en-US", { month: "long" });
  const patientKey = user?.uid || user?.email || "guest-patient";
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const moodStorageKey = moodCalendarStorageKey(patientKey, monthKey);
  const [monthEntries, setMonthEntries] = useState(() =>
    readMoodCalendarEntries(patientKey, today).entries,
  );
  const [viewEntries, setViewEntries] = useState(monthEntries);
  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [pendingMood, setPendingMood] = useState<number | null>(null);
  const recordedEntries = monthEntries.filter(
    (entry) => entry.recorded && entry.day <= todayDay,
  );
  const averageMood = recordedEntries.length
    ? (
        recordedEntries.reduce((sum, item) => sum + item.mood, 0) /
        recordedEntries.length
      ).toFixed(1)
    : "0.0";
  const positiveMoments = recordedEntries.filter(
    (entry) => entry.mood >= 4,
  ).length;
  const days = getSevenDayStrip(monthEntries, selectedDay, monthDays);
  const selectedEntry =
    monthEntries.find((entry) => entry.day === selectedDay) || monthEntries[0];
  const currentStreak = calculateCurrentStreak(monthEntries, todayDay);
  const viewMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const viewMonthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(
    "en-US",
    { month: "long" },
  );
  const isViewingCurrentMonth =
    viewYear === currentYear && viewMonth === currentMonth;
  const viewTodayLimit = isViewingCurrentMonth ? todayDay : viewMonthDays;
  const shownViewEntries = isViewingCurrentMonth ? monthEntries : viewEntries;
  const viewCalendarCells = createCalendarCells(
    shownViewEntries,
    new Date(viewYear, viewMonth, 1).getDay(),
  );
  const modalSelectedEntry =
    shownViewEntries.find((entry) => entry.day === modalSelectedDay) ||
    shownViewEntries[0];
  const canGoNextMonth =
    viewYear < currentYear ||
    (viewYear === currentYear && viewMonth < currentMonth);

  useEffect(() => {
    let isMounted = true;
    isHydratingRef.current = true;

    loadMoodCalendarEntries(patientKey, today).then((calendar) => {
      if (!isMounted) return;
      setMonthEntries(calendar.entries);
      setViewEntries(calendar.entries);
    });

    return () => {
      isMounted = false;
    };
  }, [moodStorageKey, monthDays, patientKey, today, todayDay]);

  useEffect(() => {
    let isMounted = true;
    const viewDate = new Date(viewYear, viewMonth, 1);

    loadMoodCalendarEntries(patientKey, viewDate).then((calendar) => {
      if (!isMounted) return;
      setViewEntries(calendar.entries);
    });

    return () => {
      isMounted = false;
    };
  }, [patientKey, viewMonth, viewYear]);

  useEffect(() => {
    window.queueMicrotask(() => {
      setSelectedDay((currentDay) => Math.min(currentDay, todayDay, monthDays));
    });
  }, [monthDays, todayDay]);

  useEffect(() => {
    const nextEntry = monthEntries.find((entry) => entry.day === selectedDay);
    window.queueMicrotask(() => {
      setPendingMood(nextEntry?.recorded ? nextEntry.mood : null);
    });
  }, [monthEntries, selectedDay]);

  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }

    saveMoodCalendarEntries(patientKey, monthEntries, today);
  }, [monthEntries, moodStorageKey, patientKey, today]);

  function cycle(index) {
    setBars((current) =>
      current.map((bar, barIndex) => {
        if (barIndex !== index) return bar;
        const mood = bar.mood >= 5 ? 1 : bar.mood + 1;
        return { ...bar, mood, emoji: moodEmojis[mood - 1] };
      }),
    );
  }

  function handleSelectDay(day) {
    if (day > todayDay) {
      showToast(
        "Wait until this day arrives to record your mood and continue your streak.",
      );
      return;
    }
    setSelectedDay(day);
  }

  async function recordMoodForDay() {
    if (selectedDay > todayDay) {
      showToast(
        "Wait until this day arrives to record your mood and continue your streak.",
      );
      return;
    }

    if (!pendingMood) {
      showToast("Choose a mood first, then record your streak.");
      return;
    }

    setIsSavingMood(true);
    setSaveMoodError("");
    try {
      await readingService.savePatientMood(pendingMood);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save mood to the backend.";
      setSaveMoodError(message);
      showToast(message, "error");
      setIsSavingMood(false);
      return;
    }

    setMonthEntries((currentEntries) =>
      currentEntries.map((entry) => {
        if (entry.day !== selectedDay) return entry;

        return {
          ...entry,
          checkInTime:
            entry.day === todayDay
              ? formatCheckInTime(today)
              : entry.checkInTime,
          emoji: moodEmojis[pendingMood - 1],
          highlight: moodHighlights[pendingMood - 1],
          label: moodLabels[pendingMood - 1],
          mood: pendingMood,
          recorded: true,
          summary: moodSummaries[pendingMood - 1],
        };
      }),
    );

    showToast(
      `Mood saved for ${calendarLabels[new Date(currentYear, currentMonth, selectedDay).getDay()]} ${selectedDay}.`,
      "success",
    );
    setSaveMoodError("");
    setIsSavingMood(false);
  }

  function getDayLabel(day) {
    return calendarLabels[new Date(currentYear, currentMonth, day).getDay()];
  }

  function getViewDayLabel(day) {
    return calendarLabels[new Date(viewYear, viewMonth, day).getDay()];
  }

  function openCalendar() {
    setViewYear(currentYear);
    setViewMonth(currentMonth);
    setModalSelectedDay(selectedDay);
    setSaveMoodError("");
    setIsCalendarOpen(true);
  }

  function changeViewMonth(direction) {
    const next = new Date(viewYear, viewMonth + direction, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();

    if (
      nextYear > currentYear ||
      (nextYear === currentYear && nextMonth > currentMonth)
    ) {
      return;
    }

    const nextMonthDays = new Date(nextYear, nextMonth + 1, 0).getDate();
    setViewYear(nextYear);
    setViewMonth(nextMonth);
    setModalSelectedDay((day) => Math.min(day, nextMonthDays));
  }

  function handleSelectModalDay(day) {
    if (day > viewTodayLimit) {
      showToast(
        "Wait until this day arrives to record your mood and continue your streak.",
      );
      return;
    }

    setModalSelectedDay(day);
    setSaveMoodError("");
    if (isViewingCurrentMonth) {
      setSelectedDay(day);
    }
  }

  return (
    <div className="grid gap-5 p-6 sm:gap-6 sm:p-8">
      <MoodAnalyticsHeader
        currentStreak={currentStreak}
        onOpenCalendar={openCalendar}
      />
      <MoodCalendarModal
        calendarCells={viewCalendarCells}
        calendarLabels={calendarLabels}
        canGoNextMonth={canGoNextMonth}
        canRecord={isViewingCurrentMonth && modalSelectedDay <= todayDay}
        changeViewMonth={changeViewMonth}
        getDayLabel={getViewDayLabel}
        handleSelectDay={handleSelectModalDay}
        isOpen={isCalendarOpen}
        isSavingMood={isSavingMood}
        isViewingCurrentMonth={isViewingCurrentMonth}
        monthLabel={viewMonthLabel}
        moodColor={moodColor}
        moodEmojis={moodEmojis}
        moodLabels={moodLabels}
        onClose={() => setIsCalendarOpen(false)}
        pendingMood={pendingMood}
        recordMoodForDay={recordMoodForDay}
        saveMoodError={saveMoodError}
        selectedDay={modalSelectedDay}
        selectedEntry={modalSelectedEntry}
        setPendingMood={setPendingMood}
        todayDay={viewTodayLimit}
        viewYear={viewYear}
      />
      <MoodSevenDayStrip
        days={days}
        getDayLabel={getDayLabel}
        onSelectDay={handleSelectDay}
        selectedDay={selectedDay}
        todayDay={todayDay}
      />
      <MoodDaySpotlight
        getDayLabel={getDayLabel}
        monthLabel={monthLabel}
        selectedDay={selectedDay}
        selectedEntry={selectedEntry}
      />
      <MoodSummaryCards
        averageMood={averageMood}
        currentStreak={currentStreak}
        positiveMoments={positiveMoments}
        recordedCount={recordedEntries.length || 0}
      />
      <MoodTrackerCard
        bars={bars}
        cycle={cycle}
        moodColor={moodColor}
        moodInsights={moodInsights}
        moodLabels={moodLabels}
      />
    </div>
  );
}
