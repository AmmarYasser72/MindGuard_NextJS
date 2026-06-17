import type { ApiRecord } from "./api";

export type DoctorPatient = {
  id: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number | null;
  condition: string;
  gender: string;
  hrv: number | null;
  hrvDeviation: number | null;
  journal: string;
  lastSeen: Date;
  mood: number | null;
  raw: ApiRecord;
  severity: string;
  sleep: number | null;
  trend: number[];
  warnings: string[];
};

export type DoctorSession = {
  id: string;
  doctorId?: string | null;
  doctorName?: string | null;
  patientName: string;
  scheduledAt: Date;
  condition: string | null;
  duration: number | null;
  patientId?: string | null;
  notes?: string;
  raw?: ApiRecord;
  reason?: string;
  severity?: string | null;
  status?: string;
  type?: string;
};

export type ScheduleForm = {
  date: string;
  duration: number | string;
  notes: string;
  patient: string;
  reason: string;
  time: string;
  type: string;
};
