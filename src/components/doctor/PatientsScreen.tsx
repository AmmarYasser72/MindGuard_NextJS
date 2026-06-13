import { useEffect, useMemo, useState } from "react";
import Icon from "../common/Icon";
import { patientName, severityLabels } from "../../data/doctorData";
import PatientCard from "./PatientCard";
import PatientDetails from "./PatientDetails";
import EmptyPanel from "./EmptyPanel";
import {
  filterButtonClass,
  primaryButtonClass,
  surfaceClass,
} from "./dashboardShared";
import type { DoctorPatient } from "../../types/doctor";

type PatientsScreenProps = {
  error?: string;
  isLoading: boolean;
  onDeletePatient: (patient: DoctorPatient) => void;
  onOpenSchedule: (patient: DoctorPatient | null) => void;
  onRetry: () => void;
  patients?: DoctorPatient[];
};

const severityOrder = ["critical", "moderate", "mild", "normal"] as const;
const filterOptions = ["all", ...severityOrder] as const;

export default function PatientsScreen({
  error,
  isLoading,
  onDeletePatient,
  onOpenSchedule,
  onRetry,
  patients = [],
}: PatientsScreenProps) {
  const [renderedAt] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailPatient, setDetailPatient] = useState<DoctorPatient | null>(
    null,
  );
  const patientIds = patients.map((patient) => patient.id).join("|");

  const severityCounts = useMemo(
    () =>
      severityOrder.reduce(
        (accumulator, severity) => {
          accumulator[severity] = patients.filter(
            (patient) => patient.severity === severity,
          ).length;
          return accumulator;
        },
        {} as Record<(typeof severityOrder)[number], number>,
      ),
    [patients],
  );

  const filtered = patients.filter((patient) => {
    const searchable = [
      patientName(patient),
      patient.email,
      patient.condition,
      patient.severity,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || patient.severity === filter;
    return matchesQuery && matchesFilter;
  });

  const activeToday = patients.filter((patient) => {
    const hoursSinceSeen =
      (renderedAt - new Date(patient.lastSeen).getTime()) / (1000 * 60 * 60);
    return Number.isFinite(hoursSinceSeen) && hoursSinceSeen <= 24;
  }).length;
  const attentionNow = severityCounts.critical + severityCounts.moderate;
  const trackedMetrics = patients.filter(
    (patient) =>
      patient.mood !== null || patient.hrv !== null || patient.sleep !== null,
  ).length;
  const currentFilterLabel =
    filter === "all" ? "All levels" : severityLabels[filter];

  useEffect(() => {
    const ids = patientIds.split("|").filter(Boolean);

    if (!ids.length) {
      setExpanded(null);
      return;
    }

    setExpanded((current) =>
      current && ids.includes(current) ? current : ids[0],
    );
  }, [patientIds]);

  return (
    <div className="grid w-full max-w-none gap-4 p-4 sm:p-6 lg:p-8">
      <section className="rounded-[1.25rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:px-4.5 sm:py-3.5">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">
                <Icon name="shield-check" size={10} color="currentColor" />
                Patient overview
              </span>
              <h1 className="mt-2 text-[clamp(1.05rem,1.45vw,1.45rem)] font-black leading-[1.05] tracking-tight text-slate-950">
                Patients for quick clinical review
              </h1>
              <p className="mt-1.5 max-w-2xl text-[11px] font-semibold leading-5 text-slate-600">
                Search by name, focus on the highest-risk group, and keep the
                latest signals visible at a glance.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <MiniStat label="Visible" value={String(filtered.length)} />
                <MiniStat label="Active today" value={String(activeToday)} />
                <MiniStat
                  label="Needs attention"
                  value={String(attentionNow)}
                />
                <MiniStat label="Tracked" value={String(trackedMetrics)} />
              </div>
            </div>

            <button
              type="button"
              className={`${primaryButtonClass} min-h-9 rounded-xl px-3 text-xs shadow-[0_6px_12px_rgba(99,102,241,0.1)]`}
              onClick={() => onOpenSchedule(null)}
              disabled={isLoading}
            >
              <Icon name="calendar-plus" size={14} color="#fff" />
              Schedule
            </button>
          </div>

          <section className="rounded-[1.1rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Severity mix
                </p>
                <h2 className="mt-1 text-base font-black text-slate-950">
                  Current caseload
                </h2>
              </div>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                {currentFilterLabel}
              </span>
            </div>
            <div className="mt-2.5 grid gap-2">
              {severityOrder.map((item) => (
                <SeverityRow
                  key={item}
                  label={severityLabels[item]}
                  value={severityCounts[item]}
                  total={patients.length || 1}
                  tone={item}
                />
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className={`${surfaceClass} rounded-[1.5rem] p-4 sm:p-5`}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="grid gap-3">
            <label className="flex min-h-14 items-center gap-3 rounded-[1rem] border border-[var(--doctor-line)] bg-[var(--doctor-card)] px-4 text-slate-900 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm shadow-violet-950/5">
                <Icon name="search" size={20} color="#6366f1" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Search patients
                </span>
                <input
                  className="mt-1 min-w-0 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Try a name, email, condition, or severity"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </span>
              {query ? (
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <Icon name="x" size={16} />
                </button>
              ) : null}
            </label>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-violet-50 px-3 py-1 text-[var(--primary)]">
                {filtered.length} results
              </span>
              <span>Filter:</span>
              <span className="text-slate-700">{currentFilterLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((item) => (
              <button
                type="button"
                className={`${filterButtonClass(filter === item)} rounded-xl px-4`}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item === "all" ? "All" : severityLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {isLoading ? (
          <EmptyPanel message="Loading patients from the backend..." />
        ) : null}
        {!isLoading && error ? (
          <ApiErrorPanel message={error} onRetry={onRetry} />
        ) : null}
        {!isLoading && !error
          ? filtered.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                expanded={expanded === patient.id}
                onDelete={() => {
                  onDeletePatient(patient);
                  setDetailPatient((current) =>
                    current?.id === patient.id ? null : current,
                  );
                  setExpanded((current) =>
                    current === patient.id ? null : current,
                  );
                }}
                onToggle={() =>
                  setExpanded((current) =>
                    current === patient.id ? null : patient.id,
                  )
                }
                onProfile={() => setDetailPatient(patient)}
                onSchedule={() => onOpenSchedule(patient)}
              />
            ))
          : null}
        {!isLoading && !error && !filtered.length ? (
          <EmptyPanel
            message={
              patients.length
                ? "No patients match this search."
                : "No patients returned by the backend."
            }
          />
        ) : null}
      </div>

      {detailPatient ? (
        <PatientDetails
          patient={detailPatient}
          onClose={() => setDetailPatient(null)}
          onSchedule={() => onOpenSchedule(detailPatient)}
        />
      ) : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50/60 px-2 py-0.5">
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <strong className="text-sm font-black leading-none text-slate-950">
        {value}
      </strong>
    </span>
  );
}

function SeverityRow({
  label,
  total,
  tone,
  value,
}: {
  label: string;
  total: number;
  tone: (typeof severityOrder)[number];
  value: number;
}) {
  const barClass =
    {
      critical: "bg-red-500",
      moderate: "bg-amber-500",
      mild: "bg-violet-500",
      normal: "bg-emerald-500",
    }[tone] || "bg-[var(--primary)]";
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="grid gap-1.5 rounded-[0.9rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-2.5">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span className="text-sm font-bold text-slate-800">{label}</span>
        <span className="text-sm font-semibold text-slate-300">{`${value} / ${percentage}%`}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ApiErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <span>{message}</span>
      <button
        type="button"
        className="w-fit rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
        onClick={onRetry}
      >
        Retry patients
      </button>
    </div>
  );
}
