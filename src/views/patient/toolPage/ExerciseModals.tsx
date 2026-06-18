import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/common/Modal";
import {
  exerciseLibrary,
  fieldClass,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./constants";
import { findExerciseById, getExercisesForCategory, hasExercisePlan } from "./helpers";
import type { ExerciseCategory } from "./constants";
import type { ToolItem } from "./types";

type ModalControlProps = {
  onClose: () => void;
};

type WorkoutPlannerProps = ModalControlProps & {
  item: ToolItem;
  onFinish: () => void;
};

export function WorkoutPlanner({
  item,
  onClose,
  onFinish,
}: WorkoutPlannerProps) {
  const defaultCategory: ExerciseCategory =
    item.title && hasExercisePlan(item.title) ? item.title : "Walking";
  const [category, setCategory] = useState<ExerciseCategory>(defaultCategory);
  const [duration, setDuration] = useState("25");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const categories = Object.keys(exerciseLibrary) as ExerciseCategory[];
  const durationMinutes = Math.max(1, Number(duration) || 1);
  const isRunning = secondsLeft !== null && secondsLeft > 0;

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => {
        if (current === null) return null;
        if (current <= 1) {
          setIsComplete(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function startWorkout() {
    setIsComplete(false);
    setSecondsLeft(durationMinutes * 60);
  }

  function resetWorkout() {
    setSecondsLeft(null);
    setIsComplete(false);
  }

  return (
    <Modal
      title="Start Workout"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={isRunning || isComplete ? resetWorkout : onClose}
          >
            {isRunning || isComplete ? "Reset" : "Cancel"}
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={isComplete ? onFinish : startWorkout}
            disabled={isRunning}
          >
            {isComplete
              ? "Finish"
              : isRunning
                ? `Time left ${formatExerciseTime(secondsLeft)}`
                : `Start ${durationMinutes} min`}
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-4">
          {categories.map((name) => (
            <button
              type="button"
              className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${category === name ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              key={name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className={fieldClass}>
          Duration
          <input
            className={inputClass}
            type="number"
            min="1"
            max="180"
            step="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            disabled={isRunning}
          />
        </label>
        <section className={panelClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <small className="text-xs font-black uppercase text-slate-400">
                Countdown Timer
              </small>
              <strong className="mt-2 block text-3xl font-black text-slate-950">
                {isRunning && secondsLeft !== null
                  ? formatExerciseTime(secondsLeft)
                  : `${durationMinutes}:00`}
              </strong>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Set any duration you want in minutes, then start when you are ready.
              </p>
            </div>
            <TimerBadge
              isComplete={isComplete}
              isRunning={isRunning}
              secondsLeft={secondsLeft}
            />
          </div>
        </section>
        {isComplete ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <strong className="text-base text-emerald-800">
              Good exercise, keep it up!
            </strong>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-700">
              You completed your {durationMinutes}-minute workout.
            </p>
          </section>
        ) : null}
        <div className={isRunning ? "pointer-events-none opacity-60" : ""}>
          <NumberedPlanList
            steps={getExercisesForCategory(category).map((exercise) => exercise.title)}
          />
        </div>
      </div>
    </Modal>
  );
}

type ActivityLogFormProps = ModalControlProps & {
  onSave: (entry: ToolItem) => void;
};

export function ActivityLogForm({ onClose, onSave }: ActivityLogFormProps) {
  const [activity, setActivity] = useState("Walking");
  const [minutes, setMinutes] = useState("25");
  const [intensity, setIntensity] = useState("Moderate");

  function saveActivity() {
    const cleanedMinutes = Math.max(1, Number(minutes) || 1);
    const normalizedActivity = activity.trim() || "Custom Activity";
    const normalizedIntensity = intensity.trim() || "Moderate";

    onSave({
      id: `activity-${Date.now()}`,
      title: normalizedActivity,
      subtitle: `${normalizedIntensity} intensity`,
      description: `${cleanedMinutes} minute ${normalizedActivity.toLowerCase()} session logged by the patient.`,
      duration: `${cleanedMinutes} min`,
      meta: `${cleanedMinutes} min`,
      icon: "dumbbell",
      time: `${cleanedMinutes}`,
    });
  }

  return (
    <Modal
      title="Log Activity"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={saveActivity}
          >
            Save activity
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>
          Activity
          <input
            className={inputClass}
            value={activity}
            onChange={(event) => setActivity(event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Minutes
          <input
            className={inputClass}
            type="number"
            min="1"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Intensity
          <select
            className={inputClass}
            value={intensity}
            onChange={(event) => setIntensity(event.target.value)}
          >
            <option>Light</option>
            <option>Moderate</option>
            <option>Challenging</option>
          </select>
        </label>
        <div className={`${panelClass} grid content-center`}>
          <small className="text-xs font-black uppercase text-slate-400">
            Summary
          </small>
          <strong className="mt-1 text-sm text-slate-950">
            {minutes || 0} min {activity.toLowerCase()},{" "}
            {intensity.toLowerCase()} intensity
          </strong>
        </div>
      </div>
    </Modal>
  );
}

type ExerciseDetailProps = ModalControlProps & {
  item: ToolItem;
};

export function ExerciseDetail({ item, onClose }: ExerciseDetailProps) {
  const title = item.title || "Exercise";
  const customExercise = useMemo(
    () =>
      item.duration && !hasExercisePlan(title)
        ? {
            id: item.id || `custom-${title}`,
            title,
            subtitle:
              item.description ||
              item.subtitle ||
              "Custom activity saved from your exercise log.",
            durationLabel: item.duration,
            durationSeconds: Math.max(1, Number(item.time) || 1) * 60,
            steps: [
              `Begin your ${title.toLowerCase()} at a pace that feels sustainable.`,
              "Keep your breathing steady and your posture relaxed.",
              "Cool down gently and notice how your body feels afterward.",
            ],
          }
        : null,
    [item.description, item.duration, item.id, item.subtitle, item.time, title],
  );
  const categoryExercises = useMemo(
    () => (customExercise ? [customExercise] : getExercisesForCategory(title)),
    [customExercise, title],
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    findExerciseById(item.id)?.id || categoryExercises[0]?.id || null,
  );
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const selectedExercise =
    findExerciseById(selectedExerciseId) || categoryExercises[0];

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => {
        if (current === null) return null;
        if (current <= 1) {
          setIsComplete(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function startExercise() {
    if (!selectedExercise) return;
    setIsComplete(false);
    setSecondsLeft(selectedExercise.durationSeconds);
  }

  const isRunning = secondsLeft !== null && secondsLeft > 0;
  const showCategoryPicker = hasExercisePlan(title) && !findExerciseById(item.id);
  const actionLabel = isRunning
    ? `Time left ${formatExerciseTime(secondsLeft)}`
    : "Start Exercise";

  return (
    <Modal
      title={showCategoryPicker ? title : selectedExercise?.title || title}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={startExercise}
            disabled={!selectedExercise || isRunning}
          >
            {actionLabel}
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        {selectedExercise ? (
          <>
            <section className={panelClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-6 text-slate-600">
                    {selectedExercise.subtitle}
                  </p>
                  <span className="mt-3 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                    {selectedExercise.durationLabel}
                  </span>
                </div>
                <TimerBadge
                  isComplete={isComplete}
                  isRunning={isRunning}
                  secondsLeft={secondsLeft}
                />
              </div>
            </section>
            {isComplete ? (
              <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <strong className="text-base text-emerald-800">
                  Good exercise, keep it up!
                </strong>
                <p className="mt-1 text-sm font-semibold leading-6 text-emerald-700">
                  You finished {selectedExercise.title}. Come back anytime for another round.
                </p>
              </section>
            ) : null}
            <NumberedPlanList steps={selectedExercise.steps} />
          </>
        ) : null}

        {showCategoryPicker ? (
          <section className="grid gap-3">
            <div className={panelClass}>
              <p className="text-sm font-semibold leading-6 text-slate-600">
                Pick an exercise to see the guided steps and start the timer.
              </p>
            </div>
            <div className="grid gap-3">
              {categoryExercises.map((exercise) => {
                const active = exercise.id === selectedExercise?.id;
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    className={`${panelClass} text-left transition ${active ? "border-emerald-300 bg-emerald-50" : "hover:border-emerald-200 hover:bg-slate-50"}`}
                    onClick={() => {
                      setSelectedExerciseId(exercise.id);
                      setSecondsLeft(null);
                      setIsComplete(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="block text-base text-slate-950">
                          {exercise.title}
                        </strong>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {exercise.subtitle}
                        </p>
                      </div>
                      <span className="rounded-lg bg-white/90 px-3 py-2 text-xs font-black text-emerald-700">
                        {exercise.durationLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}

type NumberedPlanListProps = {
  steps: readonly string[];
};

function NumberedPlanList({ steps }: NumberedPlanListProps) {
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <div className={panelClass} key={step}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-xs font-black text-emerald-600">
            {index + 1}
          </span>
          <strong className="ml-3 text-sm text-slate-900">{step}</strong>
        </div>
      ))}
    </div>
  );
}

type TimerBadgeProps = {
  isComplete: boolean;
  isRunning: boolean;
  secondsLeft: number | null;
};

function TimerBadge({
  isComplete,
  isRunning,
  secondsLeft,
}: TimerBadgeProps) {
  if (isComplete) {
    return (
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
        <small className="block text-[11px] font-black uppercase text-emerald-700">
          Completed
        </small>
        <strong className="mt-1 block text-lg font-black text-emerald-800">
          Nice work
        </strong>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
      <small className="block text-[11px] font-black uppercase text-slate-500">
        {isRunning ? "Countdown" : "Ready"}
      </small>
      <strong className="mt-1 block text-lg font-black text-slate-950">
        {isRunning && secondsLeft !== null
          ? formatExerciseTime(secondsLeft)
          : "Start now"}
      </strong>
    </div>
  );
}

function formatExerciseTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
