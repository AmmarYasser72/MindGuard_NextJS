export const SLOT_CHANGE_EVENT = "mindguard:slots-changed";
export const SLOT_OVERRIDE_STORAGE_KEY = "slot_overrides";
export const DEMO_SLOT_STORAGE_KEY = "demo_slots";

export function notifySlotChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SLOT_CHANGE_EVENT));
}

export function isSlotStorageEvent(event: StorageEvent) {
  const key = event.key || "";
  return (
    key.endsWith(SLOT_OVERRIDE_STORAGE_KEY) ||
    key.endsWith(DEMO_SLOT_STORAGE_KEY)
  );
}
