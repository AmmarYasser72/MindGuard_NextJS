"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import Card from "../../components/common/Card";
import AuthProfileHeader from "../../components/auth/AuthProfileHeader";
import AuthRoleCard from "../../components/auth/AuthRoleCard";
import ErrorBanner from "../../components/auth/ErrorBanner";
import PasswordField from "../../components/auth/PasswordField";
import SelectField from "../../components/auth/SelectField";
import SubmitButton from "../../components/auth/SubmitButton";
import TextField from "../../components/auth/TextField";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import { validatePatient } from "./SignupPage";

const specializations = [
  "Psychiatry",
  "Clinical Psychology",
  "Counseling Psychology",
  "Neuropsychology",
  "Child & Adolescent Psychology",
  "Health Psychology",
  "Behavioral Medicine",
  "Addiction Medicine",
  "Sleep Medicine",
  "Geriatric Psychiatry",
  "Forensic Psychology",
  "Sports Psychology",
  "Occupational Therapy",
  "Social Work",
  "Marriage & Family Therapy",
  "General Practice",
  "Internal Medicine",
  "Neurology",
  "Other",
];

const initialForm = {
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

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const validation = validateDoctor(form);
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4fbf9_0%,#f8fafc_52%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
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

        <Card className="p-6 sm:p-7">
          <form className="grid gap-5" onSubmit={onSubmit}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Professional details</h2>
                <p className="mt-1 text-sm text-slate-500">Your profile helps patients find the right support.</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50">
                <Icon name="badge-check" size={22} color="#059669" />
              </span>
            </div>
            <ErrorBanner error={error} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="First Name"
                icon="user"
                placeholder="ammar"
                value={form.firstName}
                onChange={(value) => update("firstName", value)}
                autoComplete="given-name"
                disabled={authLoading}
              />
              <TextField
                label="Last Name"
                icon="user"
                placeholder="yasser"
                value={form.lastName}
                onChange={(value) => update("lastName", value)}
                autoComplete="family-name"
                disabled={authLoading}
              />
            </div>
            <TextField
              label="Date of Birth"
              icon="calendar"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) => update("dateOfBirth", value)}
              autoComplete="bday"
              disabled={authLoading}
            />
            <SelectField
              label="Gender"
              icon="user"
              value={form.gender}
              placeholder="Select gender"
              onChange={(value) => update("gender", value)}
              disabled={authLoading}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </SelectField>
            <SelectField
              label="Specialization"
              icon="brain"
              value={form.specialization}
              placeholder="Select your specialization"
              onChange={(value) => update("specialization", value)}
              disabled={authLoading}
            >
              {specializations.map((item) => <option key={item} value={item}>{item}</option>)}
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
            <SubmitButton loading={authLoading} tone="green">
              Create Doctor Account
              <Icon name="arrow-right" size={18} color="#fff" />
            </SubmitButton>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button className="font-bold text-emerald-600" type="button" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </p>
        </Card>

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

function validateDoctor(form) {
  const base = validatePatient(form);
  if (base) return base;
  if (!form.specialization) return "Please select your specialization";
  if (!form.licenseNumber.trim()) return "License number is required";
  if (!form.yearsOfExperience || Number.isNaN(Number(form.yearsOfExperience))) return "Enter a valid number";
  return "";
}
