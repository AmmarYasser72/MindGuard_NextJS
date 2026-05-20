import type { ApiError, ApiRecord } from "../types/api";

export function createServiceError(message: string, details: unknown = null) {
  const error = new Error(message) as ApiError;
  error.details = details;
  return error;
}

export function ensureApiData(response: unknown, label: string): unknown {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw createServiceError(`${label} returned an invalid response.`, response);
  }

  const record = response as ApiRecord;

  if (!Object.prototype.hasOwnProperty.call(record, "data")) {
    throw createServiceError(`${label} endpoint returned no data yet.`, response);
  }

  if (typeof record.data === "string") {
    throw createServiceError(`${label} endpoint returned placeholder text instead of data.`, response);
  }

  return record.data;
}

export function ensureArrayData<T = unknown>(response: unknown, label: string): T[] {
  const data = ensureApiData(response, label);
  if (!Array.isArray(data)) {
    throw createServiceError(`${label} expected a list response.`, response);
  }
  return data as T[];
}

export function ensureObjectData<T extends ApiRecord = ApiRecord>(response: unknown, label: string): T {
  const data = ensureApiData(response, label);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createServiceError(`${label} expected a record response.`, response);
  }
  return data as T;
}

function hasFieldValue(record: ApiRecord, field: string) {
  const value = field.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return (current as ApiRecord)[key];
  }, record);
  return value !== undefined && value !== null && value !== "";
}

export function ensureRecordHasAnyField<T extends ApiRecord = ApiRecord>(record: T, label: string, fields: string[]): T {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw createServiceError(`${label} expected a record response.`, record);
  }

  if (!fields.some((field) => hasFieldValue(record, field))) {
    throw createServiceError(`${label} endpoint returned no usable record data yet.`, record);
  }

  return record;
}

export function ensureArrayRecords<T extends ApiRecord = ApiRecord>(response: unknown, label: string, fields: string[]): T[] {
  const data = ensureArrayData<T>(response, label);
  data.forEach((record, index) => {
    ensureRecordHasAnyField(record, `${label} item ${index + 1}`, fields);
  });
  return data;
}

export function shortId(value: unknown, fallback = "unknown") {
  const text = String(value || fallback);
  return text.length > 8 ? text.slice(-6) : text;
}
