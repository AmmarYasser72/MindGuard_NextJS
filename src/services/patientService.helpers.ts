import { shortId } from "./apiResponse";
import type { ApiRecord } from "../types/api";
import type { DoctorPatient } from "../types/doctor";

export const patientFields = [
  "_id",
  "id",
  "user",
  "diagnosis",
  "medicalHistory",
  "currentMedications",
  "treatingDoctor",
  "user._id",
];

function safeDate(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function ageFromBirthDate(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!birthdayPassed) age -= 1;
  return age >= 0 ? age : null;
}

function splitName(name: unknown, fallbackId: unknown) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName) return [`Patient`, shortId(fallbackId)];
  const parts = cleanName.split(/\s+/);
  return [
    parts[0] || "Patient",
    parts.slice(1).join(" ") || shortId(fallbackId),
  ];
}

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function moodValueToScore(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 5) return Math.round(value * 20);
    if (value <= 100) return Math.round(value);
  }

  if (typeof value !== "string") return null;
  const clean = value.trim().toLowerCase();
  if (!clean) return null;

  const numeric = Number(clean);
  if (Number.isFinite(numeric)) return moodValueToScore(numeric);

  return (
    {
      very_low: 20,
      low: 40,
      neutral: 60,
      good: 80,
      excellent: 100,
    }[clean] ?? null
  );
}

function metricReading(record: ApiRecord, key: string) {
  const metrics = asRecord(record.metrics);
  return asRecord(metrics[key]);
}

function metricDate(record: ApiRecord) {
  const metrics = asRecord(record.metrics);
  return (
    metrics.latestReadingAt ||
    record.updatedAt ||
    record.createdAt ||
    record.lastSeen
  );
}

function normalizeSleepValue(value: unknown) {
  const parsed = numberValue(value);
  if (parsed === null) return null;
  if (parsed > 1 && parsed <= 100) return parsed / 100;
  if (parsed >= 0 && parsed <= 1) return parsed;
  return null;
}

function inferCondition(diagnosis: unknown) {
  const text = String(diagnosis || "").toLowerCase();
  if (text.includes("anxiety")) return "anxiety";
  if (text.includes("depress")) return "depression";
  if (text.includes("stress")) return "stress";
  return text ? "mixed" : "none";
}

function inferSeverity({
  hrvDeviation,
  mood,
}: {
  hrvDeviation: number | null;
  mood: number | null;
}) {
  if (mood !== null && mood <= 35) return "critical";
  if (hrvDeviation !== null && hrvDeviation <= -20) return "critical";
  if (mood !== null && mood <= 55) return "moderate";
  if (hrvDeviation !== null && hrvDeviation <= -10) return "moderate";
  if (mood !== null && mood <= 70) return "mild";
  return "normal";
}

function buildWarnings({
  hrvDeviation,
  mood,
}: {
  hrvDeviation: number | null;
  mood: number | null;
}) {
  const warnings: string[] = [];
  if (mood !== null && mood <= 35) {
    warnings.push("Latest mood reading is in a high-risk range.");
  }
  if (hrvDeviation !== null && hrvDeviation <= -20) {
    warnings.push("HRV is significantly below the recent patient baseline.");
  }
  return warnings;
}

export function normalizePatientRecord(
  record: ApiRecord,
  index = 0,
): DoctorPatient {
  const id = record?._id || record?.id || `patient-${index + 1}`;
  const user = asRecord(record?.user);
  const sourceName = record?.name || record?.fullName || user.name;
  const [firstName, lastName] = splitName(sourceName, id);
  const displayName = `${firstName} ${lastName}`.trim() || `Patient ${index + 1}`;
  const gender = record?.gender || user.gender || "";
  const diagnosis = record?.diagnosis || "";
  const latestMood = metricReading(record, "latestMood");
  const latestHrv = metricReading(record, "latestHrv");
  const latestHeartRate = metricReading(record, "latestHeartRate");
  const moodHistory = asArray(asRecord(record.metrics).moodHistory).map(
    (entry) => moodValueToScore(asRecord(entry).value),
  );
  const mood = moodValueToScore(
    latestMood.value ?? record.mood ?? record.latestMood ?? null,
  );
  const hrv = numberValue(latestHrv.value ?? record.hrv ?? record.latestHrv);
  const heartRate = numberValue(latestHeartRate.value ?? record.heartRate);
  const trend = moodHistory.filter((value): value is number => value !== null);
  const hrvDeviation = numberValue(record.hrvDeviation ?? latestHrv.deviation);
  const severity = inferSeverity({ hrvDeviation, mood });

  return {
    id: String(id),
    raw: record,
    firstName,
    lastName,
    displayName,
    email: String(record?.email || user.email || "No email available"),
    age: ageFromBirthDate(record?.dateOfBirth || user.dateOfBirth),
    gender: gender ? String(gender).charAt(0).toUpperCase() : "",
    lastSeen: safeDate(metricDate(record)),
    severity,
    condition: inferCondition(diagnosis),
    mood,
    hrv,
    hrvDeviation,
    sleep: normalizeSleepValue(record.sleep),
    journal: String(
      record?.medicalHistory || record?.currentMedications || diagnosis || "",
    ),
    trend,
    warnings: buildWarnings({ hrvDeviation, mood }).concat(
      heartRate !== null && heartRate >= 110
        ? ["Heart rate is elevated in the latest reading."]
        : [],
    ),
  };
}

function patientRecordKey(record: ApiRecord) {
  const user = asRecord(record.user);
  return String(user.email || record.email || user._id || record._id || record.id)
    .trim()
    .toLowerCase();
}

export function mergePatientRecords(
  primary: ApiRecord[],
  fallback: ApiRecord[],
) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((record) => {
    const key = patientRecordKey(record);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
