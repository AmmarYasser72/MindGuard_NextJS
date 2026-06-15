import {
  ensureArrayRecords,
  ensureRecordHasAnyField,
  isBackendServerError,
  shortId,
} from "./apiResponse";
import { shouldUseDemoData } from "../config/demoMode";
import { getSession } from "./session";
import { storage } from "./storage";
import {
  patients as demoPatients,
} from "../data/doctorData";
import type { ApiRecord } from "../types/api";
import type { DoctorSession } from "../types/doctor";
import type { DoctorProfileSource } from "../types/recommendations";

const DEFAULT_DEMO_DOCTOR_ID = "demo-doctor-001";
const AUTH_USERS_KEY = "auth_users";
const demoPatientNames = new Map([
  ["demo-patient-001", "Demo Patient"],
  ["patient-001", "Demo Patient"],
  ["patient@demo.com", "Demo Patient"],
]);

export const slotFields = [
  "_id",
  "id",
  "doctor",
  "doctorId",
  "patient",
  "patientEmail",
  "patientName",
  "doctorNote",
  "notes",
  "startTime",
  "endTime",
  "from",
  "to",
  "scheduledAt",
  "status",
];

export type SlotPatientDetails = {
  patientEmail?: string | null;
  patientId: string;
  patientName: string;
};

export type SlotDoctorDetails = {
  careModes?: string[];
  displayName?: string;
  email?: string | null;
  id: string;
  sessionTime?: string | null;
  source?: DoctorProfileSource | string;
};

