import { storage } from "./storage";
import { request } from "./apiClient";
import { LOCAL_DEMO_TOKEN, clearSession, getSession, setSession } from "./session";
import { saveSignedUpDoctor } from "./localDoctorDirectory";
import { isDemoMode } from "../config/demoMode";
import type { ApiError, ApiRecord } from "../types/api";
import type { AuthUser, RegisterProfile, UserRole } from "../types/auth";

const USERS_KEY = "auth_users";

type StoredUser = AuthUser & {
  email: string;
  password: string;
};

const demoUsers: StoredUser[] = [
  {
    uid: "demo-patient-001",
    email: "patient@demo.com",
    password: "demo123",
    displayName: "Demo Patient",
    role: "patient",
  },
  {
    uid: "demo-doctor-001",
    email: "doctor@demo.com",
    password: "demo123",
    displayName: "Demo Doctor",
    role: "doctor",
  },
];

function savedUsers(): StoredUser[] {
  const users = storage.get<StoredUser[]>(USERS_KEY, []);
  const emails = new Set(users.map((user) => user.email));
  return [...users, ...demoUsers.filter((user) => !emails.has(user.email))];
}

function removePassword(user: StoredUser): AuthUser {
  return {
    _id: user._id,
    displayName: user.displayName,
    email: user.email,
    id: user.id,
    role: user.role,
    uid: user.uid,
  };
}

function findLocalUser(email: string, password: string) {
  return savedUsers().find(
    (item) => item.email.toLowerCase() === email && item.password === password,
  );
}

function findDemoUser(email: string, password: string) {
  return demoUsers.find(
    (item) => item.email.toLowerCase() === email && item.password === password,
  );
}

function persistSession(user: AuthUser, token: string | null = LOCAL_DEMO_TOKEN) {
  setSession({ token, user });
  return user;
}

function roleFromEmail(email: string): UserRole {
  return email.includes("doctor") || email.startsWith("dr.") ? "doctor" : "patient";
}

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ApiRecord : {};
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function authToken(data: unknown): string | null {
  const record = asRecord(data);
  const nested = asRecord(record.data);
  return stringValue(record.token)
    || stringValue(record.accessToken)
    || stringValue(record.access_token)
    || stringValue(record.data)
    || stringValue(nested.token)
    || stringValue(nested.accessToken)
    || stringValue(nested.access_token)
    || null;
}

function normalizeRole(role: unknown, fallback: UserRole = "patient"): UserRole {
  if (typeof role !== "string" || !role.trim()) return fallback;
  return role.toLowerCase() as UserRole;
}

function firstValue(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function firstObject(...values: unknown[]) {
  return values.find((value) => value && typeof value === "object" && !Array.isArray(value)) as ApiRecord | undefined;
}

function decodeJwtPayload(token: string | null) {
  const rawToken = authToken({ token });
  const encodedToken = rawToken?.toLowerCase().startsWith("bearer ")
    ? rawToken.slice(7).trim()
    : rawToken;
  if (!encodedToken) return null;

  const payload = encodedToken.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded)) as ApiRecord;
  } catch {
    return null;
  }
}

function normalizeProfile(data: ApiRecord, fallback: Partial<AuthUser> = {}): AuthUser {
  const uid = String(firstValue(data.id, data.uid, data._id, data.sub, fallback.uid, fallback.id, fallback._id, crypto.randomUUID()));

  return {
    _id: uid,
    id: uid,
    uid,
    email: String(firstValue(data.email, fallback.email, "")),
    displayName: String(firstValue(
      data.name,
      data.displayName,
      data.fullName,
      fallback.displayName,
      fallback.email,
      "MindGuard User",
    )),
    role: normalizeRole(
      firstValue(data.role, data.userRole, data.accountType, data.type),
      fallback.role || "patient",
    ),
  };
}

function profilePayload(data: unknown) {
  if (!data || typeof data !== "object") return {};
  const record = data as ApiRecord;
  const nested = asRecord(record.data);
  return firstObject(
    record.user,
    record.profile,
    record.doctor,
    record.patient,
    nested.user,
    nested.profile,
    nested.doctor,
    nested.patient,
    record.data,
    record,
  ) || {};
}

function profileFromAuth(data: unknown, fallback: Partial<AuthUser>) {
  const token = authToken(data);
  return normalizeProfile({
    ...(decodeJwtPayload(token) || {}),
    ...profilePayload(data),
  }, fallback);
}

