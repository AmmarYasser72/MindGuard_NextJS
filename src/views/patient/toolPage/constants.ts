export const panelClass =
  "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5";
export const fieldClass = "grid gap-2 text-sm font-bold text-slate-700";
export const inputClass =
  "min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-violet-100";
export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:bg-slate-300";

export const moodChoices = [
  { icon: "\u{1F620}", label: "Very Low", value: 1 },
  { icon: "\u{1F622}", label: "Low", value: 2 },
  { icon: "\u{1F610}", label: "Balanced", value: 3 },
  { icon: "\u{1F60A}", label: "Good", value: 4 },
  { icon: "\u{1F60D}", label: "Excellent", value: 5 },
];

export const exercisePlans = {
  Cardio: [
    "5 min warmup walk",
    "12 min steady run or cycling",
    "6 min light intervals",
    "5 min cool down",
  ],
  "Strength Training": [
    "Bodyweight squats",
    "Incline pushups",
    "Glute bridges",
    "Standing rows",
    "Breathing reset",
  ],
  "Yoga & Flexibility": [
    "Cat-cow flow",
    "Low lunge",
    "Seated forward fold",
    "Supine twist",
    "Three calm breaths",
  ],
  Walking: [
    "Easy first 5 minutes",
    "Brisk middle 15 minutes",
    "Relaxed final 5 minutes",
    "Mood note after finishing",
  ],
};

export type ExerciseCategory = keyof typeof exercisePlans;
