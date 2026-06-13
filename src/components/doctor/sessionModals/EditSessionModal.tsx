import { useState } from "react";
import { Modal } from "../../common/Modal";
import {
  fieldClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../dashboardShared";
import type { DoctorSession } from "../../../types/doctor";
import { formatDateInput, formatTimeInput } from "./sessionModalUtils";

export function EditSessionModal({
  session,
  isSaving,
  onClose,
  onSave,
}: {
  session: DoctorSession;
  isSaving: boolean;
  onClose: () => void;
  onSave: (session: DoctorSession) => void;
}) {
  const [form, setForm] = useState(() => ({
    date: formatDateInput(session.scheduledAt),
    duration: String(session.duration || 60),
    notes: session.notes || String(session.raw?.doctorNote || ""),
    reason: session.reason || "routineCheckIn",
    status: session.status || "available",
    time: formatTimeInput(session.scheduledAt),
    type: session.type || "video",
  }));
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError("");
    const start = new Date(`${form.date}T${form.time}`);
    const duration = Number(form.duration);

    if (
      Number.isNaN(start.getTime()) ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      setError("Choose a valid date, time, and duration.");
      return;
    }

    const end = new Date(start.getTime() + duration * 60 * 1000);
    onSave({
      ...session,
      duration,
      notes: form.notes,
      reason: form.reason,
      scheduledAt: start,
      status: form.status,
      type: form.type,
      raw: {
        ...(session.raw || {}),
        doctorNote: form.notes,
        endTime: end.toISOString(),
        notes: form.notes,
        sessionUpdatedAt: new Date().toISOString(),
        startTime: start.toISOString(),
        status: form.status,
      },
    });
  }

  return (
    <Modal
      title="Edit Session"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
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
            <option>90</option>
          </select>
        </label>
        <label className={fieldClass}>
          Status
          <select
            className={inputClass}
            value={form.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className={fieldClass}>
          Type
          <select
            className={inputClass}
            value={form.type}
            onChange={(event) => update("type", event.target.value)}
          >
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="inPerson">In person</option>
            <option value="chat">Chat</option>
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
          Doctor note
          <textarea
            className={`${inputClass} min-h-28 py-3`}
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Describe what was done or add important comments for the patient."
          />
        </label>
      </div>
    </Modal>
  );
}
