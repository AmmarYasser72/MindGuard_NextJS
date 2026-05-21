import { ensureObjectData, ensureRecordHasAnyField } from "./apiResponse";
import { request } from "./apiClient";
import { isDemoMode } from "../config/demoMode";

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
    if (isDemoMode) {
      return {
        id: `demo-mood-${Date.now()}`,
        mood: moodToApiValue(mood),
        type: "mood",
        value: Number(mood),
      };
    }

    const response = await request("/reading/patient/mood", {
      auth: true,
      method: "POST",
      body: JSON.stringify({ mood: moodToApiValue(mood) }),
    });
    return ensureRecordHasAnyField(ensureObjectData(response, "Mood reading"), "Mood reading", moodReadingFields);
  },
};
