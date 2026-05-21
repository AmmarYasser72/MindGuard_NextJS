import { ensureArrayRecords, shortId } from "./apiResponse";
import { request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";
import { patients as demoPatients } from "../data/doctorData";
import type { ApiRecord } from "../types/api";
import type { DoctorPatient } from "../types/doctor";

const patientFields = ["_id", "id", "user", "diagnosis", "medicalHistory", "currentMedications", "treatingDoctor"];

function safeDate(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function ageFromBirthDate(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayPassed = today.getMonth() > date.getMonth()
    || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!birthdayPassed) age -= 1;
  return age >= 0 ? age : null;
}

function splitName(name: unknown, fallbackId: unknown) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName) return [`Patient`, shortId(fallbackId)];
  const parts = cleanName.split(/\s+/);
  return [parts[0] || "Patient", parts.slice(1).join(" ") || shortId(fallbackId)];
}

export function normalizePatientRecord(record: ApiRecord, index = 0): DoctorPatient {
  const id = record?._id || record?.id || `patient-${index + 1}`;
  const user = record?.user && typeof record.user === "object" && !Array.isArray(record.user) ? record.user as ApiRecord : {};
  const sourceName = record?.name || record?.fullName || user.name;
  const [firstName, lastName] = splitName(sourceName, id);
  const displayName = `${firstName} ${lastName}`.trim();
  const gender = record?.gender || user.gender || "";
  const diagnosis = record?.diagnosis || "";

  return {
    id: String(id),
    raw: record,
    firstName,
    lastName,
    displayName,
    email: String(record?.email || user.email || "No email available"),
    age: ageFromBirthDate(record?.dateOfBirth || user.dateOfBirth),
    gender: gender ? String(gender).charAt(0).toUpperCase() : "",
    lastSeen: safeDate(record?.updatedAt || record?.createdAt),
    severity: "normal",
    condition: diagnosis ? "mixed" : "none",
    mood: null,
    hrv: null,
    hrvDeviation: null,
    sleep: null,
    journal: String(record?.medicalHistory || record?.currentMedications || diagnosis || ""),
    trend: [],
    warnings: [],
  };
}

export const patientService = {
  async getDoctorPatients(doctorId: string) {
    if (shouldUseDemoData()) {
      return demoPatients.map((patient) => ({
        ...patient,
        displayName: `${patient.firstName} ${patient.lastName}`.trim(),
        raw: {},
        warnings: patient.warnings || [],
      }));
    }

    const response = await request(`/patient/doctor/${doctorId}`, { auth: true });
    return ensureArrayRecords(response, "Doctor patients", patientFields).map(normalizePatientRecord);
  },
};
