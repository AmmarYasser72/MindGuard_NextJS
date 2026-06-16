import type { AuthUser } from "../types/auth";

function cleanIdentityValue(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeEmail(value: unknown) {
  return cleanIdentityValue(value).toLowerCase();
}

export function getPatientIdentityKeys(
  user?: Partial<AuthUser> | null,
  fallbackEmail?: string,
) {
  const keys = [
    normalizeEmail(user?.email),
    cleanIdentityValue(user?.uid),
    cleanIdentityValue(user?.id),
    cleanIdentityValue(user?._id),
    normalizeEmail(fallbackEmail),
  ].filter(Boolean);

  return Array.from(new Set(keys.length ? keys : ["guest-patient"]));
}

export function getPrimaryPatientIdentityKey(
  user?: Partial<AuthUser> | null,
  fallbackEmail?: string,
) {
  return getPatientIdentityKeys(user, fallbackEmail)[0];
}
