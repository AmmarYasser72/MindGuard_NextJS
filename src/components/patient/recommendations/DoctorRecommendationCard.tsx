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

export default function DoctorRecommendationCard({ doctor, onContact }: DoctorRecommendationCardProps) {
  const hasDirectContact = Boolean(doctor.email || doctor.phone);

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-[0_16px_34px_rgba(13,148,136,0.22)]">
              <Icon name="stethoscope" size={27} color="#fff" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black tracking-[-0.02em] text-app-text">{doctor.displayName}</h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]",
                    doctor.source === "backend"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
                  )}
                >
                  {doctor.source === "backend" ? "Backend" : "Curated"}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-teal-700">{doctor.specialization}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-app-text-soft">{doctor.bio}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DoctorMeta icon="briefcase-business" label="Experience" value={doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : "Available on profile"} />
            <DoctorMeta icon="clock" label="Session" value={doctor.sessionTime || "Flexible"} />
            <DoctorMeta icon="languages" label="Languages" value={doctor.languages.join(", ")} />
          </div>

          <div className="flex flex-wrap gap-2">
            {doctor.matchReasons.map((reason) => (
              <span key={reason} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-100">
                {reason}
              </span>
            ))}
            {doctor.careModes.map((mode) => (
              <span key={mode} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                {mode}
              </span>
            ))}
          </div>
        </div>

        <aside className="flex min-w-44 flex-col justify-between gap-4 rounded-[1.25rem] border border-teal-100 bg-teal-50/70 p-4">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Match</span>
            <div className="mt-2 flex items-end gap-1">
              <strong className="text-4xl font-black tracking-[-0.05em] text-teal-950">{doctor.matchScore}</strong>
              <span className="pb-1 text-sm font-black text-teal-700">%</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-teal-800">
              {hasDirectContact ? "Direct contact details available." : "Backend profile has limited contact data."}
            </p>
          </div>

          <Button className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-200" icon={hasDirectContact ? "message-circle" : "mail"} onClick={() => onContact(doctor)}>
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
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-teal-700 shadow-sm">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>
        <strong className="block truncate text-sm font-bold text-slate-800">{value}</strong>
      </span>
    </div>
  );
}
