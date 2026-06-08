import type { ApiRecord } from "../types/api";

const mockPatientIds = [
  "mock-patient-001",
  "mock-patient-002",
  "mock-patient-003",
  "mock-patient-004",
  "mock-patient-005",
];

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function moodReading(patientId: string, value: string, hours: number) {
  return {
    _id: `${patientId}-mood-${hours}`,
    createdAt: hoursAgo(hours),
    patient: patientId,
    type: "mood",
    updatedAt: hoursAgo(hours),
    value,
  };
}

function makeMockPatient({
  diagnosis,
  gender,
  history,
  index,
  moods,
  name,
}: {
  diagnosis: string;
  gender: string;
  history: string;
  index: number;
  moods: string[];
  name: string;
}) {
  const patientId = mockPatientIds[index];
  const moodHistory = moods.map((mood, moodIndex) =>
    moodReading(patientId, mood, moods.length - moodIndex),
  );

  return {
    _id: patientId,
    createdAt: hoursAgo(72 + index),
    currentMedications: "",
    diagnosis,
    medicalHistory: history,
    metrics: {
      latestHeartRate: {
        _id: `${patientId}-heart-rate`,
        createdAt: hoursAgo(index + 1),
        patient: patientId,
        type: "heart_rate",
        updatedAt: hoursAgo(index + 1),
        value: String([96, 82, 112, 74, 88][index]),
      },
      latestHrv: {
        _id: `${patientId}-hrv`,
        createdAt: hoursAgo(index + 1),
        patient: patientId,
        type: "hrv",
        updatedAt: hoursAgo(index + 1),
        value: String([42, 58, 31, 65, 49][index]),
      },
      latestMood: moodHistory.at(-1) || null,
      latestReadingAt: hoursAgo(index + 1),
      moodHistory,
    },
    sleep: [0.62, 0.71, 0.55, 0.79, 0.68][index],
    treatingDoctor: "mock-doctor",
    updatedAt: hoursAgo(index + 1),
    user: {
      _id: patientId,
      dateOfBirth: new Date(1990 - index * 4, index + 1, 12).toISOString(),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@mindguard.local`,
      gender,
      name,
    },
  };
}

export const mockDoctorPatientRecords: ApiRecord[] = [
  makeMockPatient({
    diagnosis: "Anxiety",
    gender: "male",
    history: "Reports panic symptoms before exams and trouble sleeping.",
    index: 0,
    moods: ["neutral", "low", "low", "very_low"],
    name: "mahmoud bahig",
  }),
  makeMockPatient({
    diagnosis: "Depression",
    gender: "female",
    history: "Low motivation and reduced social activity over the last week.",
    index: 1,
    moods: ["good", "neutral", "neutral", "low"],
    name: "ziad yehia ",
  }),
  makeMockPatient({
    diagnosis: "Stress",
    gender: "female",
    history: "High workload, headaches, and poor sleep consistency.",
    index: 2,
    moods: ["low", "low", "very_low", "very_low"],
    name: "jana ismail ",
  }),
  makeMockPatient({
    diagnosis: "Mixed anxiety and stress",
    gender: "male",
    history: "Improving with breathing exercises but still needs monitoring.",
    index: 3,
    moods: ["neutral", "good", "good", "excellent"],
    name: "ahmed elsayed",
  }),
  makeMockPatient({
    diagnosis: "Depression",
    gender: "male",
    history: "Mood fluctuates with sleep quality and missed routines.",
    index: 4,
    moods: ["neutral", "neutral", "low", "neutral"],
    name: "abdallah osama",
  }),

];
