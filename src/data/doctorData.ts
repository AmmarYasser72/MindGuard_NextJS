const now = () => new Date();

export const severityLabels = {
  critical: "Critical",
  moderate: "Moderate",
  mild: "Mild",
  normal: "Normal",
};

export const conditionLabels = {
  anxiety: "Anxiety-dominant",
  stress: "Stress-dominant",
  depression: "Depression-dominant",
  mixed: "Mixed",
  none: "No significant condition",
};

function hoursAgo(hours) {
  return new Date(now().getTime() - hours * 60 * 60 * 1000);
}

function daysAgo(days) {
  return new Date(now().getTime() - days * 24 * 60 * 60 * 1000);
}

function moodTrend(current, previous) {
  return Array.from({ length: 7 }, (_, index) => previous + ((current - previous) * index) / 6);
}

const seedPatients = [
  {
    id: "patient-001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    age: 28,
    gender: "M",
    lastSeen: hoursAgo(2),
    severity: "critical",
    condition: "anxiety",
    mood: 42,
    hrv: 45,
    hrvDeviation: -15,
    sleep: 0.62,
    journal: "Feeling overwhelmed with work deadlines and family responsibilities. The anxiety is getting harder to manage.",
    trend: moodTrend(42, 58),
  },
  {
    id: "patient-002",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    age: 34,
    gender: "F",
    lastSeen: hoursAgo(5),
    severity: "moderate",
    condition: "depression",
    mood: 55,
    hrv: 52,
    hrvDeviation: -8,
    sleep: 0.68,
    journal: "Struggling with motivation today. Everything feels heavy.",
    trend: moodTrend(55, 60),
  },
  {
    id: "patient-003",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@example.com",
    age: 41,
    gender: "F",
    lastSeen: hoursAgo(0.5),
    severity: "critical",
    condition: "stress",
    mood: 22,
    hrv: 28,
    hrvDeviation: -45,
    sleep: 0.55,
    journal: "The stress from work is unbearable. Can't sleep, can't focus.",
    trend: moodTrend(22, 35),
  },
];

const moderateNames = [
  ["James", "Wilson"],
  ["Olivia", "Martinez"],
  ["David", "Anderson"],
  ["Sophia", "Taylor"],
  ["William", "Brown"],
  ["Isabella", "Garcia"],
  ["Benjamin", "Davis"],
  ["Mia", "Miller"],
];

const mildNames = [
  ["Alexander", "Moore"],
  ["Charlotte", "Jackson"],
  ["Daniel", "White"],
  ["Amelia", "Harris"],
  ["Matthew", "Clark"],
  ["Harper", "Lewis"],
  ["Joseph", "Robinson"],
  ["Evelyn", "Walker"],
  ["Andrew", "Hall"],
  ["Abigail", "Allen"],
  ["Joshua", "Young"],
  ["Emily", "King"],
  ["Christopher", "Wright"],
  ["Madison", "Lopez"],
  ["Anthony", "Hill"],
];

const normalNames = [
  ["Ryan", "Scott"],
  ["Grace", "Green"],
  ["Nathan", "Adams"],
  ["Lily", "Baker"],
  ["Tyler", "Nelson"],
  ["Chloe", "Carter"],
  ["Brandon", "Mitchell"],
  ["Zoe", "Perez"],
  ["Justin", "Roberts"],
  ["Natalie", "Turner"],
  ["Kevin", "Phillips"],
  ["Hannah", "Campbell"],
  ["Eric", "Parker"],
  ["Avery", "Evans"],
  ["Jordan", "Edwards"],
  ["Samantha", "Collins"],
  ["Kyle", "Stewart"],
  ["Lauren", "Sanchez"],
  ["Adam", "Morris"],
  ["Brianna", "Rogers"],
  ["Connor", "Reed"],
];

