import { Modal } from "../../common/Modal";
import {
  ageGender,
  conditionLabels,
  lastSeenLabel,
  patientName,
} from "../../../data/doctorData";
import { secondaryButtonClass } from "../dashboardShared";
import type { DoctorPatient, DoctorSession } from "../../../types/doctor";
import { initials } from "./doctorHomeUtils";

type UpcomingSessionDetailsModalProps = {
  onClose: () => void;
  onEdit: () => void;
  patient: DoctorPatient | null;
  session: DoctorSession;
};

export default function UpcomingSessionDetailsModal({
  onClose,
  onEdit,
  patient,
  session,
}: UpcomingSessionDetailsModalProps) {
  const sleep =
    patient?.sleep === null || patient?.sleep === undefined
      ? "No data"
      : `${Math.round(patient.sleep * 100)}%`;

  return (
    <Modal
      title="Upcoming Session"
      onClose={onClose}
      actions={
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>
            Close
          </button>
          <button type="button" className={secondaryButtonClass} onClick={onEdit}>
            Edit session
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <section className="rounded-lg border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4">
          <small className="text-xs font-black uppercase text-slate-400">
            Patient profile
          </small>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-[var(--primary)] text-lg font-black text-white">
              {initials(patient, session.patientName)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black text-slate-950">
                {patient ? patientName(patient) : session.patientName}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {patient?.email ||
                  String(session.raw?.patientEmail || "No email available")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                {patient ? (
                  <>
                    <span className="rounded-lg bg-slate-100 px-3 py-1">
                      {ageGender(patient) || "Age unavailable"}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1">
                      {conditionLabels[patient.condition] || patient.condition}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1">
                      {lastSeenLabel(patient)}
                    </span>
                  </>
                ) : (
                  <span className="rounded-lg bg-slate-100 px-3 py-1">
                    Profile will appear here when this patient is assigned to
                    the doctor panel.
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Signal label="Mood" value={patient?.mood ? `${patient.mood}/100` : "No data"} />
          <Signal label="Sleep" value={sleep} />
          <Signal
            label="HRV"
            value={patient?.hrv ? `${Math.round(patient.hrv)} ms` : "No data"}
          />
        </section>

        <section className="grid gap-3 rounded-lg border border-[var(--doctor-line)] bg-white p-4 sm:grid-cols-3">
          <Signal label="Session" value={session.type || "video"} />
          <Signal
            label="Duration"
            value={`${session.duration || 60} min`}
          />
          <Signal label="Status" value={session.status || "scheduled"} />
        </section>
      </div>
    </Modal>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--doctor-line)] bg-white p-4">
      <small className="text-xs font-black uppercase text-slate-400">
        {label}
      </small>
      <strong className="mt-2 block text-sm font-black text-slate-950">
        {value}
      </strong>
    </div>
  );
}
