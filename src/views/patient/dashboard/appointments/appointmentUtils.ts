import type { AuthUser } from "../../../../types/auth";
import type { DoctorSession } from "../../../../types/doctor";

export type PatientAppointmentDetails = {
  patientEmail: string;
  patientId: string;
  patientName: string;
};

export function getPatientAppointmentDetails(
  user: AuthUser | null,
): PatientAppointmentDetails {
  return {
    patientEmail: user?.email || "",
    patientId: user?.uid || user?._id || user?.id || user?.email || "",
    patientName: user?.displayName || user?.email?.split("@")[0] || "Patient",
  };
}

export function isUpcomingAppointment(session: DoctorSession) {
  const status = String(session.status || "").toLowerCase();
  return (
    !["available", "cancelled", "completed"].includes(status) &&
    session.scheduledAt.getTime() > Date.now()
  );
}

export function compareAppointmentsByRemainingTime(
  left: DoctorSession,
  right: DoctorSession,
) {
  return left.scheduledAt.getTime() - right.scheduledAt.getTime();
}

export function formatAppointmentDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
