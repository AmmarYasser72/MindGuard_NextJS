import { ensureObjectData, ensureRecordHasAnyField } from "./apiResponse";
import { apiRoutes } from "./apiRoutes";
import { getAuthToken, request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";
import { SLOT_OVERRIDE_STORAGE_KEY, notifySlotChange } from "./slotSync";
import { storage } from "./storage";
import type { ApiRecord } from "../types/api";
import type { DoctorSession } from "../types/doctor";
import {
  assertFutureSlot,
  assertNoDemoConflict,
  assertSlotCanBeCreated,
  assertValidSlotRange,
  cleanString,
  extractSlotRecords,
  isConnectionFallbackError,
  isInactiveStatus,
  isPatientSlot,
  mergeSlotRecords,
  normalizeSlotList,
  normalizeSlotRecord,
  queryString,
  slotFields,
  slotWithDefaults,
  statusValue,
  type SlotDoctorDetails,
  type SlotPatientDetails,
} from "./slotService.helpers";
import {
  availableFutureSlots,
  bookDemoSlot,
  demoSlotsForDoctor,
  ensureDoctorFallbackSlots,
  localFallbackSlot,
  localSlotRecordsForCurrentDoctor,
  readDemoSlots,
  writeDemoSlots,
} from "./slotService.demo";

export {
  normalizeSlotRecord,
  type SlotDoctorDetails,
  type SlotPatientDetails,
} from "./slotService.helpers";
export { getLocalBookedPatientRecordsForCurrentDoctor } from "./slotService.demo";

function isMongoObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function isPermissionDeniedError(error: unknown) {
  const status = (error as { status?: number } | null)?.status;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    (status === 401 || status === 403) &&
    /(access denied|not authorized|unauthorized|forbidden)/i.test(message)
  );
}

function readSlotOverrides() {
  return storage.get<Record<string, ApiRecord>>(SLOT_OVERRIDE_STORAGE_KEY, {});
}

function writeSlotOverrides(overrides: Record<string, ApiRecord>) {
  storage.set(SLOT_OVERRIDE_STORAGE_KEY, overrides);
  notifySlotChange();
}

function clearSlotOverride(slotId: string) {
  const overrides = readSlotOverrides();
  if (!overrides[slotId]) return;
  delete overrides[slotId];
  writeSlotOverrides(overrides);
}

function saveSlotOverride(slotId: string, record: ApiRecord) {
  writeSlotOverrides({
    ...readSlotOverrides(),
    [slotId]: {
      ...record,
      id: record.id || record._id || slotId,
      _id: record._id || record.id || slotId,
    },
  });
}

function applySlotOverrides(records: ApiRecord[]) {
  const overrides = readSlotOverrides();
  const merged = new Map<string, ApiRecord>();

  records.forEach((record) => {
    const slotId = String(record.id || record._id || "");
    const override = slotId ? overrides[slotId] : null;
    merged.set(
      slotId || crypto.randomUUID(),
      override ? { ...record, ...override } : record,
    );
  });

  Object.entries(overrides).forEach(([slotId, record]) => {
    if (!merged.has(slotId)) {
      merged.set(slotId, record);
    }
  });

  return [...merged.values()];
}

function endTimeForSession(session: DoctorSession) {
  return (
    session.raw?.endTime ||
    session.raw?.to ||
    new Date(
      session.scheduledAt.getTime() + (session.duration || 60) * 60 * 1000,
    ).toISOString()
  );
}

function slotSnapshotRecord(
  session: DoctorSession,
  patient?: Partial<SlotPatientDetails>,
) {
  return {
    ...session.raw,
    doctor: session.raw?.doctor || session.doctorId || undefined,
    doctorId: session.raw?.doctorId || session.doctorId || undefined,
    endTime: endTimeForSession(session),
    id: session.raw?.id || session.id,
    notes: session.notes || session.raw?.notes || session.raw?.doctorNote || "",
    patient:
      session.raw?.patient || session.patientId || patient?.patientId || undefined,
    patientEmail:
      session.raw?.patientEmail || patient?.patientEmail || undefined,
    patientId:
      session.patientId || session.raw?.patientId || patient?.patientId || undefined,
    patientName: session.patientName || patient?.patientName || "Patient",
    reason: session.reason || session.status || "booked",
    startTime: session.raw?.startTime || session.scheduledAt.toISOString(),
    status: session.status || session.raw?.status || "booked",
    type: session.type || session.raw?.type || undefined,
  } satisfies ApiRecord;
}

