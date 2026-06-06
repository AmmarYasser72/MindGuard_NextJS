import { exercisePlans } from "./constants";
import type { ToolItem } from "./types";

export function hasExercisePlan(
  title: string,
): title is keyof typeof exercisePlans {
  return title in exercisePlans;
}

export function breathingPlan(title: string) {
  if (title.includes("Box")) {
    return {
      phases: [
        {
          label: "Inhale",
          seconds: 4,
          helper: "Breathe in smoothly through your nose.",
        },
        { label: "Hold", seconds: 4, helper: "Keep your shoulders relaxed." },
        { label: "Exhale", seconds: 4, helper: "Release the breath slowly." },
        { label: "Hold", seconds: 4, helper: "Rest before the next round." },
      ],
      tips: [
        "Keep the rhythm equal.",
        "Stop if you feel lightheaded.",
        "Repeat for five minutes.",
      ],
    };
  }

  if (title.includes("Diaphragmatic")) {
    return {
      phases: [
        {
          label: "Belly inhale",
          seconds: 4,
          helper: "Let your abdomen rise gently.",
        },
        {
          label: "Soft pause",
          seconds: 2,
          helper: "Keep the breath comfortable.",
        },
        {
          label: "Long exhale",
          seconds: 6,
          helper: "Let your abdomen soften.",
        },
      ],
      tips: [
        "Place one hand on your belly.",
        "Breathe quietly.",
        "Use this before sleep.",
      ],
    };
  }

  return {
    phases: [
      { label: "Inhale", seconds: 4, helper: "Fill your lungs slowly." },
      {
        label: "Hold",
        seconds: 7,
        helper: "Hold without tightening your jaw.",
      },
      {
        label: "Exhale",
        seconds: 8,
        helper: "Exhale longer than you inhaled.",
      },
    ],
    tips: [
      "Use four rounds to start.",
      "Keep your neck loose.",
      "Let the exhale do the calming.",
    ],
  };
}

export function sleepDuration(bedtime: string, wakeTime: string) {
  const [bedHour, bedMinute] = bedtime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const start = bedHour * 60 + bedMinute;
  let end = wakeHour * 60 + wakeMinute;
  if (end <= start) end += 24 * 60;
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatClock(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function detailNextStep(item: ToolItem) {
  if (item.status === "Done")
    return "Keep the goal visible tomorrow and choose a similar start time.";
  if (item.status === "In Progress")
    return "Finish the smallest remaining piece first, then mark the goal complete.";
  if (item.status === "Pending")
    return "Schedule a specific time and make the first step shorter than five minutes.";
  if (item.subtitle)
    return "Review what helped, then repeat the useful part once more this week.";
  return "Add one note so your dashboard can keep the context attached to this item.";
}
