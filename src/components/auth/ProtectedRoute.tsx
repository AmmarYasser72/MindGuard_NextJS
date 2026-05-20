"use client";

import { useEffect } from "react";
import { useRouter } from "../../hooks/useRouter";
import { useAuth } from "../../hooks/useAuth";
import PageLoader from "../common/PageLoader";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles = [] }: ProtectedRouteProps) {
  const { authLoading, user } = useAuth();
  const { navigate } = useRouter();
  const allowedRoles = roles.map((role) => role.toLowerCase());
  const role = user?.role?.toLowerCase();
  const isAllowed = !allowedRoles.length || (role ? allowedRoles.includes(role) : false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAllowed) {
      navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard", { replace: true });
    }
  }, [authLoading, isAllowed, navigate, role, user]);

  if (authLoading || !user || !isAllowed) {
    return <PageLoader message="Checking your session..." />;
  }

  return children;
}
