"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import DateField from "../../components/auth/DateField";
import AuthProfileHeader from "../../components/auth/AuthProfileHeader";
import AuthRoleCard from "../../components/auth/AuthRoleCard";
import NameFields from "../../components/auth/NameFields";
import PasswordConfirmationFields from "../../components/auth/PasswordConfirmationFields";
import SegmentedChoiceField from "../../components/auth/SegmentedChoiceField";
import SelectField from "../../components/auth/SelectField";
import SignupFormCard from "../../components/auth/SignupFormCard";
import SubmitButton from "../../components/auth/SubmitButton";
import TextField from "../../components/auth/TextField";
import { doctorSpecializations, genderChoices } from "../../data/authFormData";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import { validateDoctorSignup } from "../../utils/authValidation";
import type { FormEvent } from "react";
import type { DoctorSignupForm } from "../../utils/authValidation";

const initialForm: DoctorSignupForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  specialization: "",
  licenseNumber: "",
  yearsOfExperience: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function DoctorSignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const { register, authLoading } = useAuth();
  const { navigate } = useRouter();

  function update<Key extends keyof DoctorSignupForm>(key: Key, value: DoctorSignupForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateDoctorSignup(form);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    try {
      await register({ ...form, role: "doctor" });
      navigate("/doctor-dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to create doctor account");
    }
  }

  return (
    <main className="auth-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-3xl gap-6">
        <AuthProfileHeader
          backLabel="Back to patient signup"
          badge={{ icon: "badge-check", label: "Healthcare Professional Account" }}
          description="Join MindGuard as a healthcare professional."
          eyebrow="Doctor account"
          icon="stethoscope"
          onBack={() => navigate("/signup")}
          title="Doctor Registration"
          tone="green"
        />

        <SignupFormCard
          description="Your profile helps patients find the right support."
          error={error}
          footerActionClassName="text-emerald-600"
          footerActionLabel="Sign In"
          footerPrompt="Already have an account?"
          heading="Professional details"
          icon="badge-check"
          iconColor="#059669"
          iconSurfaceClassName="bg-emerald-50"
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
              value={form.dateOfBirth}
              onChange={(value) => update("dateOfBirth", value)}
              autoComplete="bday"
              disabled={authLoading}
            />
            <SegmentedChoiceField
              label="Gender"
              value={form.gender}
              choices={genderChoices}
              onChange={(value) => update("gender", value)}
              disabled={authLoading}
              tone="emerald"
            />
            <SelectField
              label="Specialization"
              icon="brain"
              value={form.specialization}
              placeholder="Select your specialization"
              onChange={(value) => update("specialization", value)}
              disabled={authLoading}
            >
              {doctorSpecializations.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectField>
            <TextField
              label="License Number"
              icon="badge"
              placeholder="Enter your license number"
              value={form.licenseNumber}
              onChange={(value) => update("licenseNumber", value)}
              autoComplete="off"
              disabled={authLoading}
            />
            <TextField
              label="Years of Experience"
              icon="briefcase-business"
              type="number"
              placeholder="e.g 5"
              value={form.yearsOfExperience}
              onChange={(value) => update("yearsOfExperience", value)}
              min="0"
              disabled={authLoading}
            />
            <TextField
              label="Professional Email"
              icon="mail"
              type="email"
              placeholder="Dr.ammar@gmail.com"
              value={form.email}
              onChange={(value) => update("email", value)}
              autoComplete="email"
              disabled={authLoading}
            />
            <PasswordConfirmationFields
              confirmPassword={form.confirmPassword}
              password={form.password}
              onChange={update}
              disabled={authLoading}
            />
            <SubmitButton loading={authLoading} tone="green">
              Create Doctor Account
              <Icon name="arrow-right" size={18} color="#fff" />
            </SubmitButton>
        </SignupFormCard>

        <AuthRoleCard
          icon="user"
          onClick={() => navigate("/signup")}
          subtitle="Sign up as a Patient"
          title="Not a healthcare professional?"
          tone="patient"
        />
      </section>
    </main>
  );
}
