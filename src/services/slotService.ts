import { ensureArrayRecords, ensureObjectData, ensureRecordHasAnyField, shortId } from "./apiResponse";
import { request } from "./apiClient";
import type { ApiRecord } from "../types/api";
import type { DoctorSession } from "../types/doctor";

const slotFields = ["_id", "id", "doctor", "patient", "startTime", "endTime", "from", "to", "status"];

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

function patientLabel(patient: unknown) {
  if (!patient) return "Unassigned";
  if (typeof patient === "string") return `Patient ${shortId(patient)}`;
  if (typeof patient !== "object" || Array.isArray(patient)) return "Unassigned";
  const record = patient as ApiRecord;
  const id = record._id || record.id;
  return String(record.name || record.displayName || (id ? `Patient ${shortId(id)}` : "Unassigned"));
}

export function normalizeSlotRecord(record: ApiRecord, index = 0): DoctorSession {
  const id = record?._id || record?.id || `slot-${index + 1}`;
  const scheduledAt = safeDate(record?.startTime || record?.from || record?.scheduledAt || record?.createdAt);
  const endAt = record?.endTime || record?.to ? safeDate(record.endTime || record.to) : null;
  const duration = endAt ? Math.max(1, Math.round((endAt.getTime() - scheduledAt.getTime()) / 60000)) : null;
  const patientRecord = record.patient && typeof record.patient === "object" && !Array.isArray(record.patient)
    ? record.patient as ApiRecord
    : null;

  return {
    id: String(id),
    raw: record,
    patientId: patientRecord ? String(patientRecord._id || patientRecord.id || "") || null : (record?.patient ? String(record.patient) : null),
    patientName: patientLabel(record?.patient),
    scheduledAt,
    duration,
    status: String(record?.status || "available"),
    type: "video",
    reason: String(record?.status || "available"),
    severity: null,
    condition: null,
  };
}

export const slotService = {
  async createSlot(slot: ApiRecord) {
    const response = await request("/slot", {
      auth: true,
      method: "POST",
      body: JSON.stringify(slot),
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Slot creation"), "Slot creation", slotFields);
  },

  async getDoctorSlots(params: Record<string, unknown> = {}) {
    const response = await request(`/slot/my${queryString(params)}`, { auth: true });
    return ensureArrayRecords(response, "Doctor slots", slotFields).map(normalizeSlotRecord);
  },

  async getSlot(slotId: string) {
    const response = await request(`/slot/${slotId}`, { auth: true });
    return normalizeSlotRecord(ensureRecordHasAnyField(ensureObjectData(response, "Slot"), "Slot", slotFields));
  },

  async updateSlot(slotId: string, updates: ApiRecord) {
    const response = await request(`/slot/${slotId}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Slot update"), "Slot update", slotFields);
  },

  async deleteSlot(slotId: string) {
    const response = await request(`/slot/${slotId}`, {
      auth: true,
      method: "DELETE",
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Slot deletion"), "Slot deletion", slotFields);
  },
};
