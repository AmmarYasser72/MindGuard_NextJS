import { useEffect, useRef, useState } from "react";
import Icon from "../../../components/common/Icon";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { moodBars, moodInsights } from "../../../data/analyticsData";
import { readingService } from "../../../services/readingService";
import { storage } from "../../../services/storage";
import MoodCalendarModal from "./MoodCalendarModal";
import MoodDaySpotlight from "./MoodDaySpotlight";
import MoodSummaryCards from "./MoodSummaryCards";
import MoodTrackerCard from "./MoodTrackerCard";

const moodEmojis = ["\u{1F620}", "\u{1F622}", "\u{1F610}", "\u{1F60A}", "\u{1F60D}"];
const moodLabels = ["Very low", "Low", "Balanced", "Good", "Excellent"];
const calendarLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const moodSummaries = [
  "Today felt heavy, so smaller goals and extra support matter most.",
  "There were some difficult moments, but you still checked in and stayed aware.",
  "Your mood stayed balanced and steady through most of the day.",
  "You handled the day well and had a few uplifting moments.",
  "You felt very positive today and your energy was noticeably better.",
];
const moodHighlights = [
  "Try a short grounding exercise and keep the schedule light.",
  "Take a breathing break and check in again later this evening.",
  "A consistent routine is helping you stay emotionally steady.",
  "Your healthy rhythm is showing up in sleep and motivation.",
  "This is a strong day to repeat the habits that helped you feel good.",
];
const moodCheckInTimes = ["08:15 AM", "09:40 AM", "11:10 AM", "01:20 PM", "03:05 PM", "05:30 PM", "08:10 PM"];
const moodPattern = [4, 5, 3, 4, 2, 3, 4, 5, 4, 3, 2, 4, 5, 4, 3, 2, 3, 4, 5, 4, 3, 4, 2, 3, 4, 5, 4, 3, 4, 5, 4];

type MoodEntry = {
  checkInTime: string;
  day: number;
  emoji: string;
  highlight: string;
  label: string;
  mood: number;
  recorded: boolean;
  summary: string;
};

