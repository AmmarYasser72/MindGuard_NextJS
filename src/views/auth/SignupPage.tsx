"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import Card from "../../components/common/Card";
import DateField from "../../components/auth/DateField";
import AuthProfileHeader from "../../components/auth/AuthProfileHeader";
import AuthRoleCard from "../../components/auth/AuthRoleCard";
import ErrorBanner from "../../components/auth/ErrorBanner";
import PasswordField from "../../components/auth/PasswordField";
import SegmentedChoiceField from "../../components/auth/SegmentedChoiceField";
import SubmitButton from "../../components/auth/SubmitButton";
import TextField from "../../components/auth/TextField";
import { genderChoices } from "../../data/authFormData";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import { validatePatientSignup } from "../../utils/authValidation";
import type { FormEvent } from "react";
import type { PatientSignupForm } from "../../utils/authValidation";

const initialForm: PatientSignupForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  gender: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const { register, authLoading } = useAuth();
  const { navigate } = useRouter();

  function update<Key extends keyof PatientSignupForm>(key: Key, value: PatientSignupForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validatePatientSignup(form);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    try {
      await register({ ...form, role: "patient" });
      navigate("/patient-dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to create account");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbf9_0%,#f8fafc_52%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-3xl gap-6">
        <AuthProfileHeader
          backLabel="Back to sign in"
          description="Start your wellness journey with a secure profile."
          eyebrow="Patient account"
          icon="user-plus"
          onBack={() => navigate("/login")}
          title="Create Account"
        />

        <Card className="p-6 sm:p-7">
          <form className="grid gap-5" onSubmit={onSubmit}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Personal details</h2>
                <p className="mt-1 text-sm text-slate-500">Keep these details accurate for better care matching.</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50">
                <Icon name="user-check" size={22} color="#6366f1" />
              </span>
            </div>
            <ErrorBanner error={error} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="First Name"
                icon="user"
                name="given-name"
                placeholder="ammar"
                value={form.firstName}
                onChange={(value) => update("firstName", value)}
                autoComplete="given-name"
                disabled={authLoading}
              />
              <TextField
                label="Last Name"
                icon="user"
                name="family-name"
                placeholder="yasser"
                value={form.lastName}
                onChange={(value) => update("lastName", value)}
                autoComplete="family-name"
                disabled={authLoading}
              />
            </div>
            <DateField
              label="Date of Birth"
              name="bday"
              value={form.dateOfBirth}
              onChange={(value) => update("dateOfBirth", value)}
              autoComplete="bday"
              disabled={authLoading}
            />
            <TextField
              label="Email Address"
              icon="mail"
              type="email"
              name="email"
              placeholder="ammaryasser@gmail.com"
              value={form.email}
              onChange={(value) => update("email", value)}
              autoComplete="email"
              disabled={authLoading}
            />
            <SegmentedChoiceField
              label="Gender"
              value={form.gender}
              choices={genderChoices}
              onChange={(value) => update("gender", value)}
              disabled={authLoading}
            />
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(value) => update("password", value)}
              autoComplete="new-password"
              disabled={authLoading}
            />
            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={(value) => update("confirmPassword", value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={authLoading}
            />
            <SubmitButton loading={authLoading}>
              Create Account
              <Icon name="arrow-right" size={18} color="#fff" />
            </SubmitButton>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button className="font-bold text-[var(--primary)]" type="button" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </p>
        </Card>

        <AuthRoleCard
          icon="stethoscope"
          onClick={() => navigate("/doctor-signup")}
          subtitle="Sign up as a Doctor"
          title="Are you a healthcare professional?"
          tone="doctor"
        />
      </section>
    </main>
  );
}