export function queryString(params: Record<string, unknown> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function safeDate(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanDoctorName(value: unknown) {
  return cleanString(value)
    .toLowerCase()
    .replace(/^dr\.?\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function currentUserId() {
  const user = getSession()?.user;
  return (
    cleanString(user?.uid) || cleanString(user?._id) || cleanString(user?.id)
  );
}

function currentDoctorId() {
  return currentUserId() || DEFAULT_DEMO_DOCTOR_ID;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;
}

export function recordId(value: unknown) {
  const record = asRecord(value);
  if (!record) return cleanString(value);
  return (
    cleanString(record._id) || cleanString(record.id) || cleanString(record.uid)
  );
}

export function doctorIdFromRecord(record: ApiRecord) {
  return (
    recordId(record.doctor) ||
    cleanString(record.doctorId) ||
    cleanString(record.doctor_id) ||
    (shouldUseDemoData() ? DEFAULT_DEMO_DOCTOR_ID : "")
  );
}

export function startTimeValue(record: ApiRecord) {
  return (
    record?.startTime ||
    record?.from ||
    record?.scheduledAt ||
    record?.createdAt
  );
}

export function endTimeValue(record: ApiRecord) {
  return record?.endTime || record?.to;
}

export function statusValue(record: ApiRecord) {
  return cleanString(record.status || "available").toLowerCase();
}

function slotRange(record: ApiRecord) {
  const start = safeDate(startTimeValue(record));
  const explicitEnd = endTimeValue(record);
  const end = explicitEnd
    ? safeDate(explicitEnd)
    : new Date(start.getTime() + 60 * 60000);

  return { end, start };
}

function rangesOverlap(left: ApiRecord, right: ApiRecord) {
  const leftRange = slotRange(left);
  const rightRange = slotRange(right);
  return (
    leftRange.start.getTime() < rightRange.end.getTime() &&
    rightRange.start.getTime() < leftRange.end.getTime()
  );
}

export function isInactiveStatus(status: string) {
  return status === "cancelled" || status === "completed";
}

function isPlaceholderPatientName(value: unknown) {
  const name = cleanString(value).toLowerCase();
  return !name || name === "unassigned";
}

function isGeneratedPatientName(value: unknown) {
  const name = cleanString(value);
  return /^patient\s+[a-z0-9]{4,}$/i.test(name);
}

export function shortPatientLabel(value: unknown) {
  return isPlaceholderPatientName(value) ? "" : cleanString(value);
}

export function assertFutureSlot(record: ApiRecord) {
  const start = safeDate(startTimeValue(record));
  if (start.getTime() <= Date.now()) {
    throw new Error("This time slot has already passed. Choose a future slot.");
  }
}

export function assertValidSlotRange(record: ApiRecord) {
  const { end, start } = slotRange(record);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Choose a valid date and time before scheduling.");
  }
  if (end.getTime() <= start.getTime()) {
    throw new Error("Session end time must be after the start time.");
  }
}

export function assertSlotCanBeCreated(slot: ApiRecord) {
  assertValidSlotRange(slot);
  assertFutureSlot(slot);
}

export function assertNoDemoConflict(
  slots: ApiRecord[],
  candidate: ApiRecord,
  candidateId = "",
) {
  const doctorId = doctorIdFromRecord(candidate) || DEFAULT_DEMO_DOCTOR_ID;
  const conflict = slots.find((slot) => {
    const slotId = String(slot.id || slot._id || "");
    if (candidateId && slotId === candidateId) return false;
    if (doctorIdFromRecord(slot) !== doctorId) return false;
    if (isInactiveStatus(statusValue(slot))) return false;
    return rangesOverlap(slot, candidate);
  });

  if (conflict) {
    throw new Error(
      "That time overlaps another session for this doctor. Choose a different slot.",
    );
  }
}

export function slotWithDefaults(slot: ApiRecord) {
  return {
    ...slot,
    doctor:
      recordId(slot.doctor) || cleanString(slot.doctorId) || currentDoctorId(),
    status: cleanString(slot.status) || "available",
  };
}

function patientLabel(patient: unknown, fallbackName = "") {
  const cleanFallback = cleanString(fallbackName);
  const patientRecord = asRecord(patient);
  const patientId =
    recordId(patient) || cleanString(patientRecord?.patientId) || "";
  const patientEmail = cleanString(patientRecord?.email).toLowerCase();

  if (cleanFallback && !isGeneratedPatientName(cleanFallback)) {
    return cleanFallback;
  }

  const knownName = lookupStoredPatientName(patientId, patientEmail);
  if (knownName) return knownName;

  if (!patient) return "Unassigned";
  if (typeof patient === "string") {
    const matchedPatient = demoPatients.find((item) => item.id === patient);
    if (matchedPatient) {
      return `${matchedPatient.firstName} ${matchedPatient.lastName}`.trim();
    }
    return `Patient ${shortId(patient)}`;
  }
  if (typeof patient !== "object" || Array.isArray(patient))
    return "Unassigned";
  const record = patient as ApiRecord;
  const id = record._id || record.id;
  return String(
    record.name ||
      record.displayName ||
      record.patientName ||
      (id ? `Patient ${shortId(id)}` : "Unassigned"),
  );
}

function lookupStoredPatientName(patientId: string, patientEmail: string) {
  const cleanId = patientId.trim().toLowerCase();
  const cleanEmail = patientEmail.trim().toLowerCase();

  const demoName = demoPatientNames.get(cleanEmail) || demoPatientNames.get(cleanId);
  if (demoName) return demoName;

  const storedUsers = storage.get<ApiRecord[]>(AUTH_USERS_KEY, []);
  const match = storedUsers.find((user) => {
    const role = cleanString(user.role).toLowerCase();
    const userEmail = cleanString(user.email).toLowerCase();
    const ids = [
      cleanString(user.uid).toLowerCase(),
      cleanString(user._id).toLowerCase(),
      cleanString(user.id).toLowerCase(),
    ].filter(Boolean);

    if (role && role !== "patient") return false;
    if (cleanEmail && userEmail === cleanEmail) return true;
    return Boolean(cleanId && ids.includes(cleanId));
  });

  return cleanString(match?.displayName) || cleanString(match?.name);
}

function patientIdentityKeys(patient: Partial<SlotPatientDetails>) {
  const keys = [
    cleanString(patient.patientId),
    cleanString(patient.patientEmail).toLowerCase(),
  ].filter((key) => key && key !== "patient");

  if (keys.includes("demo-patient-001") || keys.includes("patient@demo.com")) {
    keys.push("patient-001");
  }

  return new Set(keys);
}

function slotPatientKeys(record: ApiRecord) {
  const patient = asRecord(record.patient);
  return [
    recordId(record.patient),
    cleanString(record.patientId),
    cleanString(record.patientEmail).toLowerCase(),
    patient ? cleanString(patient.email).toLowerCase() : "",
  ].filter(Boolean);
}

export function isPatientSlot(
  record: ApiRecord,
  patient: Partial<SlotPatientDetails>,
) {
  const keys = patientIdentityKeys(patient);
  return slotPatientKeys(record).some((key) => keys.has(key));
}

export function normalizeSlotList(records: ApiRecord[]) {
  return records
    .map(normalizeSlotRecord)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export function extractSlotRecords(response: unknown, label: string) {
  try {
    return ensureArrayRecords(response, label, slotFields);
  } catch (error) {
    const root = asRecord(response);
    const data = asRecord(root?.data);
    const slots = root?.slots || data?.slots || data?.items || data?.results;
    if (Array.isArray(slots)) {
      slots.forEach((slot, index) =>
        ensureRecordHasAnyField(
          slot as ApiRecord,
          `${label} item ${index + 1}`,
          slotFields,
        ),
      );
      return slots as ApiRecord[];
    }
    throw error;
  }
}

export function isConnectionFallbackError(error: unknown) {
  const status = (error as { status?: number } | null)?.status;
  const message = error instanceof Error ? error.message : "";
  return (
    isBackendServerError(error) ||
    (status === 404 && /cannot\s+(get|post|patch|delete)|not found/i.test(message)) ||
    (error instanceof Error &&
      (error.name === "TypeError" ||
        error.message === "Failed to fetch" ||
        /endpoint returned no data|placeholder text|expected a record response/i.test(
          error.message,
        )))
  );
}

export function mergeSlotRecords(primary: ApiRecord[], fallback: ApiRecord[]) {
  const seen = new Set<string>();
  const merged: ApiRecord[] = [];

  [...primary, ...fallback].forEach((slot) => {
    const id = String(slot.id || slot._id || "");
    const timeKey = `${doctorIdFromRecord(slot)}-${String(startTimeValue(slot))}`;
    const keys = [id, timeKey].filter(Boolean);
    if (keys.some((key) => seen.has(key))) return;
    keys.forEach((key) => seen.add(key));
    merged.push(slot);
  });

  return merged;
}

export function normalizeSlotRecord(
  record: ApiRecord,
  index = 0,
): DoctorSession {
  const id = record?._id || record?.id || `slot-${index + 1}`;
  const scheduledAt = safeDate(startTimeValue(record));
  const status = String(record?.status || "available");
  const reason = cleanString(record?.reason);
  const endAt = endTimeValue(record) ? safeDate(endTimeValue(record)) : null;
  const duration = endAt
    ? Math.max(1, Math.round((endAt.getTime() - scheduledAt.getTime()) / 60000))
    : null;
  const patientRecord =
    record.patient &&
    typeof record.patient === "object" &&
    !Array.isArray(record.patient)
      ? (record.patient as ApiRecord)
      : null;

  return {
    id: String(id),
    doctorId: doctorIdFromRecord(record) || null,
    raw: record,
    patientId: patientRecord
      ? String(patientRecord._id || patientRecord.id || "") || null
      : record?.patientId
        ? String(record.patientId)
        : record?.patient
          ? String(record.patient)
          : null,
    patientName: patientLabel(record?.patient, cleanString(record.patientName)),
    scheduledAt,
    duration,
    notes:
      cleanString(record.doctorNote) ||
      cleanString(record.notes) ||
      cleanString(record.sessionNote),
    status,
    type: cleanString(record?.type) || "video",
    reason:
      status.toLowerCase() !== "available" && reason === "available"
        ? status
        : reason || status,
    severity: null,
    condition: null,
  };
}
