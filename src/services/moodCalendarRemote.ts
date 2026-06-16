import { readingService } from "./readingService";
import {
  formatCheckInTime,
  moodCalendarMonthKey,
  moodEmojis,
  moodHighlights,
  moodLabels,
  moodSummaries,
  readMoodCalendarEntries,
  saveMoodCalendarEntries,
  type MoodEntry,
} from "./moodCalendarService";
import type { ApiRecord } from "../types/api";

const moodValueMap: Record<string, number> = {
  very_low: 1,
  low: 2,
  neutral: 3,
  good: 4,
  excellent: 5,
};

export async function loadMoodCalendarEntries(
  patientKey: string | string[],
  date = new Date(),
) {
  const localCalendar = readMoodCalendarEntries(patientKey, date);

  try {
    const readings = await readingService.getPatientMoodHistory(
      monthRangeParams(date),
    );
    const entries = applyMoodReadings(localCalendar.entries, readings);
    saveMoodCalendarEntries(localCalendar.patientKey, entries, date);
    return { ...localCalendar, entries };
  } catch {
    return localCalendar;
  }
}

function monthRangeParams(date: Date) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return {
    from: from.toISOString(),
    monthKey: moodCalendarMonthKey(date),
    to: to.toISOString(),
  };
}

function applyMoodReadings(entries: MoodEntry[], readings: ApiRecord[]) {
  const latestByDay = new Map<number, ApiRecord>();

  readings.forEach((reading) => {
    const date = new Date(String(reading.createdAt || reading.updatedAt || ""));
    const mood = normalizeMoodValue(reading.value || reading.mood);
    if (Number.isNaN(date.getTime()) || !mood) return;
    latestByDay.set(date.getDate(), reading);
  });

  return entries.map((entry) => {
    const reading = latestByDay.get(entry.day);
    if (!reading) return entry;

    const date = new Date(String(reading.createdAt || reading.updatedAt || ""));
    const mood = normalizeMoodValue(reading.value || reading.mood) || entry.mood;
    return {
      ...entry,
      checkInTime: formatCheckInTime(date),
      emoji: moodEmojis[mood - 1],
      highlight: moodHighlights[mood - 1],
      label: moodLabels[mood - 1],
      mood,
      recorded: true,
      summary: moodSummaries[mood - 1],
    };
  });
}

function normalizeMoodValue(value: unknown) {
  const numericMood = Number(value);
  if (Number.isInteger(numericMood) && numericMood >= 1 && numericMood <= 5) {
    return numericMood;
  }

  const mappedMood = moodValueMap[String(value || "").toLowerCase()];
  return mappedMood || null;
}
