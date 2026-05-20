import { storage } from "./storage";
import type { AuthSession } from "../types/auth";

export const SESSION_KEY = "auth_session";

export function getSession() {
  return storage.get<AuthSession | null>(SESSION_KEY, null);
}

export function setSession(session: AuthSession) {
  storage.set(SESSION_KEY, session);
}

export function clearSession() {
  storage.remove(SESSION_KEY);
}
