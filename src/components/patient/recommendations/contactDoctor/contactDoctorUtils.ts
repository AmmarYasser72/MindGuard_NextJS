import type { DoctorRecommendation } from "../../../../types/recommendations";

export const matchLabels = {
  matched: "condition match",
  broad: "broad fit",
  "not-matched": "not a match",
};

export function buildMailTo(
  doctor: DoctorRecommendation,
  conditionLabel: string,
  patientEmail?: string,
) {
  const recipient = doctor.email || "";
  const subject = encodeURIComponent(
    `MindGuard appointment request: ${conditionLabel}`,
  );
  const body = encodeURIComponent(
    [
      `Hello ${doctor.displayName},`,
      "",
      `I found your profile through MindGuard because I am looking for support with ${conditionLabel.toLowerCase()}.`,
      `Recommended specialization: ${doctor.specialization}`,
      `Doctor profile ID: ${doctor.id}`,
      patientEmail ? `Patient email: ${patientEmail}` : "",
      "",
      "Please let me know the next available time to talk.",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

export function formatSlotDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
