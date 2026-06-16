import { storage } from "./storage";

export const MOOD_CALENDAR_UPDATED_EVENT = "mindguard:mood-calendar-updated";

export const moodEmojis = [
  "\u{1F620}",
  "\u{1F622}",
  "\u{1F610}",
  "\u{1F60A}",
  "\u{1F60D}",
];
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

const moodCheckInTimes = [
  "08:15 AM",
  "09:40 AM",
  "11:10 AM",
  "01:20 PM",
  "03:05 PM",
  "05:30 PM",
  "08:10 PM",
];
const moodPattern = [
  4, 5, 3, 4, 2, 3, 4, 5, 4, 3, 2, 4, 5, 4, 3, 2, 3, 4, 5, 4, 3, 4, 2, 3, 4, 5,
  4, 3, 4, 5, 4,
];

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

export type MoodCalendarUpdateDetail = {
  day: number;
  mood: number;
  monthKey: string;
  patientKey: string;
};

export function moodColor(mood: number) {
  return (
    ["#ef4444", "#f59e0b", "#6b7280", "#10b981", "#3b82f6"][mood - 1] ||
    "#6b7280"
  );
}

export function moodCalendarMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function moodCalendarStorageKey(
  patientKey: string,
  monthKey = moodCalendarMonthKey(),
) {
  return `patient_mood_calendar_${patientKey}_${monthKey}`;
}

export function moodDraftStorageKey(patientKey: string) {
  return `patient_mood_draft_${patientKey}`;
}

export function moodRecordedEntriesStorageKey(
  patientKey: string,
  monthKey = moodCalendarMonthKey(),
) {
  return `patient_mood_records_${patientKey}_${monthKey}`;
}

function normalizePatientKeys(patientKey: string | string[]) {
  const keys = Array.isArray(patientKey) ? patientKey : [patientKey];
  const cleanedKeys = keys
    .map((key) => String(key || "").trim())
    .filter(Boolean);

  return Array.from(
    new Set(cleanedKeys.length ? cleanedKeys : ["guest-patient"]),
  );
}

function primaryPatientKey(patientKey: string | string[]) {
  return normalizePatientKeys(patientKey)[0];
}

function localDayKey(date = new Date(), day = date.getDate()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function moodDraftDayKey(date = new Date()) {
  return localDayKey(date);
}

function readStoredMoodDraft(patientKey: string | string[], date = new Date()) {
  const patientKeys = normalizePatientKeys(patientKey);
  const primaryKey = patientKeys[0];
  const expectedDay = moodDraftDayKey(date);

  for (const key of patientKeys) {
    const savedDraft = storage.get<{
      dayKey?: string;
      selectedMood?: unknown;
    } | null>(moodDraftStorageKey(key), null);
    if (!savedDraft || savedDraft.dayKey !== expectedDay) continue;

    const selectedMood = Number(savedDraft.selectedMood);
    if (!Number.isInteger(selectedMood) || selectedMood < 0 || selectedMood > 4) {
      continue;
    }

    if (key !== primaryKey) {
      storage.set(moodDraftStorageKey(primaryKey), {
        dayKey: expectedDay,
        selectedMood,
      });
    }

    return selectedMood;
  }

  return null;
}

type StoredMoodRecord = {
  checkInTime?: string;
  day?: unknown;
  mood?: unknown;
};

function normalizeStoredMoodRecord(record: unknown) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }

  const item = record as StoredMoodRecord;
  const day = Number(item.day);
  const mood = Number(item.mood);
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) return null;

  return {
    checkInTime:
      typeof item.checkInTime === "string" && item.checkInTime.trim()
        ? item.checkInTime
        : "",
    day,
    mood,
  };
}

