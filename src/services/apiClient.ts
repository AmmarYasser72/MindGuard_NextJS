import { getSession } from "./session";
import type { ApiError, RequestOptions } from "../types/api";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const DEFAULT_TIMEOUT_MS = 10000;

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export const API_BASE_URL = trimTrailingSlash(RAW_API_BASE_URL || "/api");

function createHttpError(
  message: string,
  status: number,
  data: unknown = null,
) {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function normalizeToken(token?: string | null) {
  if (!token) return null;
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}

export function getAuthToken() {
  return normalizeToken(getSession()?.token || "");
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const {
    auth = false,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...fetchOptions
  } = options;
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const token = auth ? getAuthToken() : null;

  try {
    const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { authorization: token } : {}),
        ...(headers || {}),
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw createHttpError(
        data.message || data.error || "Request failed",
        response.status,
        data,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError = new Error("Request timed out") as ApiError;
      timeoutError.code = "REQUEST_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timer);
  }
}
