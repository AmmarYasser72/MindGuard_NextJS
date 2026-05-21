import { storage } from "./storage";

export const moodEmojis = ["\u{1F620}", "\u{1F622}", "\u{1F610}", "\u{1F60A}", "\u{1F60D}"];
export const moodLabels = ["Very low", "Low", "Balanced", "Good", "Excellent"];
export const calendarLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const moodSummaries = [
  "Today felt heavy, so smaller goals and extra support matter most.",
  "There were some difficult moments, but you still checked in and stayed aware.",
  "Your mood stayed balanced and steady through most of the day.",
  "You handled the day well and had a few uplifting moments.",
  "You felt very positive today and your energy was noticeably better.",
];

export const moodHighlights = [
  "Try a short grounding exercise and keep the schedule light.",
  "Take a breathing break and check in again later this evening.",
  "A consistent routine is helping you stay emotionally steady.",
  "Your healthy rhythm is showing up in sleep and motivation.",
  "This is a strong day to repeat the habits that helped you feel good.",
];

const moodCheckInTimes = ["08:15 AM", "09:40 AM", "11:10 AM", "01:20 PM", "03:05 PM", "05:30 PM", "08:10 PM"];
const moodPattern = [4, 5, 3, 4, 2, 3, 4, 5, 4, 3, 2, 4, 5, 4, 3, 2, 3, 4, 5, 4, 3, 4, 2, 3, 4, 5, 4, 3, 4, 5, 4];

export type MoodEntry = {
  checkInTime: string;
  day: number;
  emoji: string;
  highlight: string;
  label: string;
  mood: number;
  recorded: boolean;
  summary: string;
};

export function moodColor(mood: number) {
  return ["#ef4444", "#f59e0b", "#6b7280", "#10b981", "#3b82f6"][mood - 1] || "#6b7280";
}

export function moodCalendarMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function moodCalendarStorageKey(patientKey: string, monthKey = moodCalendarMonthKey()) {
  return `patient_mood_calendar_${patientKey}_${monthKey}`;
}

export function createMonthEntries(daysInMonth: number, todayDay: number): MoodEntry[] {
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

export function hydrateMonthEntries(savedEntries: unknown, daysInMonth: number, todayDay: number): MoodEntry[] {
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

export function readMoodCalendarEntries(patientKey: string, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const todayDay = date.getDate();
  const monthDays = new Date(year, month + 1, 0).getDate();
  const storageKey = moodCalendarStorageKey(patientKey, moodCalendarMonthKey(date));

  return {
    entries: hydrateMonthEntries(storage.get(storageKey, null), monthDays, todayDay),
    monthDays,
    storageKey,
    todayDay,
  };
}

export function saveMoodCalendarEntries(patientKey: string, entries: MoodEntry[], date = new Date()) {
  storage.set(moodCalendarStorageKey(patientKey, moodCalendarMonthKey(date)), entries);
}

export function recordMoodForToday(patientKey: string, mood: number, date = new Date()) {
  const { entries, todayDay } = readMoodCalendarEntries(patientKey, date);
  const nextEntries = entries.map((entry) => {
    if (entry.day !== todayDay) return entry;

    return moodEntryForDay(entry, mood, formatCheckInTime(date));
  });

  saveMoodCalendarEntries(patientKey, nextEntries, date);

  return {
    currentStreak: calculateCurrentStreak(nextEntries, todayDay),
    entries: nextEntries,
    todayEntry: nextEntries.find((entry) => entry.day === todayDay) || null,
  };
}

export function getTodayMoodSnapshot(patientKey: string, date = new Date()) {
  const { entries, todayDay } = readMoodCalendarEntries(patientKey, date);
  const todayEntry = entries.find((entry) => entry.day === todayDay) || null;

  return {
    currentStreak: calculateCurrentStreak(entries, todayDay),
    entries,
    todayEntry,
  };
}

export function getSevenDayStrip(entries: MoodEntry[], selectedDay: number, daysInMonth: number) {
  const start = Math.min(Math.max(1, selectedDay - 3), Math.max(1, daysInMonth - 6));
  return entries.slice(start - 1, start + 6);
}

export function createCalendarCells(entries: MoodEntry[], firstDayOfMonth: number) {
  const leadingPlaceholders = Array.from({ length: firstDayOfMonth }, () => null);
  const cells = [...leadingPlaceholders, ...entries];
  const trailingCount = (7 - (cells.length % 7)) % 7;
  return [...cells, ...Array.from({ length: trailingCount }, () => null)];
}

export function calculateCurrentStreak(entries: MoodEntry[], todayDay: number) {
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

export function formatCheckInTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function moodEntryForDay(entry: MoodEntry, mood: number, checkInTime: string): MoodEntry {
  return {
    ...entry,
    checkInTime,
    emoji: moodEmojis[mood - 1],
    highlight: moodHighlights[mood - 1],
    label: moodLabels[mood - 1],
    mood,
    recorded: true,
    summary: moodSummaries[mood - 1],
  };
}