function readStoredMoodRecords(patientKey: string | string[], date = new Date()) {
  const patientKeys = normalizePatientKeys(patientKey);
  const primaryKey = patientKeys[0];
  const monthKey = moodCalendarMonthKey(date);
  const records = new Map<number, NonNullable<ReturnType<typeof normalizeStoredMoodRecord>>>();

  for (const key of patientKeys) {
    const savedRecords = storage.get<Record<string, StoredMoodRecord> | null>(
      moodRecordedEntriesStorageKey(key, monthKey),
      null,
    );
    if (!savedRecords || typeof savedRecords !== "object") continue;

    Object.values(savedRecords).forEach((record) => {
      const normalizedRecord = normalizeStoredMoodRecord(record);
      if (!normalizedRecord || records.has(normalizedRecord.day)) return;
      records.set(normalizedRecord.day, normalizedRecord);
    });
  }

  if (records.size && patientKeys.some((key) => key !== primaryKey)) {
    const primaryRecords = Object.fromEntries(
      Array.from(records.entries()).map(([day, record]) => [String(day), record]),
    );
    storage.set(moodRecordedEntriesStorageKey(primaryKey, monthKey), primaryRecords);
  }

  return records;
}

function applyRecordedMoodRecords(
  entries: MoodEntry[],
  records: Map<number, NonNullable<ReturnType<typeof normalizeStoredMoodRecord>>>,
  todayDay: number,
) {
  if (!records.size) return entries;

  return entries.map((entry) => {
    const record = records.get(entry.day);
    if (!record || entry.day > todayDay) return entry;

    return moodEntryForDay(
      entry,
      record.mood,
      record.checkInTime || entry.checkInTime,
    );
  });
}

function saveRecordedMoodEntry(
  patientKey: string | string[],
  entry: MoodEntry,
  date = new Date(),
) {
  const key = primaryPatientKey(patientKey);
  const monthKey = moodCalendarMonthKey(date);
  const storageKey = moodRecordedEntriesStorageKey(key, monthKey);
  const savedRecords = storage.get<Record<string, StoredMoodRecord>>(
    storageKey,
    {},
  );

  storage.set(storageKey, {
    ...savedRecords,
    [entry.day]: {
      checkInTime: entry.checkInTime,
      day: entry.day,
      mood: entry.mood,
    },
  });
}

export function createMonthEntries(
  daysInMonth: number,
  todayDay: number,
): MoodEntry[] {
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

export function hydrateMonthEntries(
  savedEntries: unknown,
  daysInMonth: number,
  todayDay: number,
): MoodEntry[] {
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
    const safeMood =
      Number.isInteger(mood) && mood >= 1 && mood <= 5 ? mood : entry.mood;
    const isFutureDay = entry.day > todayDay;

    return {
      ...entry,
      mood: safeMood,
      recorded: isFutureDay ? false : Boolean(savedEntry.recorded),
      emoji: moodEmojis[safeMood - 1],
      label: moodLabels[safeMood - 1],
      summary: moodSummaries[safeMood - 1],
      highlight: moodHighlights[safeMood - 1],
      checkInTime:
        typeof savedEntry.checkInTime === "string" && savedEntry.checkInTime
          ? savedEntry.checkInTime
          : entry.checkInTime,
    };
  });
}

export function readMoodCalendarEntries(
  patientKey: string | string[],
  date = new Date(),
) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthDays = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();
  const isFutureMonth =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth());
  const todayDay = isCurrentMonth ? now.getDate() : isFutureMonth ? 0 : monthDays;
  const patientKeys = normalizePatientKeys(patientKey);
  const primaryKey = patientKeys[0];
  const monthKey = moodCalendarMonthKey(date);
  const storageKey = moodCalendarStorageKey(primaryKey, monthKey);
  let savedEntries = storage.get(storageKey, null);

  if (savedEntries === null) {
    for (const key of patientKeys.slice(1)) {
      savedEntries = storage.get(moodCalendarStorageKey(key, monthKey), null);
      if (savedEntries !== null) {
        storage.set(storageKey, savedEntries);
        break;
      }
    }
  }

  const entries = applyRecordedMoodRecords(
    hydrateMonthEntries(savedEntries, monthDays, todayDay),
    readStoredMoodRecords(patientKeys, date),
    todayDay,
  );

  return {
    entries,
    monthDays,
    patientKey: primaryKey,
    storageKey,
    todayDay,
  };
}

