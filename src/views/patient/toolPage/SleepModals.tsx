import { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import {
  fieldClass,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./constants";
import { formatClock, sleepDuration } from "./helpers";
import { InfoTile } from "./formControls";
import type { ToolItem } from "./types";

type ModalControlProps = {
  onClose: () => void;
};

type SleepLogFormProps = ModalControlProps & {
  onSave: (entry: ToolItem) => void;
};

export function SleepLogForm({ onClose, onSave }: SleepLogFormProps) {
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState("Good");
  const duration = sleepDuration(bedtime, wakeTime);

  function save() {
    onSave({
      date: "Just now",
      duration,
      quality,
      bedtime: formatClock(bedtime),
      title: "Sleep entry",
    });
  }

  return (
    <Modal
      title="Log Sleep"
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
          <button type="button" className={primaryButtonClass} onClick={save}>
            Save sleep
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>
          Bedtime
          <input
            className={inputClass}
            type="time"
            value={bedtime}
            onChange={(event) => setBedtime(event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Wake time
          <input
            className={inputClass}
            type="time"
            value={wakeTime}
            onChange={(event) => setWakeTime(event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Quality
          <select
            className={inputClass}
            value={quality}
            onChange={(event) => setQuality(event.target.value)}
          >
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Restless</option>
          </select>
        </label>
        <div className={`${panelClass} grid content-center`}>
          <small className="text-xs font-black uppercase text-slate-400">
            Calculated duration
          </small>
          <strong className="mt-1 text-2xl font-black text-slate-950">
            {duration}
          </strong>
        </div>
      </div>
    </Modal>
  );
}

type SleepTipsProps = ModalControlProps & {
  onFinish: () => void;
};

export function SleepTips({ onClose, onFinish }: SleepTipsProps) {
  const tips = [
    "Keep your wake time within the same 30 minute window.",
    "Dim bright screens during the last hour before bed.",
    "Use a short breathing exercise if your thoughts speed up.",
    "Keep caffeine earlier than mid-afternoon when possible.",
  ];

  return (
    <Modal
      title="Sleep Tips"
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
            Use tonight
          </button>
        </>
      }
    >
      <div className="grid gap-3">
        {tips.map((tip, index) => (
          <div className={panelClass} key={tip}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs font-black text-[var(--primary)]">
              {index + 1}
            </span>
            <strong className="ml-3 text-sm leading-6 text-slate-800">
              {tip}
            </strong>
          </div>
        ))}
      </div>
    </Modal>
  );
}

type SleepDetailProps = ModalControlProps & {
  item: ToolItem;
  onFinish: () => void;
};

export function SleepDetail({ item, onClose, onFinish }: SleepDetailProps) {
  return (
    <Modal
      title={`Sleep - ${item.date}`}
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
            Save note
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoTile label="Duration" value={item.duration} />
        <InfoTile label="Quality" value={item.quality} />
        <InfoTile label="Bedtime" value={item.bedtime} />
        <section className={`${panelClass} sm:col-span-3`}>
          <small className="text-xs font-black uppercase text-slate-400">
            Pattern note
          </small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            This entry supports the weekly consistency score and helps connect
            rest quality with mood and energy trends.
          </p>
        </section>
      </div>
    </Modal>
  );
}
