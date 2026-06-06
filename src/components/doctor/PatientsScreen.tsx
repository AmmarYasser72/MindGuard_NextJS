import { useState } from "react";
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
  onOpenSchedule: (patient: DoctorPatient | null) => void;
  onRetry: () => void;
  patients?: DoctorPatient[];
};

export default function PatientsScreen({
  error,
  isLoading,
  onOpenSchedule,
  onRetry,
  patients = [],
}: PatientsScreenProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("sort");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailPatient, setDetailPatient] = useState<DoctorPatient | null>(
    null,
  );
  const filtered = patients.filter((patient) => {
    const matchesQuery = patientName(patient)
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter = filter === "sort" || patient.severity === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="grid w-full max-w-none gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Patients</h1>
          <p className="text-sm font-medium text-slate-500">
            {filtered.length} of {patients.length} patients shown
          </p>
        </div>
        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => onOpenSchedule(null)}
          disabled={isLoading}
        >
          <Icon name="calendar-plus" size={18} color="#fff" />
          Schedule
        </button>
      </div>

      <section className={surfaceClass}>
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-violet-100 bg-violet-50/50 px-3 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
            <Icon name="search" size={20} color="#6366f1" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search patients"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {["critical", "moderate", "mild", "normal", "sort"].map((item) => (
              <button
                type="button"
                className={filterButtonClass(filter === item)}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item === "sort" ? "All" : severityLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3">
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

function ApiErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <span>{message}</span>
      <button
        type="button"
        className="w-fit rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
        onClick={onRetry}
      >
        Retry patients
      </button>
    </div>
  );
}
