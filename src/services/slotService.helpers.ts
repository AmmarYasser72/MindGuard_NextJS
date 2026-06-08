import {
  ensureArrayRecords,
  ensureRecordHasAnyField,
  isBackendServerError,
  shortId,
} from "./apiResponse";
import { shouldUseDemoData } from "../config/demoMode";
import { getSession } from "./session";
import {
  patients as demoPatients,
  sessions as demoSessions,
} from "../data/doctorData";
import { curatedDoctorProfiles } from "../data/doctorRecommendations";
import { getSignedUpDoctors } from "./localDoctorDirectory";
import { storage } from "./storage";
import type { ApiRecord } from "../types/api";
import type { DoctorSession } from "../types/doctor";
import type { DoctorProfileSource } from "../types/recommendations";

const DEFAULT_DEMO_DOCTOR_ID = "demo-doctor-001";
const fallbackAvailabilityTimes = ["09:00", "11:30", "15:30"];
const DEMO_SLOTS_KEY = "demo_slots";

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

function safeDate(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanDoctorName(value: unknown) {
  return cleanString(value)
    .toLowerCase()
    .replace(/^dr\.?\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;
}

function recordId(value: unknown) {
  const record = asRecord(value);
  if (!record) return cleanString(value);
  return (
    cleanString(record._id) || cleanString(record.id) || cleanString(record.uid)
  );
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

function currentDoctorIdentityKeys() {
  const user = getSession()?.user;
  const keys = new Set(
    [
      currentDoctorId(),
      cleanString(user?.email).toLowerCase(),
      cleanString(user?.displayName).toLowerCase(),
      cleanDoctorName(user?.displayName),
    ].filter(Boolean),
  );

  [...curatedDoctorProfiles, ...getSignedUpDoctors()].forEach((doctor) => {
    const doctorEmail = cleanString(doctor.email).toLowerCase();
    const doctorName = cleanString(doctor.displayName).toLowerCase();
    const doctorShortName = cleanDoctorName(doctor.displayName);
    if (
      keys.has(doctorEmail) ||
      keys.has(doctorName) ||
      [...keys].some(
        (key) =>
          key.length > 3 &&
          doctorShortName &&
          (doctorShortName.includes(key) || key.includes(doctorShortName)),
      )
    ) {
      keys.add(doctor.id);
      keys.add(doctorEmail);
      keys.add(doctorName);
      keys.add(doctorShortName);
    }
  });

  return keys;
}

function doctorIdFromRecord(record: ApiRecord) {
  return (
    recordId(record.doctor) ||
    cleanString(record.doctorId) ||
    cleanString(record.doctor_id) ||
    (shouldUseDemoData() ? DEFAULT_DEMO_DOCTOR_ID : "")
  );
}

function startTimeValue(record: ApiRecord) {
  return (
    record?.startTime ||
    record?.from ||
    record?.scheduledAt ||
    record?.createdAt
  );
}

function endTimeValue(record: ApiRecord) {
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

function hasPatient(record: ApiRecord) {
  return Boolean(
    record.patient ||
    cleanString(record.patientId) ||
    !isPlaceholderPatientName(record.patientName) ||
    cleanString(record.patientEmail),
  );
}

function isSlotAvailable(record: ApiRecord) {
  return statusValue(record) === "available" && !hasPatient(record);
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
  const doctorId = doctorIdFromRecord(candidate) || currentDoctorId();
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
  if (cleanFallback) return cleanFallback;
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

function patientIdentityKeys(patient: Partial<SlotPatientDetails>) {
  const keys = [
    cleanString(patient.patientId),
    cleanString(patient.patientEmail).toLowerCase(),
    cleanString(patient.patientName).toLowerCase(),
  ].filter(Boolean);

  if (keys.includes("demo-patient-001") || keys.includes("patient@demo.com")) {
    keys.push("patient-001", "john smith");
  }

  return new Set(keys);
}

function slotPatientKeys(record: ApiRecord) {
  const patient = asRecord(record.patient);
  return [
    recordId(record.patient),
    cleanString(record.patientId),
    cleanString(record.patientEmail).toLowerCase(),
    cleanString(record.patientName).toLowerCase(),
    patient ? cleanString(patient.email).toLowerCase() : "",
    patient ? cleanString(patient.name).toLowerCase() : "",
    patient ? cleanString(patient.displayName).toLowerCase() : "",
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
  return (
    isBackendServerError(error) ||
    (error instanceof Error &&
      (error.name === "TypeError" ||
        error.message === "Failed to fetch" ||
        /endpoint returned no data|placeholder text|expected a record response/i.test(
          error.message,
        )))
  );
}

export function demoSlotsForDoctor(doctorId: string) {
  return normalizeSlotList(
    readDemoSlots().filter((slot) => doctorIdFromRecord(slot) === doctorId),
  );
}

export function localFallbackSlot(slotId: string) {
  return readDemoSlots().find((slot) => String(slot.id || slot._id) === slotId);
}

function localSlotRecordsForDoctor(doctorId: string) {
  return readDemoSlots().filter(
    (slot) => doctorIdFromRecord(slot) === doctorId,
  );
}

export function localSlotRecordsForCurrentDoctor() {
  const keys = currentDoctorIdentityKeys();
  return readDemoSlots().filter((slot) => {
    const doctor = fallbackDoctorDetails(doctorIdFromRecord(slot));
    return [
      doctorIdFromRecord(slot),
      cleanString(slot.doctorName).toLowerCase(),
      cleanString(doctor?.displayName).toLowerCase(),
      cleanDoctorName(slot.doctorName),
      cleanDoctorName(doctor?.displayName),
      cleanString(doctor?.email).toLowerCase(),
    ].some((key) => key && keys.has(key));
  });
}

export function availableFutureSlots(slots: DoctorSession[]) {
  const now = Date.now();
  return slots.filter(
    (slot) =>
      slot.scheduledAt.getTime() > now &&
      String(slot.status || "").toLowerCase() === "available" &&
      !slot.patientId,
  );
}

export function bookDemoSlot(slotId: string, patient: SlotPatientDetails) {
  const slots = readDemoSlots();
  const index = slots.findIndex(
    (item) => String(item.id || item._id) === slotId,
  );
  if (index === -1) {
    throw new Error("Slot not found");
  }

  const existing = slots[index];
  assertFutureSlot(existing);

  if (!isSlotAvailable(existing)) {
    throw new Error(
      "This slot is no longer available. Please choose another time.",
    );
  }

  const updated = {
    ...existing,
    bookedAt: new Date().toISOString(),
    patient: patient.patientId,
    patientEmail: patient.patientEmail || "",
    patientName: patient.patientName,
    status: "booked",
  };

  assertNoDemoConflict(slots, updated, slotId);
  slots[index] = updated;
  writeDemoSlots(slots);
  return updated;
}

function bookedPatientRecordFromSlot(slot: ApiRecord, index: number) {
  const patient = asRecord(slot.patient);
  const patientId =
    recordId(slot.patient) ||
    cleanString(slot.patientId) ||
    `booked-patient-${index + 1}`;
  const patientName =
    cleanString(slot.patientName) ||
    cleanString(patient?.name) ||
    cleanString(patient?.displayName) ||
    `Patient ${shortId(patientId)}`;
  const patientEmail =
    cleanString(slot.patientEmail) ||
    cleanString(patient?.email) ||
    `${patientName.toLowerCase().replace(/\s+/g, ".")}@mindguard.local`;
  const readingAt = cleanString(slot.bookedAt) || cleanString(slot.updatedAt);

  return {
    _id: patientId,
    createdAt: slot.bookedAt || slot.createdAt || slot.startTime,
    currentMedications: "",
    diagnosis: "Booked session",
    medicalHistory: `Booked a ${cleanString(slot.type) || "video"} session with this doctor.`,
    metrics: {
      latestHeartRate: null,
      latestHrv: null,
      latestMood: null,
      latestReadingAt: readingAt || new Date().toISOString(),
      moodHistory: [],
    },
    sleep: null,
    treatingDoctor: doctorIdFromRecord(slot),
    updatedAt: readingAt || new Date().toISOString(),
    user: {
      _id: patientId,
      email: patientEmail,
      gender: patient?.gender || "",
      name: patientName,
    },
  };
}

export function getLocalBookedPatientRecordsForCurrentDoctor() {
  const seen = new Set<string>();
  return localSlotRecordsForCurrentDoctor()
    .filter((slot) => hasPatient(slot) && !isInactiveStatus(statusValue(slot)))
    .map(bookedPatientRecordFromSlot)
    .filter((patient) => {
      const user = asRecord(patient.user);
      const key = String(user?.email || patient._id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

function knownFallbackDoctor(doctorId: string): SlotDoctorDetails | null {
  const curatedDoctor = curatedDoctorProfiles.find(
    (doctor) => doctor.id === doctorId,
  );
  if (curatedDoctor) return curatedDoctor;

  const signedUpDoctor = getSignedUpDoctors().find(
    (doctor) => doctor.id === doctorId,
  );
  if (signedUpDoctor) {
    return {
      careModes: ["Video", "Chat"],
      displayName: signedUpDoctor.displayName,
      id: signedUpDoctor.id,
      sessionTime: "45 min",
      source: "signed-up",
    };
  }

  return null;
}

function fallbackDoctorDetails(
  doctorId: string,
  doctor?: SlotDoctorDetails | null,
) {
  if (doctor?.id) return doctor;
  return knownFallbackDoctor(doctorId);
}

export function normalizeSlotRecord(
  record: ApiRecord,
  index = 0,
): DoctorSession {
  const id = record?._id || record?.id || `slot-${index + 1}`;
  const scheduledAt = safeDate(startTimeValue(record));
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
    status: String(record?.status || "available"),
    type: cleanString(record?.type) || "video",
    reason: String(record?.reason || record?.status || "available"),
    severity: null,
    condition: null,
  };
}

function demoSlotRecord(session: DoctorSession): ApiRecord {
  const endAt = new Date(
    session.scheduledAt.getTime() + (session.duration || 60) * 60000,
  );
  return {
    id: session.id,
    doctor: session.doctorId || DEFAULT_DEMO_DOCTOR_ID,
    patient: session.patientId
      ? {
          id: session.patientId,
          name: session.patientName,
        }
      : null,
    patientName: session.patientId ? session.patientName : "",
    patientEmail: cleanString(session.raw?.patientEmail),
    patientId: session.patientId || "",
    doctorNote: cleanString(session.notes || session.raw?.doctorNote),
    notes: cleanString(session.notes || session.raw?.notes),
    reason: session.reason || session.status || "available",
    startTime: session.scheduledAt.toISOString(),
    endTime: endAt.toISOString(),
    status: session.status || "scheduled",
    type: session.type || "video",
  };
}

function fallbackSlotRecordsForDoctor(
  doctor: SlotDoctorDetails,
  doctorIndex = 0,
) {
  const now = new Date();
  const duration = Number.parseInt(String(doctor.sessionTime || ""), 10) || 45;
  const careModes = doctor.careModes || ["Video"];
  const type = careModes.some((mode) => mode.toLowerCase() === "in person")
    ? "inPerson"
    : "video";

  return fallbackAvailabilityTimes.map((time, timeIndex) => {
    const [hours, minutes] = time.split(":").map(Number);
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1 + ((doctorIndex + timeIndex) % 3),
      hours,
      minutes,
    );
    const end = new Date(start.getTime() + duration * 60000);
    const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;

    return {
      id: `fallback-slot-${doctor.id}-${dateKey}-${timeIndex + 1}`,
      doctor: doctor.id,
      doctorName: doctor.displayName || `Doctor ${shortId(doctor.id)}`,
      endTime: end.toISOString(),
      patient: null,
      patientName: "",
      reason: "available",
      startTime: start.toISOString(),
      status: "available",
      type,
    };
  });
}

function doctorFallbackSlotRecords() {
  const signedUpDoctors = getSignedUpDoctors().map<SlotDoctorDetails>(
    (doctor) => ({
      careModes: ["Video", "Chat"],
      displayName: doctor.displayName,
      id: doctor.id,
      sessionTime: "45 min",
      source: "signed-up",
    }),
  );

  return [...curatedDoctorProfiles, ...signedUpDoctors].flatMap(
    (doctor, doctorIndex) => fallbackSlotRecordsForDoctor(doctor, doctorIndex),
  );
}

export function ensureDoctorFallbackSlots(
  doctorId: string,
  doctor?: SlotDoctorDetails | null,
) {
  const existingSlots = localSlotRecordsForDoctor(doctorId);
  const hasFutureActiveSlot = existingSlots.some((slot) => {
    if (isInactiveStatus(statusValue(slot))) return false;
    return safeDate(startTimeValue(slot)).getTime() > Date.now();
  });
  if (hasFutureActiveSlot) return existingSlots;

  const details = fallbackDoctorDetails(doctorId, doctor);
  if (!details) return [];

  const slots = readDemoSlots();
  const created = fallbackSlotRecordsForDoctor(details, slots.length);
  writeDemoSlots(mergeSlotRecords(slots, created));
  return created;
}

export function readDemoSlots(): ApiRecord[] {
  const stored = storage.get<ApiRecord[]>(DEMO_SLOTS_KEY, []);
  const seed: ApiRecord[] = [
    ...demoSessions.map(demoSlotRecord),
    ...doctorFallbackSlotRecords(),
  ];
  const source = stored.length ? stored : seed;
  const seedById = new Map(
    seed.map((slot) => [String(slot.id || slot._id), slot]),
  );
  const merged = mergeSlotRecords(source, seed).map((slot) => ({
    ...slot,
    doctor: doctorIdFromRecord(slot) || DEFAULT_DEMO_DOCTOR_ID,
    status: cleanString(slot.status) || "available",
    ...(seedById.has(String(slot.id || slot._id)) ? { seeded: true } : {}),
  }));

  if (!stored.length || merged.length !== stored.length) {
    storage.set(DEMO_SLOTS_KEY, merged);
  }

  return merged;
}

export function writeDemoSlots(slots: ApiRecord[]) {
  storage.set(DEMO_SLOTS_KEY, slots);
}
