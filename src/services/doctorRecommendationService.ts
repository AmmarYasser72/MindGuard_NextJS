import {
  curatedDoctorProfiles,
  patientConditionOptions,
} from "../data/doctorRecommendations";
import { shouldUseDemoData } from "../config/demoMode";
import { doctorService } from "./doctorService";
import {
  getSignedUpDoctors,
  type SignedUpDoctor,
} from "./localDoctorDirectory";
import type { ApiRecord } from "../types/api";
import type {
  DoctorProfile,
  DoctorRecommendation,
  DoctorRecommendationResult,
  PatientConditionId,
} from "../types/recommendations";

const MINIMUM_VISIBLE_DOCTORS = 3;

const keywordByCondition = patientConditionOptions.reduce<
  Record<PatientConditionId, string[]>
>(
  (map, condition) => {
    map[condition.id] = condition.keywords.map((keyword) =>
      keyword.toLowerCase(),
    );
    return map;
  },
  {
    anxiety: [],
    depression: [],
    stress: [],
    sleep: [],
    mixed: [],
  },
);

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function normalizeId(record: ApiRecord) {
  return (
    asString(record._id) ||
    asString(record.id) ||
    asString(record.uid) ||
    crypto.randomUUID()
  );
}

function titleCaseFromIdentifier(value: string) {
  return value
    .replace(/[@._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join(" ");
}

function normalizeDoctorName(record: ApiRecord, id: string) {
  const explicitName =
    asString(record.displayName) ||
    asString(record.name) ||
    asString(record.fullName);
  if (explicitName) return explicitName;

  const firstName = asString(record.firstName);
  const lastName = asString(record.lastName);
  if (firstName || lastName)
    return `Dr. ${[firstName, lastName].filter(Boolean).join(" ")}`;

  const emailName = asString(record.email).split("@")[0];
  if (emailName) return `Dr. ${titleCaseFromIdentifier(emailName)}`;

  return `MindGuard Doctor ${id.slice(-4).toUpperCase()}`;
}

function inferConditionsFromSpecialization(
  specialization: string,
): PatientConditionId[] {
  const normalized = specialization.toLowerCase();
  const matches = patientConditionOptions
    .filter((condition) =>
      keywordByCondition[condition.id].some((keyword) =>
        normalized.includes(keyword),
      ),
    )
    .map((condition) => condition.id);

  if (matches.length) return matches;
  if (/psych|therapy|mental|behavioral|counsel/.test(normalized))
    return ["mixed"];
  return ["mixed"];
}

function normalizeBackendDoctor(record: ApiRecord): DoctorProfile {
  const id = normalizeId(record);
  const specialization =
    asString(record.specialization) || "Mental health specialist";
  const inferredConditions = inferConditionsFromSpecialization(specialization);
  const explicitConditions = asStringArray(record.conditions).filter(
    (condition): condition is PatientConditionId =>
      patientConditionOptions.some((option) => option.id === condition),
  );

  return {
    id,
    displayName: normalizeDoctorName(record, id),
    specialization,
    yearsOfExperience: asNumber(record.yearsOfExperience || record.experience),
    conditions: explicitConditions.length
      ? explicitConditions
      : inferredConditions,
    careModes: asStringArray(record.careModes).length
      ? asStringArray(record.careModes)
      : ["Video", "Chat"],
    languages: asStringArray(record.languages).length
      ? asStringArray(record.languages)
      : ["English", "Arabic"],
    email: asString(record.email) || null,
    phone: asString(record.phone || record.phoneNumber) || null,
    clinicAddress: asString(record.clinicAddress || record.address) || null,
    sessionTime: asString(record.sessionTime) || null,
    source: "backend",
    bio:
      asString(record.bio) ||
      `Specializes in ${specialization.toLowerCase()} with care plans tailored to patient progress.`,
    raw: record,
  };
}

function normalizeSignedUpDoctor(record: SignedUpDoctor): DoctorProfile {
  const specialization =
    asString(record.specialization) || "Mental health specialist";
  const rawRecord = record as unknown as ApiRecord;

  return {
    id: record.id,
    displayName:
      asString(record.displayName) || normalizeDoctorName(rawRecord, record.id),
    specialization,
    yearsOfExperience: asNumber(record.yearsOfExperience),
    conditions: inferConditionsFromSpecialization(specialization),
    careModes: ["Video", "Chat"],
    languages: ["English", "Arabic"],
    email: asString(record.email) || null,
    phone: null,
    clinicAddress: "MindGuard signed-up doctor",
    sessionTime: "Flexible",
    source: "signed-up",
    bio: `Recently joined MindGuard as a ${specialization.toLowerCase()} specialist.`,
    raw: rawRecord,
  };
}

function keywordScore(doctor: DoctorProfile, conditionId: PatientConditionId) {
  const searchable =
    `${doctor.specialization} ${doctor.bio} ${doctor.conditions.join(" ")}`.toLowerCase();
  return keywordByCondition[conditionId].filter((keyword) =>
    searchable.includes(keyword),
  ).length;
}

function buildMatchReasons(
  doctor: DoctorProfile,
  conditionId: PatientConditionId,
) {
  const reasons: string[] = [];
  const condition = patientConditionOptions.find(
    (option) => option.id === conditionId,
  );

  if (doctor.conditions.includes(conditionId)) {
    reasons.push(
      `Direct match for ${condition?.label.toLowerCase() || "your condition"}`,
    );
  } else if (doctor.conditions.includes("mixed")) {
    reasons.push("Good fit for mixed or unclear symptoms");
  }

  if (doctor.yearsOfExperience >= 10) {
    reasons.push(`${doctor.yearsOfExperience}+ years of experience`);
  } else if (doctor.yearsOfExperience > 0) {
    reasons.push(`${doctor.yearsOfExperience} years of focused care`);
  }

  if (doctor.careModes.length) {
    reasons.push(`${doctor.careModes.slice(0, 2).join(" and ")} support`);
  }

  return reasons.slice(0, 3);
}

function scoreDoctor(
  doctor: DoctorProfile,
  conditionId: PatientConditionId,
): DoctorRecommendation {
  const directMatch = doctor.conditions.includes(conditionId);
  const broadMatch = doctor.conditions.includes("mixed");
  const specializationMatches = keywordScore(doctor, conditionId);
  const matchStatus =
    directMatch || specializationMatches > 0
      ? "matched"
      : broadMatch
        ? "broad"
        : "not-matched";
  const experienceScore = Math.min(doctor.yearsOfExperience, 15);
  const contactScore = doctor.email || doctor.phone ? 6 : 0;
  const score =
    42 +
    (directMatch ? 34 : 0) +
    (!directMatch && broadMatch ? 14 : 0) +
    Math.min(specializationMatches * 6, 18) +
    experienceScore +
    contactScore;

  return {
    ...doctor,
    conditionMatch: matchStatus !== "not-matched",
    matchReasons: buildMatchReasons(doctor, conditionId),
    matchScore: Math.min(Math.round(score), 99),
    matchStatus,
  };
}

function doctorIdentityKeys(doctor: DoctorProfile) {
  return [doctor.id, doctor.email || ""]
    .map((key) => key.trim().toLowerCase())
    .filter(Boolean);
}

function mergeDoctorProfiles(...groups: DoctorProfile[][]) {
  const seen = new Set<string>();
  const merged: DoctorProfile[] = [];

  groups.forEach((group) => {
    group.forEach((doctor) => {
      const keys = doctorIdentityKeys(doctor);
      if (keys.some((key) => seen.has(key))) return;
      merged.push(doctor);
      keys.forEach((key) => seen.add(key));
    });
  });

  return merged;
}

async function loadBackendDoctorProfiles() {
  const doctors = await doctorService.getDoctors();
  return doctors.map(normalizeBackendDoctor);
}

function loadSignedUpDoctorProfiles() {
  return getSignedUpDoctors().map(normalizeSignedUpDoctor);
}

export async function getDoctorRecommendations(
  conditionId: PatientConditionId,
): Promise<DoctorRecommendationResult> {
  const signedUpDoctors = loadSignedUpDoctorProfiles();
  let backendDoctors: DoctorProfile[] = [];
  let backendAvailable = false;

  if (!shouldUseDemoData()) {
    try {
      backendDoctors = await loadBackendDoctorProfiles();
      backendAvailable = true;
    } catch {
      backendDoctors = [];
    }
  }

  const liveDoctors = mergeDoctorProfiles(signedUpDoctors, backendDoctors);
  const needsCuratedProfiles = liveDoctors.length < MINIMUM_VISIBLE_DOCTORS;
  const doctors = needsCuratedProfiles
    ? mergeDoctorProfiles(liveDoctors, curatedDoctorProfiles)
    : liveDoctors;

  return {
    backendAvailable,
    usedCuratedProfiles: needsCuratedProfiles,
    recommendations: doctors
      .map((doctor) => scoreDoctor(doctor, conditionId))
      .sort((left, right) => right.matchScore - left.matchScore),
  };
}
