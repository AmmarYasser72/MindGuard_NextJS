"use client";

import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "../components/common/Toast";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
