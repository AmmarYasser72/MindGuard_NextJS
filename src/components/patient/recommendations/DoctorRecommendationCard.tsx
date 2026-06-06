"use client";

import Button from "../../common/Button";
import Card from "../../common/Card";
import Icon from "../../common/Icon";
import { cn } from "../../../utils/cn";
import type { DoctorRecommendation } from "../../../types/recommendations";

type DoctorRecommendationCardProps = {
  doctor: DoctorRecommendation;
  onContact: (doctor: DoctorRecommendation) => void;
};

const sourceBadgeStyles = {
  backend: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  curated: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  "signed-up": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
};

const sourceLabels = {
  backend: "Backend",
  curated: "Curated",
  "signed-up": "Signed up",
};

const matchBadgeStyles = {
  matched: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  broad: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  "not-matched": "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

const matchLabels = {
  matched: "Matches condition",
  broad: "Broad fit",
  "not-matched": "Not a match",
};

export default function DoctorRecommendationCard({
  doctor,
  onContact,
}: DoctorRecommendationCardProps) {
  const hasDirectContact = Boolean(doctor.email || doctor.phone);
  const matchLabel = matchLabels[doctor.matchStatus];

  return (
    <Card className="doctor-recommendation-card overflow-hidden p-0 transition duration-300 hover:-translate-y-0.5 [html:not([data-theme='dark'])_&]:border-[rgba(203,213,225,0.82)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] [html:not([data-theme='dark'])_&]:shadow-[0_1.1rem_2.6rem_rgba(55,65,118,0.075)] [html:not([data-theme='dark'])_&]:before:block [html:not([data-theme='dark'])_&]:before:h-[0.35rem] [html:not([data-theme='dark'])_&]:before:bg-[linear-gradient(90deg,var(--patient-doctor-accent),var(--primary))] [html:not([data-theme='dark'])_&]:hover:border-[rgba(14,116,144,0.24)] [html:not([data-theme='dark'])_&]:hover:shadow-[0_1.5rem_3.2rem_rgba(55,65,118,0.11)]">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_minmax(190px,240px)]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            <span className="doctor-recommendation-avatar grid h-14 w-14 shrink-0 place-items-center rounded-[1.1rem] bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-[0_16px_34px_rgba(13,148,136,0.22)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,var(--patient-doctor-accent),var(--primary))]">
              <Icon name="stethoscope" size={27} color="#fff" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black tracking-[-0.02em] text-app-text">
                  {doctor.displayName}
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]",
                    sourceBadgeStyles[doctor.source],
                  )}
                >
                  {sourceLabels[doctor.source]}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]",
                    matchBadgeStyles[doctor.matchStatus],
                  )}
                >
                  {matchLabel}
                </span>
              </div>
              <p className="doctor-recommendation-specialty mt-1 text-sm font-bold [html:not([data-theme='dark'])_&]:text-[var(--patient-doctor-accent)]">
                {doctor.specialization}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-app-text-soft">
                {doctor.bio}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DoctorMeta
              icon="briefcase-business"
              label="Experience"
              value={
                doctor.yearsOfExperience
                  ? `${doctor.yearsOfExperience} years`
                  : "Available on profile"
              }
            />
            <DoctorMeta
              icon="clock"
              label="Session"
              value={doctor.sessionTime || "Flexible"}
            />
            <DoctorMeta
              icon="languages"
              label="Languages"
              value={doctor.languages.join(", ")}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {doctor.matchReasons.map((reason) => (
              <span
                key={reason}
                className="doctor-recommendation-pill doctor-recommendation-pill-reason rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-100 [html:not([data-theme='dark'])_&]:bg-[color-mix(in_srgb,var(--patient-doctor-accent)_9%,#ffffff)] [html:not([data-theme='dark'])_&]:text-cyan-800 [html:not([data-theme='dark'])_&]:ring-[rgba(14,116,144,0.16)]"
              >
                {reason}
              </span>
            ))}
            {doctor.careModes.map((mode) => (
              <span
                key={mode}
                className="doctor-recommendation-pill rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100"
              >
                {mode}
              </span>
            ))}
          </div>
        </div>

        <aside className="doctor-recommendation-score-panel flex min-w-44 flex-col justify-between gap-4 rounded-[1.15rem] border border-teal-100 bg-teal-50/70 p-4 [html:not([data-theme='dark'])_&]:border-[rgba(14,116,144,0.18)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,#ecfeff_0%,#eef2ff_100%)] [html:not([data-theme='dark'])_&]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)]">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
              Condition fit
            </span>
            <div className="mt-2 flex items-end gap-1">
              <strong className="text-4xl font-black tracking-[-0.05em] text-teal-950">
                {doctor.matchScore}
              </strong>
              <span className="pb-1 text-sm font-black text-teal-700">%</span>
            </div>
            <strong className="mt-1 block text-xs font-black uppercase tracking-[0.12em] text-teal-700">
              {matchLabel}
            </strong>
            <p className="mt-2 text-xs leading-5 text-teal-800">
              {hasDirectContact
                ? "Direct contact details available."
                : "Backend profile has limited contact data."}
            </p>
          </div>

          <Button
            className="doctor-recommendation-cta w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-200 [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,var(--patient-doctor-accent),var(--primary))] [html:not([data-theme='dark'])_&]:shadow-[0_0.75rem_1.6rem_rgba(14,116,144,0.16)] [html:not([data-theme='dark'])_&]:hover:brightness-[0.96]"
            icon={hasDirectContact ? "message-circle" : "mail"}
            onClick={() => onContact(doctor)}
          >
            {hasDirectContact ? "Contact" : "Request intro"}
          </Button>
        </aside>
      </div>
    </Card>
  );
}

type DoctorMetaProps = {
  icon: string;
  label: string;
  value: string;
};

function DoctorMeta({ icon, label, value }: DoctorMetaProps) {
  return (
    <div className="doctor-recommendation-meta flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] [html:not([data-theme='dark'])_&]:shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-teal-700 shadow-sm">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <strong className="block break-words text-sm font-bold leading-5 text-slate-800">
          {value}
        </strong>
      </span>
    </div>
  );
}
