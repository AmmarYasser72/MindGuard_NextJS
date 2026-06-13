import { useState } from "react";
import Icon from "../../common/Icon";
import { Modal } from "../../common/Modal";
import {
  fieldClass,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../dashboardShared";
import type { DoctorSession } from "../../../types/doctor";
import { InfoPill } from "./sessionModalUtils";

export function LiveSessionModal({
  session,
  onClose,
  onSave,
}: {
  session: DoctorSession;
  onClose: () => void;
  onSave: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <Modal
      title="Session Room"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
          >
            End session
          </button>
          <button type="button" className={primaryButtonClass} onClick={onSave}>
            Save note
          </button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="grid min-h-64 place-items-center rounded-lg border border-violet-100 bg-[linear-gradient(135deg,#312e81_0%,#6366f1_58%,#8b5cf6_100%)] p-5 text-center text-white">
          <span>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/15">
              <Icon name="video" size={34} color="#fff" />
            </span>
            <strong className="mt-4 block text-2xl font-black">
              {session.patientName}
            </strong>
            <small className="mt-2 block text-sm font-bold text-violet-100">
              Ready for {session.type || "video"} session
            </small>
          </span>
        </section>
        <aside className="grid gap-3">
          <InfoPill
            icon="calendar"
            label="When"
            value={formatDateTime(session.scheduledAt)}
          />
          <InfoPill
            icon="timer"
            label="Duration"
            value={`${session.duration || 60} min`}
          />
          <InfoPill
            icon="activity"
            label="Status"
            value={session.status || "scheduled"}
          />
        </aside>
        <label className={`${fieldClass} lg:col-span-2`}>
          Live note
          <textarea
            className={`${inputClass} min-h-28 py-3`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Capture observations, care-plan updates, and follow-up tasks."
          />
        </label>
      </div>
    </Modal>
  );
}
