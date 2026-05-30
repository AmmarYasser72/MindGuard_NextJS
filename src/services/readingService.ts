import { ensureObjectData, ensureRecordHasAnyField, isBackendServerError } from "./apiResponse";
import { request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";

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
    const query = new URLSearchParams({ mood: moodValue });
    try {
      const response = await request(`/readings/patient/mood?${query}`, {
        auth: true,
        method: "POST",
      });
      return ensureRecordHasAnyField(ensureObjectData(response, "Mood reading"), "Mood reading", moodReadingFields);
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
