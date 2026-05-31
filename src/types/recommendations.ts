import type { ApiRecord } from "./api";

export type PatientConditionId = "anxiety" | "depression" | "stress" | "sleep" | "mixed";

export type PatientConditionOption = {
  id: PatientConditionId;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
};

export type DoctorProfile = {
  id: string;
  bio: string;
  careModes: string[];
  clinicAddress?: string | null;
  conditions: PatientConditionId[];
  displayName: string;
  email?: string | null;
  languages: string[];
  phone?: string | null;
  raw?: ApiRecord;
  sessionTime?: string | null;
  source: "backend" | "curated";
  specialization: string;
  yearsOfExperience: number;
};

export type DoctorRecommendation = DoctorProfile & {
  matchReasons: string[];
  matchScore: number;
};

export type DoctorRecommendationResult = {
  backendAvailable: boolean;
  recommendations: DoctorRecommendation[];
  usedCuratedProfiles: boolean;
};