export function saveMoodCalendarEntries(
  patientKey: string | string[],
  entries: MoodEntry[],
  date = new Date(),
) {
  storage.set(
    moodCalendarStorageKey(
      primaryPatientKey(patientKey),
      moodCalendarMonthKey(date),
    ),
    entries,
  );
}

function emitMoodCalendarUpdated(
  patientKey: string,
  mood: number,
  day: number,
  date: Date,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<MoodCalendarUpdateDetail>(MOOD_CALENDAR_UPDATED_EVENT, {
      detail: {
        day,
        mood,
        monthKey: moodCalendarMonthKey(date),
        patientKey,
      },
    }),
  );
}

export function recordMoodForToday(
  patientKey: string | string[],
  mood: number,
  date = new Date(),
) {
  return recordMoodForCalendarDay(patientKey, mood, date.getDate(), date);
}

export function recordMoodForCalendarDay(
  patientKey: string | string[],
  mood: number,
  day: number,
  date = new Date(),
) {
  const { entries, patientKey: resolvedPatientKey, todayDay } =
    readMoodCalendarEntries(patientKey, date);
  const nextEntries = entries.map((entry) => {
    if (entry.day !== day) return entry;

    return moodEntryForDay(entry, mood, formatCheckInTime(date));
  });

  const recordedEntry = nextEntries.find((entry) => entry.day === day) || null;

  saveMoodCalendarEntries(resolvedPatientKey, nextEntries, date);
  if (recordedEntry) {
    saveRecordedMoodEntry(resolvedPatientKey, recordedEntry, date);
  }
  clearSelectedMoodDraft(patientKey);
  emitMoodCalendarUpdated(resolvedPatientKey, mood, day, date);

  return {
    currentStreak: calculateCurrentStreak(nextEntries, todayDay),
    entries: nextEntries,
    recordedEntry,
    todayEntry: nextEntries.find((entry) => entry.day === todayDay) || null,
  };
}

export function getTodayMoodSnapshot(
  patientKey: string | string[],
  date = new Date(),
) {
  const { entries, todayDay } = readMoodCalendarEntries(patientKey, date);
  const todayEntry = entries.find((entry) => entry.day === todayDay) || null;

  return {
    currentStreak: calculateCurrentStreak(entries, todayDay),
    entries,
    todayEntry,
  };
}

export function readSelectedMoodDraft(
  patientKey: string | string[],
  date = new Date(),
) {
  return readStoredMoodDraft(patientKey, date);
}

export function saveSelectedMoodDraft(
  patientKey: string | string[],
  selectedMood: number,
  date = new Date(),
) {
  if (!Number.isInteger(selectedMood) || selectedMood < 0 || selectedMood > 4) {
    return;
  }

  storage.set(moodDraftStorageKey(primaryPatientKey(patientKey)), {
    dayKey: moodDraftDayKey(date),
    selectedMood,
  });
}

export function clearSelectedMoodDraft(patientKey: string | string[]) {
  normalizePatientKeys(patientKey).forEach((key) => {
    storage.remove(moodDraftStorageKey(key));
  });
}

export function getSevenDayStrip(
  entries: MoodEntry[],
  selectedDay: number,
  daysInMonth: number,
) {
  const start = Math.min(
    Math.max(1, selectedDay - 3),
    Math.max(1, daysInMonth - 6),
  );
  return entries.slice(start - 1, start + 6);
}

export function createCalendarCells(
  entries: MoodEntry[],
  firstDayOfMonth: number,
) {
  const leadingPlaceholders = Array.from(
    { length: firstDayOfMonth },
    () => null,
  );
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

function moodEntryForDay(
  entry: MoodEntry,
  mood: number,
  checkInTime: string,
): MoodEntry {
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
