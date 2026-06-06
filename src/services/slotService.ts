import {
  ensureArrayRecords,
  ensureObjectData,
  ensureRecordHasAnyField,
  isBackendServerError,
  shortId,
} from "./apiResponse";
import { request } from "./apiClient";
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
const slotFields = [
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
const DEMO_SLOTS_KEY = "demo_slots";

export type SlotPatientDetails = {
  patientEmail?: string | null;
  patientId: string;
  patientName: string;
};

export type SlotDoctorDetails = {
  careModes?: string[];
  displayName?: string;
  id: string;
  sessionTime?: string | null;
  source?: DoctorProfileSource | string;
};

function queryString(params: Record<string, unknown> = {}) {
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

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function statusValue(record: ApiRecord) {
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

function isInactiveStatus(status: string) {
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

function assertFutureSlot(record: ApiRecord) {
  const start = safeDate(startTimeValue(record));
  if (start.getTime() <= Date.now()) {
    throw new Error("This time slot has already passed. Choose a future slot.");
  }
}

function assertValidSlotRange(record: ApiRecord) {
  const { end, start } = slotRange(record);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Choose a valid date and time before scheduling.");
  }
  if (end.getTime() <= start.getTime()) {
    throw new Error("Session end time must be after the start time.");
  }
}

function assertSlotCanBeCreated(slot: ApiRecord) {
  assertValidSlotRange(slot);
  assertFutureSlot(slot);
}

function assertNoDemoConflict(
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

function slotWithDefaults(slot: ApiRecord) {
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

function isPatientSlot(
  record: ApiRecord,
  patient: Partial<SlotPatientDetails>,
) {
  const keys = patientIdentityKeys(patient);
  return slotPatientKeys(record).some((key) => keys.has(key));
}

function normalizeSlotList(records: ApiRecord[]) {
  return records
    .map(normalizeSlotRecord)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

function extractSlotRecords(response: unknown, label: string) {
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

function isConnectionFallbackError(error: unknown) {
  return (
    isBackendServerError(error) ||
    (error instanceof Error &&
      (error.name === "TypeError" || error.message === "Failed to fetch"))
  );
}

function demoSlotsForDoctor(doctorId: string) {
  return normalizeSlotList(
    readDemoSlots().filter((slot) => doctorIdFromRecord(slot) === doctorId),
  );
}

function localFallbackSlot(slotId: string) {
  return readDemoSlots().find((slot) => String(slot.id || slot._id) === slotId);
}

function localSlotRecordsForDoctor(doctorId: string) {
  return readDemoSlots().filter(
    (slot) => doctorIdFromRecord(slot) === doctorId,
  );
}

function availableFutureSlots(slots: DoctorSession[]) {
  const now = Date.now();
  return slots.filter(
    (slot) =>
      slot.scheduledAt.getTime() > now &&
      String(slot.status || "").toLowerCase() === "available" &&
      !slot.patientId,
  );
}

function bookDemoSlot(slotId: string, patient: SlotPatientDetails) {
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

function mergeSlotRecords(primary: ApiRecord[], fallback: ApiRecord[]) {
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

function ensureDoctorFallbackSlots(
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

function readDemoSlots(): ApiRecord[] {
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

function writeDemoSlots(slots: ApiRecord[]) {
  storage.set(DEMO_SLOTS_KEY, slots);
}

export const slotService = {
  async createSlot(slot: ApiRecord) {
    const candidate = slotWithDefaults(slot);
    assertSlotCanBeCreated(candidate);

    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      assertNoDemoConflict(slots, candidate);
      const created = {
        ...candidate,
        id: `slot-${crypto.randomUUID()}`,
      };
      writeDemoSlots([created, ...slots]);
      return created;
    }

    try {
      const response = await request("/slots", {
        auth: true,
        method: "POST",
        body: JSON.stringify(candidate),
      });
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Slot creation"),
        "Slot creation",
        slotFields,
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slots = readDemoSlots();
      assertNoDemoConflict(slots, candidate);
      const created = {
        ...candidate,
        id: `slot-${crypto.randomUUID()}`,
      };
      writeDemoSlots([created, ...slots]);
      return created;
    }
  },

  async getDoctorSlots(params: Record<string, unknown> = {}) {
    const doctorId = currentDoctorId();
    if (shouldUseDemoData()) {
      return demoSlotsForDoctor(doctorId);
    }

    try {
      const response = await request(`/slots/my${queryString(params)}`, {
        auth: true,
      });
      const backendRecords = extractSlotRecords(response, "Doctor slots");
      return normalizeSlotList(
        mergeSlotRecords(backendRecords, localSlotRecordsForDoctor(doctorId)),
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      return demoSlotsForDoctor(doctorId);
    }
  },

  async getDoctorAvailableSlots(
    doctorId: string,
    doctor?: SlotDoctorDetails | null,
  ) {
    const cleanDoctorId = cleanString(doctorId);
    if (!cleanDoctorId) {
      throw new Error("Doctor id is required to load available slots.");
    }

    if (shouldUseDemoData()) {
      ensureDoctorFallbackSlots(cleanDoctorId, doctor);
      return availableFutureSlots(demoSlotsForDoctor(cleanDoctorId));
    }

    const params = queryString({
      doctor: cleanDoctorId,
      sortBy: "startTime",
      sortOrder: "asc",
      status: "available",
    });
    const candidatePaths = [
      `/slots${params}`,
      `/doctors/${encodeURIComponent(cleanDoctorId)}/slots${queryString({
        sortBy: "startTime",
        sortOrder: "asc",
        status: "available",
      })}`,
      `/slots/doctor/${encodeURIComponent(cleanDoctorId)}${queryString({
        sortBy: "startTime",
        sortOrder: "asc",
        status: "available",
      })}`,
    ];

    for (const path of candidatePaths) {
      try {
        const response = await request(path, { auth: true });
        const backendSlots = availableFutureSlots(
          normalizeSlotList(
            extractSlotRecords(response, "Doctor available slots"),
          ),
        );
        if (backendSlots.length) {
          return backendSlots;
        }
        ensureDoctorFallbackSlots(cleanDoctorId, doctor);
        return availableFutureSlots(demoSlotsForDoctor(cleanDoctorId));
      } catch (error) {
        if (isConnectionFallbackError(error)) {
          ensureDoctorFallbackSlots(cleanDoctorId, doctor);
          return availableFutureSlots(demoSlotsForDoctor(cleanDoctorId));
        }
      }
    }

    ensureDoctorFallbackSlots(cleanDoctorId, doctor);
    return availableFutureSlots(demoSlotsForDoctor(cleanDoctorId));
  },

  async getPatientSlots(patient: Partial<SlotPatientDetails>) {
    if (shouldUseDemoData()) {
      return normalizeSlotList(
        readDemoSlots().filter((slot) => isPatientSlot(slot, patient)),
      );
    }

    try {
      const response = await request(
        `/slots/my${queryString({
          all: true,
          sortBy: "startTime",
          sortOrder: "asc",
        })}`,
        { auth: true },
      );
      const backendRecords = extractSlotRecords(response, "Patient slots");
      const localRecords = readDemoSlots().filter((slot) =>
        isPatientSlot(slot, patient),
      );
      return normalizeSlotList(mergeSlotRecords(backendRecords, localRecords));
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      return normalizeSlotList(
        readDemoSlots().filter((slot) => isPatientSlot(slot, patient)),
      );
    }
  },

  async getSlot(slotId: string) {
    if (shouldUseDemoData()) {
      const slot = localFallbackSlot(slotId);
      if (!slot) {
        throw new Error("Slot not found");
      }
      return normalizeSlotRecord(slot);
    }

    const fallbackSlot = localFallbackSlot(slotId);
    if (fallbackSlot) {
      return normalizeSlotRecord(fallbackSlot);
    }

    try {
      const response = await request(`/slots/${slotId}`, { auth: true });
      return normalizeSlotRecord(
        ensureRecordHasAnyField(
          ensureObjectData(response, "Slot"),
          "Slot",
          slotFields,
        ),
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slot = readDemoSlots().find(
        (item) => String(item.id || item._id) === slotId,
      );
      if (!slot) {
        throw new Error("Slot not found");
      }
      return normalizeSlotRecord(slot);
    }
  },

  async bookSlot(slotId: string, patient: SlotPatientDetails) {
    if (!cleanString(patient.patientId)) {
      throw new Error("Patient id is required before booking a session.");
    }

    if (shouldUseDemoData()) {
      return normalizeSlotRecord(bookDemoSlot(slotId, patient));
    }

    const fallbackSlot = localFallbackSlot(slotId);
    if (fallbackSlot) {
      return normalizeSlotRecord(bookDemoSlot(slotId, patient));
    }

    const currentSlot = await this.getSlot(slotId);
    const currentRecord = currentSlot.raw || {};
    assertFutureSlot(currentRecord);

    if (
      String(currentSlot.status || "").toLowerCase() !== "available" ||
      currentSlot.patientId
    ) {
      throw new Error(
        "This slot is no longer available. Please choose another time.",
      );
    }

    try {
      const response = await request(`/slots/${slotId}`, {
        auth: true,
        method: "PATCH",
        body: JSON.stringify({
          bookedAt: new Date().toISOString(),
          patient: patient.patientId,
          patientEmail: patient.patientEmail || "",
          patientName: patient.patientName,
          status: "booked",
        }),
      });

      return normalizeSlotRecord(
        ensureRecordHasAnyField(
          ensureObjectData(response, "Slot booking"),
          "Slot booking",
          slotFields,
        ),
      );
    } catch (error) {
      if (isConnectionFallbackError(error)) {
        return normalizeSlotRecord(bookDemoSlot(slotId, patient));
      }

      throw error instanceof Error
        ? error
        : new Error(
            "This slot is no longer available. Please choose another time.",
          );
    }
  },

  async updateSlot(slotId: string, updates: ApiRecord) {
    if (
      updates.startTime ||
      updates.from ||
      updates.scheduledAt ||
      updates.endTime ||
      updates.to
    ) {
      const current =
        readDemoSlots().find(
          (item) => String(item.id || item._id) === slotId,
        ) || {};
      assertValidSlotRange({ ...current, ...updates });
    }

    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const index = slots.findIndex(
        (item) => String(item.id || item._id) === slotId,
      );
      if (index === -1) {
        throw new Error("Slot not found");
      }
      const next = {
        ...slots[index],
        ...updates,
      };
      if (!isInactiveStatus(statusValue(next))) {
        assertFutureSlot(next);
        assertNoDemoConflict(slots, next, slotId);
      }
      slots[index] = next;
      writeDemoSlots(slots);
      return next;
    }

    try {
      const response = await request(`/slots/${slotId}`, {
        auth: true,
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Slot update"),
        "Slot update",
        slotFields,
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slots = readDemoSlots();
      const index = slots.findIndex(
        (item) => String(item.id || item._id) === slotId,
      );
      if (index === -1) {
        throw new Error("Slot not found");
      }
      const next = {
        ...slots[index],
        ...updates,
      };
      if (!isInactiveStatus(statusValue(next))) {
        assertFutureSlot(next);
        assertNoDemoConflict(slots, next, slotId);
      }
      slots[index] = next;
      writeDemoSlots(slots);
      return next;
    }
  },

  async deleteSlot(slotId: string) {
    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const next = slots.filter(
        (item) => String(item.id || item._id) !== slotId,
      );
      writeDemoSlots(next);
      return { id: slotId };
    }

    try {
      const response = await request(`/slots/${slotId}`, {
        auth: true,
        method: "DELETE",
      });
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Slot deletion"),
        "Slot deletion",
        slotFields,
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slots = readDemoSlots();
      const next = slots.filter(
        (item) => String(item.id || item._id) !== slotId,
      );
      writeDemoSlots(next);
      return { id: slotId };
    }
  },
};
