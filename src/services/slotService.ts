import { ensureArrayRecords, ensureObjectData, ensureRecordHasAnyField, shortId } from "./apiResponse";
import { request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";
import { patients as demoPatients, sessions as demoSessions } from "../data/doctorData";
import { storage } from "./storage";
import type { ApiRecord } from "../types/api";
import type { DoctorSession } from "../types/doctor";

const slotFields = ["_id", "id", "doctor", "patient", "startTime", "endTime", "from", "to", "status"];
const DEMO_SLOTS_KEY = "demo_slots";

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
  if (typeof patient === "string") {
    const matchedPatient = demoPatients.find((item) => item.id === patient);
    if (matchedPatient) {
      return `${matchedPatient.firstName} ${matchedPatient.lastName}`.trim();
    }
    return `Patient ${shortId(patient)}`;
  }
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

function demoSlotRecord(session: DoctorSession): ApiRecord {
  const endAt = new Date(session.scheduledAt.getTime() + (session.duration || 60) * 60000);
  return {
    id: session.id,
    patient: session.patientId
      ? {
        id: session.patientId,
        name: session.patientName,
      }
      : null,
    startTime: session.scheduledAt.toISOString(),
    endTime: endAt.toISOString(),
    status: session.status || "scheduled",
  };
}

function readDemoSlots() {
  const stored = storage.get<ApiRecord[]>(DEMO_SLOTS_KEY, []);
  if (stored.length) return stored;
  const seed = demoSessions.map(demoSlotRecord);
  storage.set(DEMO_SLOTS_KEY, seed);
  return seed;
}

function writeDemoSlots(slots: ApiRecord[]) {
  storage.set(DEMO_SLOTS_KEY, slots);
}

export const slotService = {
  async createSlot(slot: ApiRecord) {
    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const created = {
        ...slot,
        id: `slot-${crypto.randomUUID()}`,
        status: String(slot.status || "available"),
      };
      writeDemoSlots([created, ...slots]);
      return created;
    }

    const response = await request("/slot", {
      auth: true,
      method: "POST",
      body: JSON.stringify(slot),
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Slot creation"), "Slot creation", slotFields);
  },

  async getDoctorSlots(params: Record<string, unknown> = {}) {
    if (shouldUseDemoData()) {
      const slots = readDemoSlots()
        .map(normalizeSlotRecord)
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
      return slots;
    }

    const response = await request(`/slot/my${queryString(params)}`, { auth: true });
    return ensureArrayRecords(response, "Doctor slots", slotFields).map(normalizeSlotRecord);
  },

  async getSlot(slotId: string) {
    if (shouldUseDemoData()) {
      const slot = readDemoSlots().find((item) => String(item.id || item._id) === slotId);
      if (!slot) {
        throw new Error("Slot not found");
      }
      return normalizeSlotRecord(slot);
    }

    const response = await request(`/slot/${slotId}`, { auth: true });
    return normalizeSlotRecord(ensureRecordHasAnyField(ensureObjectData(response, "Slot"), "Slot", slotFields));
  },

  async updateSlot(slotId: string, updates: ApiRecord) {
    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const index = slots.findIndex((item) => String(item.id || item._id) === slotId);
      if (index === -1) {
        throw new Error("Slot not found");
      }
      const next = {
        ...slots[index],
        ...updates,
      };
      slots[index] = next;
      writeDemoSlots(slots);
      return next;
    }

    const response = await request(`/slot/${slotId}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Slot update"), "Slot update", slotFields);
  },

  async deleteSlot(slotId: string) {
    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const next = slots.filter((item) => String(item.id || item._id) !== slotId);
      writeDemoSlots(next);
      return { id: slotId };
    }

    const response = await request(`/slot/${slotId}`, {
      auth: true,
      method: "DELETE",
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Slot deletion"), "Slot deletion", slotFields);
  },
};
