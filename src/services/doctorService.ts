import {
  ensureArrayRecords,
  ensureObjectData,
  ensureRecordHasAnyField,
} from "./apiResponse";
import { request } from "./apiClient";
import type { ApiRecord } from "../types/api";

const doctorFields = ["_id", "id", "specialization", "yearsOfExperience"];
const sessionSlotFields = [
  "_id",
  "id",
  "slots",
  "startTime",
  "endTime",
  "from",
  "to",
];

export const doctorService = {
  async getDoctors() {
    const response = await request("/doctors", { auth: true });
    return ensureArrayRecords(response, "Doctors", doctorFields);
  },

  async getDoctor(doctorId: string) {
    const response = await request(`/doctors/${doctorId}`, { auth: true });
    return ensureRecordHasAnyField(
      ensureObjectData(response, "Doctor"),
      "Doctor",
      doctorFields,
    );
  },

  async createSessionSlots({ from, to }: { from: string; to: string }) {
    const response = await request("/doctors", {
      auth: true,
      method: "POST",
      body: JSON.stringify({ from, to }),
    });
    return ensureRecordHasAnyField(
      ensureObjectData<ApiRecord>(response, "Doctor session slots"),
      "Doctor session slots",
      sessionSlotFields,
    );
  },
};
