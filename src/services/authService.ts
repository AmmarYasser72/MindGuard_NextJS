import { storage } from "./storage";
import { request } from "./apiClient";
import { clearSession, getSession, setSession } from "./session";
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

function persistSession(user: AuthUser, token: string | null = "local-demo-token") {
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
  return {
    uid: String(firstValue(data.id, data.uid, data._id, data.sub, fallback.uid, crypto.randomUUID())),
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

function isConnectionError(error: unknown): error is ApiError {
  if (!(error instanceof Error)) return false;
  const typedError = error as ApiError;
  return error.name === "TypeError"
    || error.message === "Failed to fetch"
    || typedError.code === "REQUEST_TIMEOUT";
}

function demoRegisterBody(user: StoredUser) {
  const role = normalizeRole(user.role);
  const cleanName = (user.displayName || user.email).replace(/^Dr\.\s*/i, "");

  return {
    confirmPassword: user.password,
    email: user.email,
    gender: "male",
    licenseNumber: role === "doctor" ? "DEMO-0001" : undefined,
    name: cleanName,
    password: user.password,
    role,
    specialization: role === "doctor" ? "Psychiatry" : undefined,
    yearsOfExperience: role === "doctor" ? 5 : undefined,
  };
}

async function registerDemoWithBackend(user: StoredUser) {
  const auth = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(demoRegisterBody(user)),
  });
  const token = authToken(auth);
  return persistSession(profileFromAuth(auth, user), token);
}

export const authService = {
  getCurrentUser() {
    return getSession()?.user || null;
  },

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const demoUser = findDemoUser(cleanEmail, password);
    const fallbackUser = findLocalUser(cleanEmail, password);

    if (isDemoMode) {
      if (demoUser) {
        return persistSession(removePassword(demoUser));
      }
      if (fallbackUser) {
        return persistSession(removePassword(fallbackUser));
      }
      throw new Error("Invalid email or password");
    }

    try {
      const auth = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const token = authToken(auth);
      const fallback = { email: cleanEmail, role: roleFromEmail(cleanEmail) };
      return persistSession(profileFromAuth(auth, fallback), token);
    } catch (error) {
      const typedError = error as ApiError;
      if (demoUser && typedError.status === 401) {
        try {
          return await registerDemoWithBackend(demoUser);
        } catch (registerError) {
          if (isConnectionError(registerError)) {
            return persistSession(removePassword(demoUser));
          }
          throw new Error(registerError instanceof Error ? registerError.message : "Unable to create the backend demo account");
        }
      }

      if (fallbackUser && isConnectionError(error)) {
        return persistSession(removePassword(fallbackUser));
      }
      if (isConnectionError(error)) {
        throw createConnectionError();
      }
      throw new Error(error instanceof Error ? error.message : "Invalid email or password");
    }
  },

  async register(profile: RegisterProfile) {
    const cleanEmail = profile.email.trim().toLowerCase();
    const body = {
      email: cleanEmail,
      password: profile.password,
      confirmPassword: profile.password,
      name: `${profile.firstName} ${profile.lastName}`,
      role: profile.role,
      gender: profile.gender.toLowerCase(),
      specialization: profile.specialization || undefined,
      licenseNumber: profile.licenseNumber || undefined,
      yearsOfExperience: profile.yearsOfExperience
        ? Number(profile.yearsOfExperience)
        : undefined,
    };
    const fallback = { email: cleanEmail, displayName: body.name, role: profile.role };

    if (isDemoMode) {
      const users = savedUsers();
      if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
        throw new Error("Email already exists");
      }
      return persistSession(createLocalUser(profile, cleanEmail));
    }

    try {
      const auth = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const token = authToken(auth);
      return persistSession(profileFromAuth(auth, fallback), token);
    } catch (error) {
      if (isConnectionError(error)) {
        const users = savedUsers();
        if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
          throw new Error("Email already exists");
        }
        return persistSession(createLocalUser(profile, cleanEmail));
      }
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  },

  signOut() {
    clearSession();
  },
};
