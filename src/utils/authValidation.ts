export type PatientSignupForm = {
  confirmPassword: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  password: string;
};

export type DoctorSignupForm = PatientSignupForm & {
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: string;
};

export function validatePatientSignup(form: PatientSignupForm) {
  if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2)
    return "First and last name are required";
  if (!form.dateOfBirth) return "Please select your date of birth";
  if (!form.email.includes("@")) return "Please enter a valid email";
  if (!form.gender) return "Please select gender";
  if (form.password.length < 6) return "Password must be at least 6 characters";
  if (form.password !== form.confirmPassword) return "Passwords do not match";
  return "";
}

export function validateDoctorSignup(form: DoctorSignupForm) {
  const base = validatePatientSignup(form);
  if (base) return base;
  if (!form.specialization) return "Please select your specialization";
  if (!form.licenseNumber.trim()) return "License number is required";
  if (!form.yearsOfExperience || Number.isNaN(Number(form.yearsOfExperience)))
    return "Enter a valid number";
  return "";
}
