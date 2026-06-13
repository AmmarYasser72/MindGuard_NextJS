import { useState } from "react";
import { Modal } from "../common/Modal";
import Icon from "../common/Icon";
import { lastSeenLabel, patientName } from "../../data/doctorData";
import ConditionPill from "./ConditionPill";
import SeverityPill from "./SeverityPill";
import { primaryButtonClass, tabButtonClass } from "./dashboardShared";
import OverviewStat from "./patientDetails/OverviewStat";
import PatientDetailTab from "./patientDetails/PatientDetailTab";

export default function PatientDetails({ patient, onClose, onSchedule }) {
  const [tab, setTab] = useState("Overview");
  const warnings = patient.warnings || [];
  const ageGenderLabel = [patient.age, patient.gender].filter(Boolean).join("");
  const sleepPercent =
    patient.sleep === null || patient.sleep === undefined
      ? null
      : Math.round(patient.sleep * 100);
  const trendDelta =
    patient.trend?.length && patient.mood !== null && patient.mood !== undefined
      ? Math.round(patient.mood - patient.trend[0])
      : null;

  return (
    <Modal
      title={patientName(patient)}
      onClose={onClose}
      actions={
        <button
          type="button"
          className={`${primaryButtonClass} rounded-xl`}
          onClick={onSchedule}
        >
          Schedule Session
        </button>
      }
    >
      <div className="grid gap-5">
        {warnings.length ? (
          <div className="grid gap-2">
            {warnings.map((warning) => (
              <div
                className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"
                key={warning}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white">
                  <Icon name="triangle-alert" size={16} color="#fff" />
                </span>
                {warning}
              </div>
            ))}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[1.5rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-[1.25rem] bg-[linear-gradient(135deg,var(--primary),#8b5cf6)] text-xl font-black text-white shadow-[0_16px_32px_rgba(99,102,241,0.24)]">
                  {initials(patient)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-950">
                      {patientName(patient)}
                      {ageGenderLabel ? `, ${ageGenderLabel}` : ""}
                    </h2>
                    <SeverityPill severity={patient.severity} />
                    <ConditionPill condition={patient.condition} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {patient.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm shadow-slate-900/5">
                      {lastSeenLabel(patient)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm shadow-slate-900/5">
                      Next session: Not scheduled
                    </span>
                  </div>
                </div>
              </div>

              <p className="max-w-2xl text-sm font-medium leading-6 text-slate-600">
                {patient.journal
                  ? `Latest note: "${patient.journal.slice(0, 180)}${patient.journal.length > 180 ? "..." : ""}"`
                  : "No journal entry is attached to this patient yet, so the monitoring view is relying mainly on sensor and activity data."}
              </p>
            </div>

            <div className="grid gap-3 rounded-[1.35rem] border border-white/80 bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                At a glance
              </p>
              <OverviewStat
                label="Mood score"
                tone="violet"
                value={
                  patient.mood === null || patient.mood === undefined
                    ? "No data"
                    : `${patient.mood}/100`
                }
              />
              <OverviewStat
                label="Sleep efficiency"
                tone="emerald"
                value={sleepPercent === null ? "No data" : `${sleepPercent}%`}
              />
              <OverviewStat
                label="Trend this week"
                tone={trendDelta !== null && trendDelta < 0 ? "red" : "blue"}
                value={
                  trendDelta === null
                    ? "No trend"
                    : `${trendDelta >= 0 ? "+" : ""}${trendDelta}`
                }
              />
            </div>
          </div>
        </section>

        <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {["Overview", "Mood", "Sleep", "HRV", "Journal"].map((item) => (
              <button
                type="button"
                className={`${tabButtonClass(tab === item)} rounded-xl`}
                key={item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <PatientDetailTab patient={patient} tab={tab} />
      </div>
    </Modal>
  );
}

function initials(patient) {
  return `${patient.firstName?.charAt(0) || "P"}${patient.lastName?.charAt(0) || ""}`.toUpperCase();
}
