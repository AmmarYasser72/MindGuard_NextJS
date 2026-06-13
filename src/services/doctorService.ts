import {
  ensureArrayRecords,
  ensureObjectData,
  ensureRecordHasAnyField,
} from "./apiResponse";
import { apiRoutes } from "./apiRoutes";
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
    const response = await request(apiRoutes.doctors.base, { auth: true });
    return ensureArrayRecords(response, "Doctors", doctorFields);
  },

  async getDoctor(doctorId: string) {
    const response = await request(apiRoutes.doctors.byId(doctorId), {
      auth: true,
    });
    return ensureRecordHasAnyField(
      ensureObjectData(response, "Doctor"),
      "Doctor",
      doctorFields,
    );
  },

  async createSessionSlots({ from, to }: { from: string; to: string }) {
    const response = await request(apiRoutes.doctors.base, {
      auth: true,
      method: "POST",
      body: JSON.stringify({ from, to }),
    });
    try {
      return ensureRecordHasAnyField(
        ensureObjectData<ApiRecord>(response, "Doctor session slots"),
        "Doctor session slots",
        sessionSlotFields,
      );
    } catch {
      return response as ApiRecord;
    }
  },
};
