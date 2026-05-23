import Icon from "../common/Icon";
import MiniWave from "../common/MiniWave";
import {
  ageGender,
  conditionLabels,
  lastSeenLabel,
  patientName,
} from "../../data/doctorData";
import MetricBlock from "./MetricBlock";
import SeverityPill from "./SeverityPill";
import { primaryButtonClass, secondaryButtonClass } from "./dashboardShared";

function initials(patient) {
  return `${patient.firstName?.charAt(0) || "P"}${patient.lastName?.charAt(0) || ""}`.toUpperCase();
}

function valueOrMissing(value, suffix = "") {
  return value === null || value === undefined || value === "" ? "No data yet" : `${value}${suffix}`;
}

export default function PatientCard({ patient, expanded, onToggle, onProfile, onSchedule }) {
  const trendNote = patient.trend?.length ? `From ${Math.round(patient.trend.at(-1))} last week` : "Backend has no trend yet";

  return (
    <article className="doctor-surface overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm shadow-violet-950/5">
      <button type="button" className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-4 text-left transition hover:bg-violet-50/60" onClick={onToggle}>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white shadow-sm shadow-violet-950/10">{initials(patient)}</span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-base font-bold text-slate-950">{patientName(patient)} <span className="text-slate-500">{ageGender(patient)}</span></strong>
            <SeverityPill severity={patient.severity} />
          </span>
          <small className="mt-1 block text-sm font-medium text-slate-500">{conditionLabels[patient.condition]}</small>
          <em className="mt-1 flex items-center gap-2 text-xs font-semibold not-italic text-slate-400"><MiniWave /> {lastSeenLabel(patient)}</em>
        </span>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
      </button>
      {expanded ? (
        <div className="doctor-muted-panel grid gap-4 border-t border-violet-100 bg-violet-50/50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricBlock label="Latest mood" value={valueOrMissing(patient.mood, "/100")} note={trendNote} tone="violet" />
            <MetricBlock label="HRV" value={valueOrMissing(patient.hrv, "ms")} note={patient.hrvDeviation === null || patient.hrvDeviation === undefined ? "Backend has no HRV baseline yet" : `${Math.abs(patient.hrvDeviation).toFixed(0)}% from baseline`} tone="red" />
            <MetricBlock label="Sleep" value={patient.sleep === null || patient.sleep === undefined ? "No data yet" : `${Math.round(patient.sleep * 100)}%`} note="Efficiency last night" tone="emerald" />
          </div>
          <p className="doctor-card-gradient rounded-lg border border-violet-100 bg-white p-3 text-sm font-medium text-slate-600">
            <strong className="text-slate-900">Last journal:</strong> {patient.journal ? `"${patient.journal.slice(0, 110)}..."` : "No recent entry"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className={secondaryButtonClass} onClick={onProfile}>View Full Profile</button>
            <button type="button" className={primaryButtonClass} onClick={onSchedule}>Schedule Session</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
