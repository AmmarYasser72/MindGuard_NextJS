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
  return value === null || value === undefined || value === ""
    ? "No data yet"
    : `${value}${suffix}`;
}

function sleepPercent(patient) {
  return patient.sleep === null || patient.sleep === undefined
    ? null
    : Math.round(patient.sleep * 100);
}

function trendDelta(patient) {
  if (
    !patient.trend?.length ||
    patient.mood === null ||
    patient.mood === undefined
  )
    return null;
  return Math.round(patient.mood - patient.trend[0]);
}

export default function PatientCard({
  patient,
  expanded,
  onToggle,
  onProfile,
  onSchedule,
}) {
  const trendNote = patient.trend?.length
    ? `From ${Math.round(patient.trend.at(-1))} last week`
    : "Backend has no trend yet";
  const sleep = sleepPercent(patient);
  const delta = trendDelta(patient);
  const riskMessage =
    patient.severity === "critical"
      ? "Needs same-day review"
      : patient.severity === "moderate"
        ? "Monitor closely this week"
        : "Stable enough for routine follow-up";

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-[var(--doctor-card-muted)] hover:shadow-[0_20px_44px_rgba(99,102,241,0.1)]">
      <button
        type="button"
        className="grid w-full gap-3.5 p-4 text-left transition hover:bg-white/30 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-[18px]"
        onClick={onToggle}
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,var(--primary),#8b5cf6)] text-base font-black text-white shadow-[0_10px_20px_rgba(99,102,241,0.22)]">
          {initials(patient)}
        </span>

        <span className="grid min-w-0 gap-2.5">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-lg font-black text-slate-950">
              {patientName(patient)}
            </strong>
            {ageGender(patient) ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                {ageGender(patient)}
              </span>
            ) : null}
            <SeverityPill severity={patient.severity} />
          </span>

          <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
            <span>{conditionLabels[patient.condition]}</span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-2">
              <MiniWave /> {lastSeenLabel(patient)}
            </span>
          </span>

          <span className="grid gap-2 md:grid-cols-3">
            <QuickSignal
              icon="smile"
              label="Mood"
              value={
                patient.mood === null || patient.mood === undefined
                  ? "No data"
                  : `${patient.mood}/100`
              }
              tone="violet"
            />
            <QuickSignal
              icon="moon"
              label="Sleep"
              value={sleep === null ? "No data" : `${sleep}%`}
              tone="blue"
            />
            <QuickSignal
              icon="heart-pulse"
              label="HRV"
              value={
                patient.hrv === null || patient.hrv === undefined
                  ? "No data"
                  : `${Math.round(patient.hrv)} ms`
              }
              tone="emerald"
            />
          </span>
        </span>

        <span className="flex items-center justify-between gap-3 sm:grid sm:justify-items-end">
          <span className="text-right">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Trend
            </span>
            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${
                delta !== null && delta < 0
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {delta === null ? "No trend" : `${delta >= 0 ? "+" : ""}${delta}`}
            </span>
          </span>
          <Icon
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748b"
          />
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-4 border-t border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4 sm:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-3">
                <MetricBlock
                  label="Latest mood"
                  value={valueOrMissing(patient.mood, "/100")}
                  note={trendNote}
                  tone="violet"
                />
                <MetricBlock
                  label="HRV"
                  value={valueOrMissing(patient.hrv, "ms")}
                  note={
                    patient.hrvDeviation === null ||
                    patient.hrvDeviation === undefined
                      ? "Backend has no HRV baseline yet"
                      : `${Math.abs(patient.hrvDeviation).toFixed(0)}% from baseline`
                  }
                  tone="red"
                />
                <MetricBlock
                  label="Sleep"
                  value={sleep === null ? "No data yet" : `${sleep}%`}
                  note="Efficiency last night"
                  tone="emerald"
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
                <div className="rounded-[1.15rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        Clinical snapshot
                      </p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">
                        {riskMessage}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 shadow-sm shadow-slate-900/5">
                      {patient.email}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                    {patient.journal
                      ? `"${patient.journal.slice(0, 160)}${patient.journal.length > 160 ? "..." : ""}"`
                      : "No recent journal entry is attached to this record yet."}
                  </p>
                </div>

                <div className="rounded-[1.15rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Next best action
                  </p>
                  <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                    {actionItems(patient, sleep).map((item) => (
                      <p className="flex items-start gap-2" key={item}>
                        <Icon name="check-line" size={16} color="#6366f1" />
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-[1.15rem] border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Monitoring summary
              </p>
              <div className="mt-3 grid gap-3">
                <SummaryTile
                  label="Response priority"
                  tone={patient.severity === "critical" ? "red" : "violet"}
                  value={riskMessage}
                />
                <SummaryTile
                  label="HRV baseline"
                  tone={
                    patient.hrvDeviation !== null &&
                    patient.hrvDeviation !== undefined &&
                    patient.hrvDeviation < -20
                      ? "red"
                      : "emerald"
                  }
                  value={
                    patient.hrvDeviation === null ||
                    patient.hrvDeviation === undefined
                      ? "Not enough data"
                      : `${patient.hrvDeviation > 0 ? "+" : ""}${Math.round(patient.hrvDeviation)}%`
                  }
                />
                <SummaryTile
                  label="Sleep signal"
                  tone={sleep !== null && sleep < 65 ? "amber" : "emerald"}
                  value={
                    sleep === null
                      ? "No sleep score"
                      : sleep < 65
                        ? "Poor rest may be amplifying symptoms"
                        : "Rest pattern is relatively supportive"
                  }
                />
              </div>
            </aside>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`${secondaryButtonClass} rounded-xl`}
              onClick={onProfile}
            >
              View full profile
            </button>
            <button
              type="button"
              className={`${primaryButtonClass} rounded-xl`}
              onClick={onSchedule}
            >
              Schedule session
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function QuickSignal({ icon, label, tone, value }) {
  const styles = {
    blue: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <span className="flex items-center gap-2 rounded-xl border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] px-3 py-2">
      <span
        className={`grid h-8 w-8 place-items-center rounded-full ${styles[tone] || styles.violet}`}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          {label}
        </span>
        <span className="truncate text-sm font-bold text-slate-700">
          {value}
        </span>
      </span>
    </span>
  );
}

function SummaryTile({ label, tone, value }) {
  const styles = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <div className={`rounded-xl border p-3 ${styles[tone] || styles.violet}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6">{value}</p>
    </div>
  );
}

function actionItems(patient, sleep) {
  return [
    patient.severity === "critical"
      ? "Prioritize a same-day outreach or rapid check-in."
      : "Keep the current follow-up cadence visible to the care team.",
    sleep !== null && sleep < 65
      ? "Review nighttime disruptions during the next session."
      : "Track sleep alongside mood before changing the care plan.",
    patient.journal
      ? "Use the latest journal note to set the session agenda."
      : "Prompt the patient for a short journal update before the next visit.",
  ];
}
