"use client";

import { createContext, useContext } from "react";
import type { AuthContextValue } from "../types/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthContext");
  }
  return value;
}
