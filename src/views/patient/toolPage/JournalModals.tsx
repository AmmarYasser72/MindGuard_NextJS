import { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import {
  fieldClass,
  inputClass,
  moodChoices,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./constants";
import { RangeField } from "./formControls";
import type { ToolItem } from "./types";

type ModalControlProps = {
  onClose: () => void;
};

type SaveToolItemProps = ModalControlProps & {
  onSave: (entry: ToolItem) => void;
};

export function JournalEntryForm({ onClose, onSave }: SaveToolItemProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(moodChoices[3]);
  const canSave = title.trim().length > 1 && body.trim().length > 4;

  function save() {
    onSave({
      date: "Just now",
      title: title.trim(),
      preview: body.trim(),
      mood: mood.icon,
    });
  }

  return (
    <Modal
      title="New Journal Entry"
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
            onClick={save}
            disabled={!canSave}
          >
            Save entry
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <label className={fieldClass}>
          Title
          <input
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give this reflection a title"
          />
        </label>
        <div className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Mood</span>
          <MoodChoiceGrid value={mood.value} onChange={setMood} />
        </div>
        <label className={fieldClass}>
          Reflection
          <textarea
            className={`${inputClass} min-h-40 py-3 leading-6`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write what happened, what you felt, and one next step."
          />
        </label>
      </div>
    </Modal>
  );
}

type MoodCheckFormProps = ModalControlProps & {
  onSave: () => void;
};

export function MoodCheckForm({ onClose, onSave }: MoodCheckFormProps) {
  const [mood, setMood] = useState(moodChoices[3]);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(4);

  return (
    <Modal
      title="Mood Check"
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
            Save check-in
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <MoodChoiceGrid value={mood.value} onChange={setMood} />
        <RangeField label="Energy" value={energy} onChange={setEnergy} />
        <RangeField label="Stress" value={stress} onChange={setStress} />
        <div className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-2xl">
              {mood.icon}
            </span>
            <span>
              <strong className="block text-sm font-black text-slate-950">
                {mood.label}
              </strong>
              <small className="font-semibold text-slate-500">
                Energy {energy}/10, stress {stress}/10
              </small>
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

type JournalDetailProps = ModalControlProps & {
  item: ToolItem;
  onFinish: () => void;
};

export function JournalDetail({ item, onClose, onFinish }: JournalDetailProps) {
  return (
    <Modal
      title={item.title || "Journal Entry"}
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
            onClick={onFinish}
          >
            Mark reviewed
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <section className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-violet-50 text-2xl">
              {item.mood}
            </span>
            <span>
              <small className="block text-xs font-black uppercase text-slate-400">
                {item.date}
              </small>
              <strong className="block text-sm text-slate-950">
                Reflection entry
              </strong>
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
            {item.preview}
          </p>
        </section>
        <section className={panelClass}>
          <small className="text-xs font-black uppercase text-slate-400">
            Follow-up prompt
          </small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            What helped most today, and what would make tomorrow 10 percent
            easier?
          </p>
        </section>
      </div>
    </Modal>
  );
}

type MoodChoice = (typeof moodChoices)[number];

type MoodChoiceGridProps = {
  onChange: (choice: MoodChoice) => void;
  value: number;
};

function MoodChoiceGrid({ value, onChange }: MoodChoiceGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {moodChoices.map((choice) => (
        <button
          type="button"
          className={`grid min-h-20 content-start justify-items-center rounded-lg border p-2 text-center text-xs font-bold transition ${value === choice.value ? "border-[var(--primary)] bg-violet-50 text-[var(--primary)]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
          key={choice.label}
          onClick={() => onChange(choice)}
        >
          <span className="text-2xl">{choice.icon}</span>
          <span className="mt-2 leading-4">{choice.label}</span>
        </button>
      ))}
    </div>
  );
}
