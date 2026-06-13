import {
  patientName,
} from "../../../data/doctorData";
import type { DoctorPatient, DoctorSession } from "../../../types/doctor";

export function isToday(date: Date) {
  const current = new Date();
  return (
    date.getFullYear() === current.getFullYear() &&
    date.getMonth() === current.getMonth() &&
    date.getDate() === current.getDate()
  );
}

function hasSessionPatient(session: DoctorSession) {
  const name = String(session.patientName || "").trim().toLowerCase();
  return Boolean(
    session.patientId ||
      session.raw?.patient ||
      session.raw?.patientEmail ||
      (name && name !== "unassigned"),
  );
}

export function isConfirmedUpcomingSession(session: DoctorSession) {
  const status = String(session.status || "").toLowerCase();
  return (
    session.scheduledAt >= new Date() &&
    !["available", "cancelled", "completed"].includes(status) &&
    hasSessionPatient(session)
  );
}

export function compareSessionsByRemainingTime(
  left: DoctorSession,
  right: DoctorSession,
) {
  return left.scheduledAt.getTime() - right.scheduledAt.getTime();
}

export function bookedAtDate(session: DoctorSession) {
  const source = session.raw?.bookedAt || session.raw?.createdAt;
  if (!source) return null;

  const bookedAt = new Date(String(source));
  return Number.isNaN(bookedAt.getTime()) ? null : bookedAt;
}

export function findSessionPatient(
  session: DoctorSession,
  patients: DoctorPatient[],
) {
  const sessionEmail = String(session.raw?.patientEmail || "").toLowerCase();
  const sessionName = String(session.patientName || "").toLowerCase();
  return (
    patients.find((patient) => patient.id === session.patientId) ||
    patients.find(
      (patient) => sessionEmail && patient.email.toLowerCase() === sessionEmail,
    ) ||
    patients.find(
      (patient) => patientName(patient).toLowerCase() === sessionName,
    ) ||
    null
  );
}

export function initials(patient: DoctorPatient | null, fallbackName: string) {
  const source = patient ? patientName(patient) : fallbackName;
  const parts = source.trim().split(/\s+/);
  return `${parts[0]?.charAt(0) || "P"}${parts[1]?.charAt(0) || ""}`.toUpperCase();
}
