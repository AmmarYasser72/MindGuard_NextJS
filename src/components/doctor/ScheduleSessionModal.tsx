import { useState } from "react";
import { Modal } from "../common/Modal";
import { useToast } from "../common/Toast";
import { createDefaultScheduleForm, patientName } from "../../data/doctorData";
import {
  fieldClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./dashboardShared";
import type { DoctorPatient, ScheduleForm } from "../../types/doctor";

type ScheduleSessionModalProps = {
  onClose: () => void;
  onCreate: (form: ScheduleForm) => Promise<void>;
  patient: DoctorPatient | null;
};

export default function ScheduleSessionModal({
  patient,
  onClose,
  onCreate,
}: ScheduleSessionModalProps) {
  const [form, setForm] = useState(() => ({
    ...createDefaultScheduleForm(),
    patient: patient ? patientName(patient) : "Unassigned",
  }));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setError("");
    setIsSubmitting(true);
    try {
      await onCreate(form);
      showToast(`Session scheduled for ${form.patient}`, "success");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to schedule session.";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title="Schedule New Session"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Session"}
          </button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>
          Patient
          <input
            className={inputClass}
            value={form.patient}
            readOnly={Boolean(patient)}
            onChange={(event) => update("patient", event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Date
          <input
            className={inputClass}
            type="date"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Time
          <input
            className={inputClass}
            type="time"
            value={form.time}
            onChange={(event) => update("time", event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Duration
          <select
            className={inputClass}
            value={form.duration}
            onChange={(event) => update("duration", event.target.value)}
          >
            <option>30</option>
            <option>45</option>
            <option>60</option>
          </select>
        </label>
        <label className={fieldClass}>
          Type
          <select
            className={inputClass}
            value={form.type}
            onChange={(event) => update("type", event.target.value)}
          >
            <option>Video</option>
            <option>Audio</option>
            <option>In-Person</option>
            <option>Chat</option>
          </select>
        </label>
        <label className={fieldClass}>
          Reason
          <input
            className={inputClass}
            value={form.reason}
            onChange={(event) => update("reason", event.target.value)}
          />
        </label>
        <label className={`${fieldClass} sm:col-span-2`}>
          Notes
          <textarea
            className={`${inputClass} min-h-28 py-3`}
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Add any additional notes..."
          />
        </label>
      </div>
    </Modal>
  );
}
