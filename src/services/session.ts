import { storage } from "./storage";
import type { AuthSession } from "../types/auth";

export const SESSION_KEY = "auth_session";
export const LOCAL_DEMO_TOKEN = "local-demo-token";
export const SESSION_CHANGE_EVENT = "mindguard:session-changed";
const LOCAL_DEMO_EMAILS = new Set(["patient@demo.com", "doctor@demo.com"]);

function notifySessionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function getSession() {
  return storage.get<AuthSession | null>(SESSION_KEY, null);
}

export function hasUsableSession(session = getSession()) {
  if (!session?.user) return false;
  if (isLocalDemoSession(session)) return true;
  return Boolean(session.token?.trim());
}

export function setSession(session: AuthSession) {
  storage.set(SESSION_KEY, session);
  notifySessionChange();
}

export function clearSession() {
  storage.remove(SESSION_KEY);
  notifySessionChange();
}

export function isLocalDemoSession(session = getSession()) {
  const email = session?.user.email?.trim().toLowerCase();
  return (
    session?.token === LOCAL_DEMO_TOKEN &&
    Boolean(email && LOCAL_DEMO_EMAILS.has(email))
  );
}
