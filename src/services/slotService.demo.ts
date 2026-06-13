import { sessions as demoSessions } from "../data/doctorData";
import { curatedDoctorProfiles } from "../data/doctorRecommendations";
import { getSignedUpDoctors } from "./localDoctorDirectory";
import { storage } from "./storage";
import type { ApiRecord } from "../types/api";
import type { DoctorSession } from "../types/doctor";
import type {
  SlotDoctorDetails,
  SlotPatientDetails,
} from "./slotService.helpers";
import {
  assertFutureSlot,
  assertNoDemoConflict,
  cleanDoctorName,
  cleanString,
  doctorIdFromRecord,
  isInactiveStatus,
  mergeSlotRecords,
  normalizeSlotList,
  recordId,
  safeDate,
  shortPatientLabel,
  startTimeValue,
  statusValue,
} from "./slotService.helpers";
import { getSession } from "./session";
import { shortId } from "./apiResponse";

const DEFAULT_DEMO_DOCTOR_ID = "demo-doctor-001";
const fallbackAvailabilityTimes = ["09:00", "11:30", "15:30"];
const DEMO_SLOTS_KEY = "demo_slots";

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

function hasPatient(record: ApiRecord) {
  return Boolean(
    record.patient ||
      cleanString(record.patientId) ||
      shortPatientLabel(record.patientName) ||
      cleanString(record.patientEmail),
  );
}

function isSlotAvailable(record: ApiRecord) {
  return statusValue(record) === "available" && !hasPatient(record);
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

function shouldHideSeededDoctorSlot(record: ApiRecord) {
  return Boolean(
    record.seeded &&
      isSlotAvailable(record) &&
      !isInactiveStatus(statusValue(record)),
  );
}

export function localSlotRecordsForCurrentDoctor() {
  const keys = currentDoctorIdentityKeys();
  return readDemoSlots().filter((slot) => {
    if (shouldHideSeededDoctorSlot(slot)) return false;
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
      !slot.patientId &&
      !cleanString(slot.raw?.patient) &&
      !cleanString(slot.raw?.patientEmail) &&
      !shortPatientLabel(slot.raw?.patientName),
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
    patientId: patient.patientId,
    patientEmail: patient.patientEmail || "",
    patientName: patient.patientName,
    reason: "booked",
    status: "booked",
  };

  assertNoDemoConflict(slots, updated, slotId);
  slots[index] = updated;
  writeDemoSlots(slots);
  return updated;
}

function bookedPatientRecordFromSlot(slot: ApiRecord, index: number) {
  const patient = recordAsObject(slot.patient);
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
      const user = recordAsObject(patient.user);
      const key = String(user?.email || patient._id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

function recordAsObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;
}
