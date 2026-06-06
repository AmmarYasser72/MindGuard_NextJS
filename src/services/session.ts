import { storage } from "./storage";
import type { AuthSession } from "../types/auth";

export const SESSION_KEY = "auth_session";
export const LOCAL_DEMO_TOKEN = "local-demo-token";
const LOCAL_DEMO_EMAILS = new Set(["patient@demo.com", "doctor@demo.com"]);

export function getSession() {
  return storage.get<AuthSession | null>(SESSION_KEY, null);
}

export function setSession(session: AuthSession) {
  storage.set(SESSION_KEY, session);
}

export function clearSession() {
  storage.remove(SESSION_KEY);
}

export function isLocalDemoSession(session = getSession()) {
  const email = session?.user.email?.trim().toLowerCase();
  return (
    session?.token === LOCAL_DEMO_TOKEN &&
    Boolean(email && LOCAL_DEMO_EMAILS.has(email))
  );
}
