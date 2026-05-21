"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import AuthLogo from "../../components/auth/AuthLogo";
import ErrorBanner from "../../components/auth/ErrorBanner";
import PasswordField from "../../components/auth/PasswordField";
import TextField from "../../components/auth/TextField";
import { isDemoMode } from "../../config/demoMode";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import type { FormEvent } from "react";
import type { AuthUser } from "../../types/auth";

type SignInCredentials = {
  email: string;
  password: string;
};

type DemoAccount = SignInCredentials & {
  icon: string;
  title: string;
};

const demoAccounts: DemoAccount[] = [
  { title: "Patient Account", email: "patient@demo.com", password: "demo123", icon: "user" },
  { title: "Doctor Account", email: "doctor@demo.com", password: "demo123", icon: "stethoscope" },
];

function dashboardPath(user: AuthUser) {
  return user.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard";
}

export default function SignInPage() {
  const [form, setForm] = useState<SignInCredentials>({ email: "", password: "" });
  const [error, setError] = useState("");
  const { signIn, authLoading } = useAuth();
  const { navigate } = useRouter();

  function update<Key extends keyof SignInCredentials>(key: Key, value: SignInCredentials[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitCredentials(credentials: SignInCredentials) {
    setError("");
    const cleanEmail = credentials.email.trim();
    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const user = await signIn(cleanEmail, credentials.password);
      navigate(dashboardPath(user));
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to sign in");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCredentials(form);
  }

  function selectDemoAccount(account: DemoAccount) {
    const credentials = { email: account.email, password: account.password };
    setForm(credentials);
    submitCredentials(credentials);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#edf7f5_0%,#f8fafc_48%,#ffffff_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <section className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,480px)]">
        <div className="grid min-h-[560px] content-center gap-5 rounded-[24px] bg-[linear-gradient(135deg,#0f766e_0%,#264653_58%,#4f46e5_100%)] p-8 text-white shadow-[0_24px_60px_rgba(15,118,110,0.18)] sm:p-12">
          <AuthLogo />
          <span className="text-xs font-extrabold uppercase text-white/70">Mind Guard</span>
          <h1 className="max-w-xl text-[clamp(40px,7vw,68px)] font-bold leading-[0.95]">Welcome back</h1>
          <p className="max-w-md text-lg leading-7 text-white/80">Sign in to continue your mental wellness care.</p>
          <div className="mt-3 grid w-full max-w-md grid-cols-2 gap-3" aria-label="Sign in benefits">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 text-sm font-extrabold">
              <Icon name="timer" size={18} color="#5eead4" />
              Fast Recovery
            </span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 text-sm font-extrabold">
              <Icon name="shield-check" size={18} color="#c4b5fd" />
              Secure session
            </span>
          </div>
        </div>

        <div className="grid gap-5">
          <Card className="rounded-xl border-slate-200/95 p-6 text-left shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:p-7">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="mb-1 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[22px] font-bold text-slate-900">Sign in</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isDemoMode ? "Hosted demo mode is active. Use a demo account or create a local browser-only account." : "Enter your email and password"}
                  </p>
                </div>
              </div>
              <ErrorBanner error={error} />
              <TextField
                label="Email"
                icon="mail"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(value) => update("email", value)}
                autoComplete="email"
                disabled={authLoading}
              />
              <PasswordField
                label="Password"
                value={form.password}
                onChange={(value) => update("password", value)}
                autoComplete="current-password"
                disabled={authLoading}
              />
              <Button type="submit" className="mt-1 min-h-[52px] w-full rounded-xl" disabled={authLoading}>
                {authLoading ? (
                  <>
                    <Icon name="loader-circle" size={18} color="#fff" className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <Icon name="arrow-right" size={18} color="#fff" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <button className="font-bold text-[var(--primary)]" type="button" onClick={() => navigate("/signup")}>
                Sign up
              </button>
            </p>
          </Card>

          <Card className="rounded-xl border-[#d8e8f8] bg-[#eef6ff] p-5 shadow-[0_18px_36px_rgba(59,130,246,0.08)]">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm shadow-blue-950/5">
                <Icon name="flask-conical" size={18} color="#3b82f6" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-950">Demo Accounts</h2>
                <p className="text-sm text-slate-500">One-click access for testing</p>
              </div>
            </div>
            <div className="grid gap-3">
              {demoAccounts.map((account) => (
                <button
                  type="button"
                  className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-blue-100 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-65"
                  key={account.email}
                  onClick={() => selectDemoAccount(account)}
                  disabled={authLoading}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
                    <Icon name={account.icon} size={20} color="#3b82f6" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-bold text-slate-900">{account.title}</strong>
                    <small className="mt-1 block font-mono text-xs text-[var(--primary)]">{account.email}</small>
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Use</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