function fallbackAvailableSlotsForDoctor(
  doctorId: string,
  doctor?: SlotDoctorDetails | null,
) {
  ensureDoctorFallbackSlots(doctorId, doctor);
  return availableFutureSlots(demoSlotsForDoctor(doctorId));
}

function backendSlotCreatePayload(slot: ApiRecord) {
  return {
    endTime: slot.endTime || slot.to,
    patient: slot.patient || slot.patientId || undefined,
    startTime: slot.startTime || slot.from || slot.scheduledAt,
    status: statusValue(slot) || undefined,
  };
}

export const slotService = {
  async createSlot(slot: ApiRecord) {
    const candidate = slotWithDefaults(slot);
    assertSlotCanBeCreated(candidate);

    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      assertNoDemoConflict(slots, candidate);
      const created = {
        ...candidate,
        id: `slot-${crypto.randomUUID()}`,
      };
      writeDemoSlots([created, ...slots]);
      return created;
    }

    try {
      const response = await request(apiRoutes.slots.base, {
        auth: true,
        method: "POST",
        body: JSON.stringify(backendSlotCreatePayload(candidate)),
      });
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Slot creation"),
        "Slot creation",
        slotFields,
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slots = readDemoSlots();
      assertNoDemoConflict(slots, candidate);
      const created = {
        ...candidate,
        id: `slot-${crypto.randomUUID()}`,
      };
      writeDemoSlots([created, ...slots]);
      return created;
    }
  },

  async getDoctorSlots(params: Record<string, unknown> = {}) {
    if (shouldUseDemoData()) {
      return normalizeSlotList(
        applySlotOverrides(localSlotRecordsForCurrentDoctor()),
      );
    }

    try {
      const response = await request(
        `${apiRoutes.slots.my}${queryString(params)}`,
        {
          auth: true,
        },
      );
      const backendRecords = extractSlotRecords(response, "Doctor slots");
      return normalizeSlotList(
        applySlotOverrides(
          mergeSlotRecords(backendRecords, localSlotRecordsForCurrentDoctor()),
        ),
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      return normalizeSlotList(
        applySlotOverrides(localSlotRecordsForCurrentDoctor()),
      );
    }
  },

  async getDoctorAvailableSlots(
    doctorId: string,
    doctor?: SlotDoctorDetails | null,
  ) {
    const cleanDoctorId = cleanString(doctorId);
    if (!cleanDoctorId) {
      throw new Error("Doctor id is required to load available slots.");
    }

    if (shouldUseDemoData()) {
      return fallbackAvailableSlotsForDoctor(cleanDoctorId, doctor);
    }

    if (!isMongoObjectId(cleanDoctorId)) {
      return fallbackAvailableSlotsForDoctor(cleanDoctorId, doctor);
    }

    const params = queryString({
      sortBy: "startTime",
      sortOrder: "asc",
    });
    const candidatePaths = [
      `${apiRoutes.slots.forDoctor(cleanDoctorId)}${params}`,
    ];

    for (const path of candidatePaths) {
      try {
        const response = await request(path);
        const backendSlots = availableFutureSlots(
          normalizeSlotList(
            extractSlotRecords(response, "Doctor available slots"),
          ),
        );
        return backendSlots.length
          ? backendSlots
          : fallbackAvailableSlotsForDoctor(cleanDoctorId, doctor);
      } catch (error) {
        if (isConnectionFallbackError(error)) {
          return fallbackAvailableSlotsForDoctor(cleanDoctorId, doctor);
        }
        throw error;
      }
    }

    return [];
  },

  async getPatientSlots(patient: Partial<SlotPatientDetails>) {
    if (!cleanString(patient.patientId) && !cleanString(patient.patientEmail)) {
      return [];
    }

    const cleanPatientId = cleanString(patient.patientId);
    const localSlots = readDemoSlots().filter((slot) =>
      isPatientSlot(slot, patient),
    );

    if (shouldUseDemoData()) {
      return normalizeSlotList(applySlotOverrides(localSlots));
    }

    if (isMongoObjectId(cleanPatientId)) {
      try {
        const response = await request(apiRoutes.slots.forPatient(cleanPatientId));
        return normalizeSlotList(
          applySlotOverrides(
            mergeSlotRecords(
              extractSlotRecords(response, "Patient booked slots"),
              localSlots,
            ),
          ),
        );
      } catch (error) {
        if (
          !isConnectionFallbackError(error) &&
          !isPermissionDeniedError(error) &&
          getAuthToken()
        ) {
          throw error;
        }
      }
    }

    if (!getAuthToken()) {
      return normalizeSlotList(applySlotOverrides(localSlots));
    }

    try {
      const response = await request(apiRoutes.slots.patientMine, {
        auth: true,
      });
      return normalizeSlotList(
        applySlotOverrides(
          mergeSlotRecords(
            extractSlotRecords(response, "Patient booked slots"),
            localSlots,
          ),
        ),
      );
    } catch (error) {
      if (
        !isConnectionFallbackError(error) &&
        !isPermissionDeniedError(error)
      ) {
        throw error;
      }

      return normalizeSlotList(applySlotOverrides(localSlots));
    }
  },

  async getSlot(slotId: string) {
    if (shouldUseDemoData()) {
      const slot = localFallbackSlot(slotId);
      if (!slot) {
        throw new Error("Slot not found");
      }
      return normalizeSlotRecord(slot);
    }

    try {
      const response = await request(apiRoutes.slots.byId(slotId), {
        auth: true,
      });
      return normalizeSlotRecord(
        applySlotOverrides([
          ensureRecordHasAnyField(
            ensureObjectData(response, "Slot"),
            "Slot",
            slotFields,
          ),
        ])[0],
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slot = applySlotOverrides(readDemoSlots()).find(
        (item) => String(item.id || item._id) === slotId,
      );
      if (!slot) {
        throw new Error("Slot not found");
      }
      return normalizeSlotRecord(slot);
    }
  },

  async bookSlot(slotId: string, patient: SlotPatientDetails) {
    if (!cleanString(patient.patientId)) {
      throw new Error("Patient id is required before booking a session.");
    }

    if (shouldUseDemoData()) {
      return normalizeSlotRecord(bookDemoSlot(slotId, patient));
    }

    if (localFallbackSlot(slotId)) {
      return normalizeSlotRecord(bookDemoSlot(slotId, patient));
    }

    try {
      const response = await request(apiRoutes.slots.book(slotId), {
        method: "PATCH",
        body: JSON.stringify({ patientId: patient.patientId }),
      });

      return normalizeSlotRecord(
        ensureRecordHasAnyField(
          ensureObjectData(response, "Slot booking"),
          "Slot booking",
          slotFields,
        ),
      );
    } catch (error) {
      if (isConnectionFallbackError(error)) {
        return normalizeSlotRecord(bookDemoSlot(slotId, patient));
      }

      throw error instanceof Error
        ? error
        : new Error(
            "This slot is no longer available. Please choose another time.",
          );
    }
  },

  async cancelPatientSlot(
    session: DoctorSession,
    patient: Partial<SlotPatientDetails>,
    extraUpdates: ApiRecord = {},
  ) {
    const cancelledAt = new Date().toISOString();
    const updates = {
      cancelledAt,
      cancelledBy: "patient",
      patient: session.raw?.patient || session.patientId || patient.patientId || undefined,
      patientEmail: session.raw?.patientEmail || patient.patientEmail || undefined,
      patientId:
        session.patientId || session.raw?.patientId || patient.patientId || undefined,
      patientName: session.patientName || patient.patientName || "Patient",
      reason: "cancelled",
      sessionUpdatedAt: cancelledAt,
      status: "cancelled",
      ...extraUpdates,
    };

    try {
      const updated = await slotService.updateSlot(session.id, updates);
      clearSlotOverride(session.id);
      return updated;
    } catch (error) {
      if (!isPermissionDeniedError(error)) throw error;

      const override = {
        ...slotSnapshotRecord(session, patient),
        ...updates,
      };
      saveSlotOverride(session.id, override);
      return normalizeSlotRecord(override);
    }
  },

  async updateSlot(slotId: string, updates: ApiRecord) {
    if (
      updates.startTime ||
      updates.from ||
      updates.scheduledAt ||
      updates.endTime ||
      updates.to
    ) {
      const current =
        readDemoSlots().find(
          (item) => String(item.id || item._id) === slotId,
        ) || {};
      assertValidSlotRange({ ...current, ...updates });
    }

    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const index = slots.findIndex(
        (item) => String(item.id || item._id) === slotId,
      );
      if (index === -1) {
        throw new Error("Slot not found");
      }
      const next = {
        ...slots[index],
        ...updates,
      };
      if (!isInactiveStatus(statusValue(next))) {
        assertFutureSlot(next);
        assertNoDemoConflict(slots, next, slotId);
      }
      slots[index] = next;
      clearSlotOverride(slotId);
      writeDemoSlots(slots);
      return next;
    }

    if (localFallbackSlot(slotId)) {
      const slots = readDemoSlots();
      const index = slots.findIndex(
        (item) => String(item.id || item._id) === slotId,
      );
      if (index === -1) {
        throw new Error("Slot not found");
      }
      const next = {
        ...slots[index],
        ...updates,
      };
      if (!isInactiveStatus(statusValue(next))) {
        assertFutureSlot(next);
        assertNoDemoConflict(slots, next, slotId);
      }
      slots[index] = next;
      clearSlotOverride(slotId);
      writeDemoSlots(slots);
      return next;
    }

    try {
      const response = await request(apiRoutes.slots.byId(slotId), {
        auth: true,
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      clearSlotOverride(slotId);
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Slot update"),
        "Slot update",
        slotFields,
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slots = readDemoSlots();
      const index = slots.findIndex(
        (item) => String(item.id || item._id) === slotId,
      );
      if (index === -1) {
        throw new Error("Slot not found");
      }
      const next = {
        ...slots[index],
        ...updates,
      };
      if (!isInactiveStatus(statusValue(next))) {
        assertFutureSlot(next);
        assertNoDemoConflict(slots, next, slotId);
      }
      slots[index] = next;
      clearSlotOverride(slotId);
      writeDemoSlots(slots);
      return next;
    }
  },

  async deleteSlot(slotId: string) {
    if (shouldUseDemoData()) {
      const slots = readDemoSlots();
      const next = slots.filter(
        (item) => String(item.id || item._id) !== slotId,
      );
      clearSlotOverride(slotId);
      writeDemoSlots(next);
      return { id: slotId };
    }

    if (localFallbackSlot(slotId)) {
      const slots = readDemoSlots();
      const next = slots.filter(
        (item) => String(item.id || item._id) !== slotId,
      );
      clearSlotOverride(slotId);
      writeDemoSlots(next);
      return { id: slotId };
    }

    try {
      const response = await request(apiRoutes.slots.byId(slotId), {
        auth: true,
        method: "DELETE",
      });
      clearSlotOverride(slotId);
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Slot deletion"),
        "Slot deletion",
        slotFields,
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slots = readDemoSlots();
      const next = slots.filter(
        (item) => String(item.id || item._id) !== slotId,
      );
      clearSlotOverride(slotId);
      writeDemoSlots(next);
      return { id: slotId };
    }
  },
};
