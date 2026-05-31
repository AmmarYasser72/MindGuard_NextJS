"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import DateField from "../../components/auth/DateField";
import AuthProfileHeader from "../../components/auth/AuthProfileHeader";
import AuthRoleCard from "../../components/auth/AuthRoleCard";
import NameFields from "../../components/auth/NameFields";
import PasswordConfirmationFields from "../../components/auth/PasswordConfirmationFields";
import SegmentedChoiceField from "../../components/auth/SegmentedChoiceField";
import SignupFormCard from "../../components/auth/SignupFormCard";
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
    <main className="auth-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-3xl gap-6">
        <AuthProfileHeader
          backLabel="Back to sign in"
          description="Start your wellness journey with a secure profile."
          eyebrow="Patient account"
          icon="user-plus"
          onBack={() => navigate("/login")}
          title="Create Account"
        />

        <SignupFormCard
          description="Keep these details accurate for better care matching."
          error={error}
          footerActionLabel="Sign In"
          footerPrompt="Already have an account?"
          heading="Personal details"
          icon="user-check"
          iconColor="#6366f1"
          iconSurfaceClassName="bg-violet-50"
          onFooterAction={() => navigate("/login")}
          onSubmit={onSubmit}
        >
            <NameFields
              firstName={form.firstName}
              lastName={form.lastName}
              onChange={update}
              disabled={authLoading}
            />
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
            <PasswordConfirmationFields
              confirmPassword={form.confirmPassword}
              password={form.password}
              onChange={update}
              disabled={authLoading}
            />
            <SubmitButton loading={authLoading}>
              Create Account
              <Icon name="arrow-right" size={18} color="#fff" />
            </SubmitButton>
        </SignupFormCard>

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
