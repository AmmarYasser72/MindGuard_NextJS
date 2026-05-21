import { isLocalDemoSession } from "../services/session";

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function shouldUseDemoData() {
  return isDemoMode || isLocalDemoSession();
}