function generatedPatients(names, offset, severity, baseMood) {
  const conditions = ["anxiety", "stress", "depression", "mixed", "none"];
  return names.map(([firstName, lastName], index) => {
    const mood = baseMood + index * (severity === "normal" ? 1 : 2);
    return {
      id: `patient-${String(index + offset).padStart(3, "0")}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      age: 26 + (index % 18),
      gender: index % 2 === 0 ? "M" : "F",
      lastSeen: severity === "normal" ? daysAgo((index % 14) + 1) : hoursAgo(index + 1),
      severity,
      condition: conditions[index % conditions.length],
      mood,
      hrv: 40 + index * 1.7,
      hrvDeviation: severity === "normal" ? 2 + index * 0.3 : -10 + index * 1.5,
      sleep: severity === "normal" ? 0.8 + index * 0.004 : 0.7 + index * 0.01,
      journal: index % 3 === 0 ? "Feeling stable this week." : null,
      trend: moodTrend(mood, mood + (index % 2 === 0 ? 5 : -3)),
    };
  });
}

export const patients = [
  ...seedPatients,
  ...generatedPatients(moderateNames, 4, "moderate", 45),
  ...generatedPatients(mildNames, 12, "mild", 60),
  ...generatedPatients(normalNames, 27, "normal", 75),
];

export const doctorKpis = {
  totalPatients: 47,
  activePatientsToday: 12,
  criticalPatients: 3,
  moderatePatients: 8,
  mildPatients: 15,
  normalPatients: 21,
  upcomingSessionsToday: 5,
  completedSessionsThisWeek: 18,
  conditionDistribution: {
    anxiety: 19,
    stress: 12,
    depression: 9,
    mixed: 5,
    none: 2,
  },
};

function schedule(hours, minutes = 0, days = 0) {
  const base = now();
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days, hours, minutes);
}

export const sessions = [
  { id: "session-001", patientId: "patient-001", patientName: "John Smith", scheduledAt: schedule(14), duration: 60, status: "scheduled", type: "video", reason: "routineCheckIn", severity: "critical", condition: "anxiety" },
  { id: "session-002", patientId: "patient-002", patientName: "Jane Doe", scheduledAt: schedule(16, 30), duration: 45, status: "scheduled", type: "inPerson", reason: "followUpCritical", severity: "moderate", condition: "depression" },
  { id: "session-003", patientId: "patient-003", patientName: "Emma Thompson", scheduledAt: schedule(18), duration: 60, status: "scheduled", type: "inPerson", reason: "urgent", severity: "critical", condition: "stress" },
  { id: "session-004", patientId: "patient-004", patientName: "James Wilson", scheduledAt: schedule(20), duration: 30, status: "scheduled", type: "video", reason: "routineCheckIn", severity: "moderate", condition: "anxiety" },
  { id: "session-005", patientId: "patient-005", patientName: "Olivia Martinez", scheduledAt: schedule(21), duration: 45, status: "scheduled", type: "video", reason: "followUpCritical", severity: "moderate", condition: "stress" },
  { id: "session-006", patientId: "patient-006", patientName: "David Anderson", scheduledAt: schedule(10, 0, 1), duration: 60, status: "scheduled", type: "video", reason: "followUpCritical", severity: "moderate", condition: "depression" },
  { id: "session-007", patientId: "patient-007", patientName: "Sophia Taylor", scheduledAt: schedule(14, 0, 1), duration: 45, status: "scheduled", type: "inPerson", reason: "followUpCritical", severity: "moderate", condition: "mixed" },
  { id: "session-008", patientId: "patient-010", patientName: "Benjamin Davis", scheduledAt: daysAgo(2), duration: 45, status: "completed", type: "video", reason: "routineCheckIn", severity: "moderate", condition: "mixed" },
];

export const clinicalSummaries = [
  {
    patientId: "patient-001",
    summaryText: "Mood score has been below 30 for 6 consecutive days. HRV shows significant deviation from baseline (-27%). Sleep efficiency declining. Requires immediate attention.",
    generatedAt: new Date(now().getTime() - 15 * 60 * 1000),
    severity: "critical",
    confidenceScore: 0.92,
  },
  {
    patientId: "patient-002",
    summaryText: "Depressive symptoms worsening. Sleep efficiency at 62% for 5 nights. HRV baseline deviation -38%. Last session was 5 days ago.",
    generatedAt: new Date(now().getTime() - 30 * 60 * 1000),
    severity: "critical",
    confidenceScore: 0.88,
  },
  {
    patientId: "patient-003",
    summaryText: "High stress indicators. HRV significantly below baseline. Multiple anxiety spikes detected this week. Moderate intervention needed.",
    generatedAt: hoursAgo(1),
    severity: "critical",
    confidenceScore: 0.85,
  },
  ...generatedPatients(moderateNames, 4, "moderate", 45).map((patient, index) => ({
    patientId: patient.id,
    summaryText: "Moderate symptoms observed. Regular monitoring recommended. Next session scheduled.",
    generatedAt: hoursAgo(index + 2),
    severity: "moderate",
    confidenceScore: 0.7 + index * 0.02,
  })),
];

export function patientName(patient) {
  if (!patient) return "Patient";
  if (patient.displayName) return patient.displayName;
  return `${patient.firstName || "Patient"} ${patient.lastName || ""}`.trim();
}

export function ageGender(patient) {
  const age = patient?.age ? String(patient.age) : "";
  const gender = patient?.gender ? String(patient.gender) : "";
  return age || gender ? `${age}${gender}` : "";
}

export function lastSeenLabel(patient) {
  const lastSeen = patient?.lastSeen instanceof Date ? patient.lastSeen : new Date(patient?.lastSeen || "");
  if (Number.isNaN(lastSeen.getTime())) return "Last: unavailable";
  const diff = now().getTime() - lastSeen.getTime();
  const hours = Math.max(1, Math.round(diff / (60 * 60 * 1000)));
  return `Last: ${Math.min(hours, 99)}h ago`;
}

export function timeCountdown(date) {
  const diffMinutes = Math.round((date.getTime() - now().getTime()) / 60000);
  if (diffMinutes < 0) return "Overdue";
  if (diffMinutes >= 1440) return `${Math.floor(diffMinutes / 1440)}d ${Math.floor((diffMinutes % 1440) / 60)}h`;
  if (diffMinutes >= 60) return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
  return `${diffMinutes}m`;
}

export function shortReason(reason) {
  const labels = {
    available: "[Available]",
    booked: "[Booked]",
    cancelled: "[Cancelled]",
    routineCheckIn: "[Routine]",
    followUpCritical: "[Follow-up]",
    urgent: "[Urgent]",
    initialAssessment: "[Initial]",
    crisisIntervention: "[Crisis]",
  };
  return labels[reason] || "[Routine]";
}

export function sessionTypeIcon(type) {
  return {
    video: "video",
    inPerson: "user",
    audio: "phone",
    chat: "message-circle",
  }[type] || "calendar";
}

export function createDefaultScheduleForm() {
  const start = nextSessionStart();

  return {
    patient: "John Smith",
    date: formatDateInput(start),
    time: formatTimeInput(start),
    duration: 60,
    type: "Video",
    reason: "Routine check-in",
    notes: "",
  };
}

export const defaultScheduleForm = createDefaultScheduleForm();

function nextSessionStart() {
  const date = new Date();
  date.setSeconds(0, 0);

  const minutes = date.getMinutes();
  const remainder = minutes % 30;
  const addMinutes = remainder === 0 ? 30 : 30 - remainder;
  date.setMinutes(minutes + addMinutes);

  return date;
}

function formatDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimeInput(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
