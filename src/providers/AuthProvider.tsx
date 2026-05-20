"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import { authService } from "../services/authService";
import type { AuthUser, RegisterProfile } from "../types/auth";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    window.queueMicrotask(() => {
      if (!isMounted) return;
      setUser(authService.getCurrentUser());
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const nextUser = await authService.signIn(email, password);
      setUser(nextUser);
      return nextUser;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (profile: RegisterProfile) => {
    setAuthLoading(true);
    try {
      const nextUser = await authService.register(profile);
      setUser(nextUser);
      return nextUser;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    authLoading,
    register,
    signIn,
    signOut,
    user,
  }), [authLoading, register, signIn, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
