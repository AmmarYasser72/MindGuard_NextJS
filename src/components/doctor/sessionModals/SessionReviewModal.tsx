import { useState } from "react";
import { Modal } from "../../common/Modal";
import {
  fieldClass,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../dashboardShared";
import type { DoctorSession } from "../../../types/doctor";

export function SessionReviewModal({
  session,
  onClose,
  onSave,
}: {
  session: DoctorSession;
  onClose: () => void;
  onSave: () => void;
}) {
  const [outcome, setOutcome] = useState("Stable");
  const [notes, setNotes] = useState("");

  return (
    <Modal
      title="Session Review"
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
          <button type="button" className={primaryButtonClass} onClick={onSave}>
            Save review
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <section className="rounded-lg border border-violet-100 bg-violet-50 p-4">
          <small className="text-xs font-black uppercase text-[var(--primary)]">
            Completed session
          </small>
          <h3 className="mt-2 text-xl font-black text-slate-950">
            {session.patientName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {formatDateTime(session.scheduledAt)} - {session.duration || 60} min
          </p>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fieldClass}>
            Outcome
            <select
              className={inputClass}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option>Stable</option>
              <option>Improving</option>
              <option>Needs follow-up</option>
              <option>Escalate care</option>
            </select>
          </label>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <small className="text-xs font-black uppercase text-slate-400">
              Clinical flags
            </small>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Mood", "Sleep", "HRV", "Medication"].map((flag) => (
                <span
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
                  key={flag}
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <label className={fieldClass}>
          Review notes
          <textarea
            className={`${inputClass} min-h-32 py-3`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add session summary, risk notes, and follow-up plan."
          />
        </label>
      </div>
    </Modal>
  );
}