export default function MoodAnalytics() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isHydratingRef = useRef(false);
  const [bars, setBars] = useState(moodBars);
  const today = new Date();
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
  const moodStorageKey = `patient_mood_calendar_${patientKey}_${monthKey}`;
  const [monthEntries, setMonthEntries] = useState(() => hydrateMonthEntries(storage.get(moodStorageKey, null), monthDays, todayDay));
  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [pendingMood, setPendingMood] = useState<number | null>(null);
  const recordedEntries = monthEntries.filter((entry) => entry.recorded && entry.day <= todayDay);
  const averageMood = recordedEntries.length
    ? (recordedEntries.reduce((sum, item) => sum + item.mood, 0) / recordedEntries.length).toFixed(1)
    : "0.0";
  const positiveMoments = recordedEntries.filter((entry) => entry.mood >= 4).length;
  const days = getSevenDayStrip(monthEntries, selectedDay, monthDays);
  const selectedEntry = monthEntries.find((entry) => entry.day === selectedDay) || monthEntries[0];
  const currentStreak = calculateCurrentStreak(monthEntries, todayDay);
  const viewMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const viewMonthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", { month: "long" });
  const viewMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const viewStorageKey = `patient_mood_calendar_${patientKey}_${viewMonthKey}`;
  const isViewingCurrentMonth = viewYear === currentYear && viewMonth === currentMonth;
  const viewTodayLimit = isViewingCurrentMonth ? todayDay : viewMonthDays;
  const viewEntries = isViewingCurrentMonth
    ? monthEntries
    : hydrateMonthEntries(storage.get(viewStorageKey, null), viewMonthDays, viewTodayLimit);
  const viewCalendarCells = createCalendarCells(viewEntries, new Date(viewYear, viewMonth, 1).getDay());
  const modalSelectedEntry = viewEntries.find((entry) => entry.day === modalSelectedDay) || viewEntries[0];
  const canGoNextMonth = viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth);

  useEffect(() => {
    let isMounted = true;
    isHydratingRef.current = true;

    window.queueMicrotask(() => {
      if (isMounted) {
        setMonthEntries(hydrateMonthEntries(storage.get(moodStorageKey, null), monthDays, todayDay));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [moodStorageKey, monthDays, todayDay]);

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

    storage.set(moodStorageKey, monthEntries);
  }, [monthEntries, moodStorageKey]);

  function cycle(index) {
    setBars((current) => current.map((bar, barIndex) => {
      if (barIndex !== index) return bar;
      const mood = bar.mood >= 5 ? 1 : bar.mood + 1;
      return { ...bar, mood, emoji: moodEmojis[mood - 1] };
    }));
  }

  function handleSelectDay(day) {
    if (day > todayDay) {
      showToast("Wait until this day arrives to record your mood and continue your streak.");
      return;
    }
    setSelectedDay(day);
  }

  async function recordMoodForDay() {
    if (selectedDay > todayDay) {
      showToast("Wait until this day arrives to record your mood and continue your streak.");
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
      const message = error instanceof Error ? error.message : "Unable to save mood to the backend.";
      setSaveMoodError(message);
      showToast(message, "error");
      setIsSavingMood(false);
      return;
    }

    setMonthEntries((currentEntries) => currentEntries.map((entry) => {
      if (entry.day !== selectedDay) return entry;

      return {
        ...entry,
        checkInTime: entry.day === todayDay ? formatCheckInTime(today) : entry.checkInTime,
        emoji: moodEmojis[pendingMood - 1],
        highlight: moodHighlights[pendingMood - 1],
        label: moodLabels[pendingMood - 1],
        mood: pendingMood,
        recorded: true,
        summary: moodSummaries[pendingMood - 1],
      };
    }));

    showToast(`Mood saved for ${calendarLabels[new Date(currentYear, currentMonth, selectedDay).getDay()]} ${selectedDay}.`, "success");
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

    if (nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth)) {
      return;
    }

    const nextMonthDays = new Date(nextYear, nextMonth + 1, 0).getDate();
    setViewYear(nextYear);
    setViewMonth(nextMonth);
    setModalSelectedDay((day) => Math.min(day, nextMonthDays));
  }

  function handleSelectModalDay(day) {
    if (day > viewTodayLimit) {
      showToast("Wait until this day arrives to record your mood and continue your streak.");
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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="grid gap-1.5">
          <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.04em] text-slate-950">Mood Calendar</h2>
          <small className="text-sm leading-6 text-slate-500 sm:text-[0.95rem]">Every daily check-in is grouped into one monthly snapshot.</small>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <span className="inline-flex min-h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-lg font-black text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
            <Icon name="flame" size={24} color="#f59e0b" />
            {currentStreak} day streak
          </span>
          <button
            type="button"
            className="inline-flex min-h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-lg font-black text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
            onClick={openCalendar}
          >
            <Icon name="calendar-days" size={24} color="#10b981" />
            Open calendar
          </button>
        </div>
      </div>
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
      <div className="grid auto-cols-[72px] grid-flow-col gap-2 overflow-x-auto pb-1 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-7">
        {days.map((dayEntry) => {
          const day = dayEntry.day;
          const isToday = day === todayDay;
          const isSelected = day === selectedDay;
          const isFuture = day > todayDay;
          return (
            <button
              type="button"
              aria-pressed={isSelected}
              className={`grid min-w-[72px] gap-2 rounded-[1.25rem] border px-3 py-3 text-center transition ${
                isSelected
                  ? "border-violet-300 bg-violet-50 shadow-sm shadow-violet-900/10"
                  : isToday
                    ? "border-violet-200 bg-white"
                    : "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]"
              } ${isFuture ? "text-slate-300" : "text-slate-600"}`}
              key={day}
              onClick={() => handleSelectDay(day)}
            >
              <small className="text-xs font-black uppercase tracking-[0.14em]">{getDayLabel(day)}</small>
              <strong className={`text-lg font-bold ${isToday ? "text-[var(--primary)]" : ""}`}>{day}</strong>
              <span className={`text-lg ${isFuture ? "opacity-25" : ""}`}>{isFuture || !dayEntry?.recorded ? "" : dayEntry.emoji}</span>
            </button>
          );
        })}
      </div>
      <MoodDaySpotlight getDayLabel={getDayLabel} monthLabel={monthLabel} selectedDay={selectedDay} selectedEntry={selectedEntry} />
      <MoodSummaryCards
        averageMood={averageMood}
        currentStreak={currentStreak}
        positiveMoments={positiveMoments}
        recordedCount={recordedEntries.length || 0}
      />
      <MoodTrackerCard bars={bars} cycle={cycle} moodColor={moodColor} moodInsights={moodInsights} moodLabels={moodLabels} />
    </div>
  );
}

