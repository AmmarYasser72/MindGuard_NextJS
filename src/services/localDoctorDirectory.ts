import { storage } from "./storage";
import type { AuthUser, RegisterProfile } from "../types/auth";

const SIGNED_UP_DOCTORS_KEY = "signed_up_doctors";

export type SignedUpDoctor = {
  id: string;
  createdAt: string;
  displayName: string;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

function doctorId(profile: RegisterProfile, user?: AuthUser) {
  const existingId = cleanString(user?.uid) || cleanString(user?.id) || cleanString(user?._id);
  if (existingId) return existingId;
  return `local-doctor-${profile.email.trim().toLowerCase()}`;
}

export function getSignedUpDoctors() {
  return storage
    .get<SignedUpDoctor[]>(SIGNED_UP_DOCTORS_KEY, [])
    .filter((doctor) => doctor && doctor.id && doctor.email && doctor.specialization);
}

export function saveSignedUpDoctor(profile: RegisterProfile, user?: AuthUser) {
  if (profile.role !== "doctor") return null;

  const cleanEmail = profile.email.trim().toLowerCase();
  const displayName = `Dr. ${profile.firstName.trim()} ${profile.lastName.trim()}`.replace(/\s+/g, " ").trim();
  const nextDoctor: SignedUpDoctor = {
    id: doctorId(profile, user),
    createdAt: new Date().toISOString(),
    displayName,
    email: cleanEmail,
    firstName: cleanString(profile.firstName),
    gender: cleanString(profile.gender),
    lastName: cleanString(profile.lastName),
    licenseNumber: cleanString(profile.licenseNumber),
    specialization: cleanString(profile.specialization) || "Mental health specialist",
    yearsOfExperience: cleanNumber(profile.yearsOfExperience),
  };
  const doctors = getSignedUpDoctors();
  const existingIndex = doctors.findIndex((doctor) => (
    doctor.id === nextDoctor.id || cleanString(doctor.email).toLowerCase() === cleanEmail
  ));

  if (existingIndex >= 0) {
    doctors[existingIndex] = { ...doctors[existingIndex], ...nextDoctor };
  } else {
    doctors.push(nextDoctor);
  }

  storage.set(SIGNED_UP_DOCTORS_KEY, doctors);
  return nextDoctor;
}
