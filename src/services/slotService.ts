import { ensureObjectData, ensureRecordHasAnyField } from "./apiResponse";
import { apiRoutes } from "./apiRoutes";
import { request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";
import type { ApiRecord } from "../types/api";
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

function fallbackAvailableSlotsForDoctor(
  doctorId: string,
  doctor?: SlotDoctorDetails | null,
) {
  ensureDoctorFallbackSlots(doctorId, doctor);
  return availableFutureSlots(demoSlotsForDoctor(doctorId));
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
        body: JSON.stringify(candidate),
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
      return normalizeSlotList(localSlotRecordsForCurrentDoctor());
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
        mergeSlotRecords(backendRecords, localSlotRecordsForCurrentDoctor()),
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      return normalizeSlotList(localSlotRecordsForCurrentDoctor());
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
        const response = await request(path, { auth: true });
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

    if (shouldUseDemoData()) {
      return normalizeSlotList(
        readDemoSlots().filter((slot) => isPatientSlot(slot, patient)),
      );
    }

    try {
      const response = await request(apiRoutes.slots.patientMine, {
        auth: true,
      });
      const localSlots = readDemoSlots().filter((slot) =>
        isPatientSlot(slot, patient),
      );
      return normalizeSlotList(
        mergeSlotRecords(
          extractSlotRecords(response, "Patient booked slots"),
          localSlots,
        ),
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      return normalizeSlotList(
        readDemoSlots().filter((slot) => isPatientSlot(slot, patient)),
      );
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
        ensureRecordHasAnyField(
          ensureObjectData(response, "Slot"),
          "Slot",
          slotFields,
        ),
      );
    } catch (error) {
      if (!isConnectionFallbackError(error)) throw error;

      const slot = readDemoSlots().find(
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

    const currentSlot = await this.getSlot(slotId);
    const currentRecord = currentSlot.raw || {};
    assertFutureSlot(currentRecord);

    if (
      String(currentSlot.status || "").toLowerCase() !== "available" ||
      currentSlot.patientId
    ) {
      throw new Error(
        "This slot is no longer available. Please choose another time.",
      );
    }

    try {
      const response = await request(apiRoutes.slots.byId(slotId), {
        auth: true,
        method: "PATCH",
        body: JSON.stringify({
          bookedAt: new Date().toISOString(),
          patient: patient.patientId,
          patientId: patient.patientId,
          patientEmail: patient.patientEmail || "",
          patientName: patient.patientName,
          status: "booked",
        }),
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
      writeDemoSlots(slots);
      return next;
    }

    try {
      const response = await request(apiRoutes.slots.byId(slotId), {
        auth: true,
        method: "PATCH",
        body: JSON.stringify(updates),
      });
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
      writeDemoSlots(next);
      return { id: slotId };
    }

    if (localFallbackSlot(slotId)) {
      const slots = readDemoSlots();
      const next = slots.filter(
        (item) => String(item.id || item._id) !== slotId,
      );
      writeDemoSlots(next);
      return { id: slotId };
    }

    try {
      const response = await request(apiRoutes.slots.byId(slotId), {
        auth: true,
        method: "DELETE",
      });
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
      writeDemoSlots(next);
      return { id: slotId };
    }
  },
};