function moodColor(mood) {
  return ["#ef4444", "#f59e0b", "#6b7280", "#10b981", "#3b82f6"][mood - 1] || "#6b7280";
}

function getSevenDayStrip(entries: MoodEntry[], selectedDay: number, daysInMonth: number) {
  const start = Math.min(Math.max(1, selectedDay - 3), Math.max(1, daysInMonth - 6));
  return entries.slice(start - 1, start + 6);
}

function createMonthEntries(daysInMonth: number, todayDay: number): MoodEntry[] {
  return Array.from({ length: daysInMonth }, (_, index) => {
    const mood = moodPattern[index % moodPattern.length];
    const day = index + 1;
    const recorded = day < todayDay ? day % 6 !== 0 : false;
    return {
      day,
      mood,
      recorded,
      emoji: moodEmojis[mood - 1],
      label: moodLabels[mood - 1],
      summary: moodSummaries[mood - 1],
      highlight: moodHighlights[mood - 1],
      checkInTime: moodCheckInTimes[index % moodCheckInTimes.length],
    };
  });
}

function hydrateMonthEntries(savedEntries: unknown, daysInMonth: number, todayDay: number): MoodEntry[] {
  const defaultEntries = createMonthEntries(daysInMonth, todayDay);

  if (!Array.isArray(savedEntries)) {
    return defaultEntries;
  }

  return defaultEntries.map((entry) => {
    const savedEntry = savedEntries.find((item) => item?.day === entry.day);

    if (!savedEntry) {
      return entry;
    }

    const mood = Number(savedEntry.mood);
    const safeMood = Number.isInteger(mood) && mood >= 1 && mood <= 5 ? mood : entry.mood;
    const isFutureDay = entry.day > todayDay;

    return {
      ...entry,
      mood: safeMood,
      recorded: isFutureDay ? false : Boolean(savedEntry.recorded),
      emoji: moodEmojis[safeMood - 1],
      label: moodLabels[safeMood - 1],
      summary: moodSummaries[safeMood - 1],
      highlight: moodHighlights[safeMood - 1],
      checkInTime: typeof savedEntry.checkInTime === "string" && savedEntry.checkInTime ? savedEntry.checkInTime : entry.checkInTime,
    };
  });
}

function createCalendarCells(entries: MoodEntry[], firstDayOfMonth: number) {
  const leadingPlaceholders = Array.from({ length: firstDayOfMonth }, () => null);
  const cells = [...leadingPlaceholders, ...entries];
  const trailingCount = (7 - (cells.length % 7)) % 7;
  return [...cells, ...Array.from({ length: trailingCount }, () => null)];
}

function calculateCurrentStreak(entries: MoodEntry[], todayDay: number) {
  let streak = 0;

  for (let day = 1; day <= todayDay; day += 1) {
    const entry = entries.find((item) => item.day === day);

    if (entry?.recorded) {
      streak += 1;
    } else {
      streak = 0;
    }
  }

  return streak;
}

function formatCheckInTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
