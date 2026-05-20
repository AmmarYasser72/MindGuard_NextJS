"use client";

import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "../components/common/Toast";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