function createConnectionError() {
  return new Error("Couldn't reach the backend. Make sure your local backend server is running.");
}

function createBackendAuthTokenError(action: "sign in" | "sign up") {
  return new Error(
    `The backend accepted the ${action} request but did not return a usable auth token. ` +
    "Make sure the running backend has USER_ACCESS_JWT_SECRET set to the same value as JWT_SECRET, then restart the backend.",
  );
}

function createLocalUser(profile: RegisterProfile, cleanEmail: string) {
  const user: StoredUser = {
    uid: crypto.randomUUID(),
    email: cleanEmail,
    password: profile.password,
    displayName: profile.role === "doctor"
      ? `Dr. ${profile.firstName} ${profile.lastName}`
      : `${profile.firstName} ${profile.lastName}`,
    role: profile.role,
  };
  const stored = storage.get<StoredUser[]>(USERS_KEY, []);
  storage.set(USERS_KEY, [...stored, user]);
  return removePassword(user);
}

function persistRegisteredProfile(profile: RegisterProfile, user: AuthUser, token: string | null = LOCAL_DEMO_TOKEN) {
  saveSignedUpDoctor(profile, user);
  return persistSession(user, token);
}

function isConnectionError(error: unknown): error is ApiError {
  if (!(error instanceof Error)) return false;
  const typedError = error as ApiError;
  return error.name === "TypeError"
    || error.message === "Failed to fetch"
    || typedError.code === "REQUEST_TIMEOUT";
}

function isInternalServerError(error: unknown): error is ApiError {
  return error instanceof Error && (error as ApiError).status === 500;
}

async function remoteSignIn(cleanEmail: string, password: string, fallback: Partial<AuthUser>) {
  const auth = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: cleanEmail, password, rememberMe: true }),
  });
  const token = authToken(auth);

  if (!token) {
    throw createBackendAuthTokenError("sign in");
  }

  return persistSession(profileFromAuth(auth, fallback), token);
}

export const authService = {
  getCurrentUser() {
    return getSession()?.user || null;
  },

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const demoUser = findDemoUser(cleanEmail, password);
    const fallbackUser = findLocalUser(cleanEmail, password);

    if (demoUser) {
      return persistSession(removePassword(demoUser), LOCAL_DEMO_TOKEN);
    }

    if (isDemoMode) {
      if (fallbackUser) {
        return persistSession(removePassword(fallbackUser));
      }
      throw new Error("Invalid email or password");
    }

    try {
      return await remoteSignIn(cleanEmail, password, { email: cleanEmail, role: roleFromEmail(cleanEmail) });
    } catch (error) {
      if (fallbackUser && isConnectionError(error)) {
        return persistSession(removePassword(fallbackUser));
      }
      if (isConnectionError(error)) {
        throw createConnectionError();
      }
      if (isInternalServerError(error)) {
        throw createBackendAuthTokenError("sign in");
      }
      throw new Error(error instanceof Error ? error.message : "Invalid email or password");
    }
  },

  async register(profile: RegisterProfile) {
    const cleanEmail = profile.email.trim().toLowerCase();
    const displayName = `${profile.firstName} ${profile.lastName}`;
    const body: ApiRecord = {
      email: cleanEmail,
      password: profile.password,
      confirmPassword: profile.password,
      name: displayName,
      role: profile.role,
      gender: profile.gender.toLowerCase(),
    };

    if (profile.role === "doctor") {
      body.specialization = profile.specialization;
    }

    const fallback = { email: cleanEmail, displayName, role: profile.role };

    if (isDemoMode) {
      const users = savedUsers();
      if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
        throw new Error("Email already exists");
      }
      return persistRegisteredProfile(profile, createLocalUser(profile, cleanEmail));
    }

    try {
      const auth = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const token = authToken(auth);
      if (!token) {
        throw createBackendAuthTokenError("sign up");
      }
      return persistRegisteredProfile(profile, profileFromAuth(auth, fallback), token);
    } catch (error) {
      if (isConnectionError(error)) {
        const users = savedUsers();
        if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
          throw new Error("Email already exists");
        }
        return persistRegisteredProfile(profile, createLocalUser(profile, cleanEmail));
      }
      if (isInternalServerError(error)) {
        try {
          const nextUser = await remoteSignIn(cleanEmail, profile.password, fallback);
          saveSignedUpDoctor(profile, nextUser);
          return nextUser;
        } catch {
          throw createBackendAuthTokenError("sign up");
        }
      }
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  },

  signOut() {
    clearSession();
  },
};
