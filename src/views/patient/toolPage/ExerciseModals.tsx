import { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import {
  exercisePlans,
  fieldClass,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./constants";
import { hasExercisePlan } from "./helpers";
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
  const categories = Object.keys(exercisePlans) as ExerciseCategory[];

  return (
    <Modal
      title="Start Workout"
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
            onClick={onFinish}
          >
            Start {duration} min
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
          <select
            className={inputClass}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          >
            <option>15</option>
            <option>25</option>
            <option>30</option>
            <option>45</option>
          </select>
        </label>
        <NumberedPlanList steps={exercisePlans[category]} />
      </div>
    </Modal>
  );
}

type ActivityLogFormProps = ModalControlProps & {
  onSave: () => void;
};

export function ActivityLogForm({ onClose, onSave }: ActivityLogFormProps) {
  const [activity, setActivity] = useState("Walking");
  const [minutes, setMinutes] = useState("25");
  const [intensity, setIntensity] = useState("Moderate");

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
          <button type="button" className={primaryButtonClass} onClick={onSave}>
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
  onStart: () => void;
};

export function ExerciseDetail({
  item,
  onClose,
  onStart,
}: ExerciseDetailProps) {
  const title = item.title || "Exercise";
  const plan = hasExercisePlan(title)
    ? exercisePlans[title]
    : exercisePlans.Walking;

  return (
    <Modal
      title={title}
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
            onClick={onStart}
          >
            Start plan
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <section className={panelClass}>
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {item.subtitle}
          </p>
          <span className="mt-3 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            {item.meta}
          </span>
        </section>
        <NumberedPlanList steps={plan} />
      </div>
    </Modal>
  );
}

type NumberedPlanListProps = {
  steps: string[];
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
