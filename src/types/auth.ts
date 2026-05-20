export type UserRole = "doctor" | "patient" | (string & {});

export type AuthUser = {
  uid: string;
  _id?: string;
  id?: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  password?: string;
};

export type AuthSession = {
  token?: string | null;
  user: AuthUser;
};

export type RegisterProfile = {
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  password: string;
  role: UserRole;
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number | string;
};

export type AuthContextValue = {
  authLoading: boolean;
  register: (profile: RegisterProfile) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => void;
  user: AuthUser | null;
};
