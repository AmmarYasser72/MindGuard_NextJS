import {
  ensureObjectData,
  ensureRecordHasAnyField,
  isBackendServerError,
} from "./apiResponse";
import { apiRoutes } from "./apiRoutes";
import { request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";
import type { ApiRecord } from "../types/api";

const moodReadingFields = ["_id", "id", "patient", "type", "value", "mood"];

export const moodApiValues = {
  1: "very_low",
  2: "low",
  3: "neutral",
  4: "good",
  5: "excellent",
} as const;

export function moodToApiValue(mood: number | string) {
  const apiMood = moodApiValues[Number(mood) as keyof typeof moodApiValues];
  if (!apiMood) {
    throw new Error("Choose a valid mood before saving.");
  }
  return apiMood;
}

export const readingService = {
  async getPatientMoodHistory(params: { from?: string; to?: string } = {}) {
    if (shouldUseDemoData()) {
      return [] as ApiRecord[];
    }

    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await request(`${apiRoutes.readings.patientMoodHistory}${suffix}`, {
      auth: true,
    });
    return ensureArrayMoodReadings(response);
  },

  async savePatientMood(mood: number | string) {
    if (shouldUseDemoData()) {
      return {
        id: `demo-mood-${Date.now()}`,
        mood: moodToApiValue(mood),
        type: "mood",
        value: Number(mood),
      };
    }

    const moodValue = moodToApiValue(mood);
    try {
      const response = await request(apiRoutes.readings.patientMood, {
        auth: true,
        body: JSON.stringify({ mood: moodValue }),
        method: "POST",
      });
      return ensureRecordHasAnyField(
        ensureObjectData(response, "Mood reading"),
        "Mood reading",
        moodReadingFields,
      );
    } catch (error) {
      if (!isBackendServerError(error)) throw error;

      return {
        id: `local-mood-${Date.now()}`,
        mood: moodValue,
        type: "mood",
        value: moodValue,
      };
    }
  },
};

function ensureArrayMoodReadings(response: unknown): ApiRecord[] {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return [];
  }
  const data = (response as ApiRecord).data;
  return Array.isArray(data)
    ? data.filter(
        (item) => item && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}
