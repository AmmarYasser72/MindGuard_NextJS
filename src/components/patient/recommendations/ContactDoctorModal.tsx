"use client";

import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { Modal } from "../../common/Modal";
import { useToast } from "../../common/Toast";
import type { DoctorRecommendation } from "../../../types/recommendations";

type ContactDoctorModalProps = {
  conditionLabel: string;
  doctor: DoctorRecommendation;
  patientEmail?: string;
  onClose: () => void;
  onOpenCareChat: () => void;
};

const matchLabels = {
  matched: "condition match",
  broad: "broad fit",
  "not-matched": "not a match",
};

function buildMailTo(doctor: DoctorRecommendation, conditionLabel: string, patientEmail?: string) {
  const recipient = doctor.email || "";
  const subject = encodeURIComponent(`MindGuard appointment request: ${conditionLabel}`);
  const body = encodeURIComponent([
    `Hello ${doctor.displayName},`,
    "",
    `I found your profile through MindGuard because I am looking for support with ${conditionLabel.toLowerCase()}.`,
    `Recommended specialization: ${doctor.specialization}`,
    `Doctor profile ID: ${doctor.id}`,
    patientEmail ? `Patient email: ${patientEmail}` : "",
    "",
    "Please let me know the next available time to talk.",
  ].filter(Boolean).join("\n"));

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

export default function ContactDoctorModal({
  conditionLabel,
  doctor,
  patientEmail,
  onClose,
  onOpenCareChat,
}: ContactDoctorModalProps) {
  const { showToast } = useToast();
  const mailToHref = buildMailTo(doctor, conditionLabel, patientEmail);
  const matchLabel = matchLabels[doctor.matchStatus];

  async function copyDoctorId() {
    try {
      await navigator.clipboard.writeText(doctor.id);
      showToast("Doctor profile ID copied", "success");
    } catch {
      showToast("Unable to copy the doctor ID", "error");
    }
  }

  return (
    <Modal
      title={`Contact ${doctor.displayName}`}
      onClose={onClose}
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white shadow-sm shadow-teal-950/10 transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200"
            href={mailToHref}
          >
            <Icon name="mail" size={18} color="#fff" />
            {doctor.email ? "Email doctor" : "Prepare email request"}
          </a>
        </>
      )}
    >
      <div className="grid gap-4">
        <div className="rounded-[1.25rem] bg-teal-50 p-4 text-teal-950 ring-1 ring-teal-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Recommended for</span>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">{conditionLabel}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-800">{doctor.bio}</p>
            </div>
            <span className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
              <strong className="block text-2xl font-black text-teal-800">{doctor.matchScore}%</strong>
              <small className="font-bold text-teal-700">{matchLabel}</small>
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ContactMethod icon="mail" label="Email" value={doctor.email || "Direct email is not exposed by the backend yet"} />
          <ContactMethod icon="phone" label="Phone" value={doctor.phone || "Phone is not available on this profile"} />
          <ContactMethod icon="map-pin" label="Clinic" value={doctor.clinicAddress || "Clinic address is not available"} />
          <ContactMethod icon="clock" label="Session length" value={doctor.sessionTime || "Flexible"} />
        </div>

        {!doctor.email ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            This backend doctor profile does not include direct contact details yet. The email button prepares a request with the doctor profile ID so the patient can send it through their preferred care channel.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon="copy" onClick={copyDoctorId}>Copy doctor ID</Button>
          <Button variant="ghost" icon="message-circle" onClick={onOpenCareChat}>Open care chat</Button>
        </div>
      </div>
    </Modal>
  );
}

type ContactMethodProps = {
  icon: string;
  label: string;
  value: string;
};

function ContactMethod({ icon, label, value }: ContactMethodProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-teal-700">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>
        <strong className="mt-1 block break-words text-sm font-bold text-slate-800">{value}</strong>
      </span>
    </div>
  );
}
