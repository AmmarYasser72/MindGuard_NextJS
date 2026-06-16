import {
  ensureObjectData,
  ensureRecordHasAnyField,
  isBackendServerError,
} from "./apiResponse";
import { apiRoutes } from "./apiRoutes";
import { request } from "./apiClient";
import { shouldUseDemoData } from "../config/demoMode";
import type { ApiError, ApiRecord } from "../types/api";

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
    const moodValue = moodToApiValue(mood);
    if (shouldUseDemoData()) {
      return createLocalMoodReading(moodValue, "demo");
    }

    const payloads = [
      { mood: moodValue },
      { mood: moodValue, type: "mood", value: moodValue },
      { type: "mood", value: moodValue },
    ];

    let lastError: unknown = null;

    for (const payload of payloads) {
      try {
        const response = await request(apiRoutes.readings.patientMood, {
          auth: true,
          body: JSON.stringify(payload),
          method: "POST",
        });
        return ensureRecordHasAnyField(
          ensureObjectData(response, "Mood reading"),
          "Mood reading",
          moodReadingFields,
        );
      } catch (error) {
        lastError = error;
        if (isRecoverableMoodSaveError(error)) {
          continue;
        }
        throw error;
      }
    }

    if (isRecoverableMoodSaveError(lastError)) {
      return createLocalMoodReading(moodValue, "fallback");
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Unable to save mood right now.");
  },
};

function createLocalMoodReading(
  moodValue: ReturnType<typeof moodToApiValue>,
  source: "demo" | "fallback",
) {
  return {
    id: `${source}-mood-${Date.now()}`,
    mood: moodValue,
    type: "mood",
    value: moodValue,
  };
}

function isRecoverableMoodSaveError(error: unknown) {
  if (isBackendServerError(error)) return true;
  if (!(error instanceof Error)) return false;

  const typedError = error as ApiError;
  return (
    error.name === "TypeError" ||
    error.message === "Failed to fetch" ||
    typedError.code === "REQUEST_TIMEOUT" ||
    /endpoint returned no data|placeholder text|expected a record response|expected a list response/i.test(
      error.message,
    )
  );
}

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
