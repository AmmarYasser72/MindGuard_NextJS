import { useState } from "react";
import LineChart from "../common/LineChart";
import { Modal } from "../common/Modal";
import Icon from "../common/Icon";
import { lastSeenLabel, patientName } from "../../data/doctorData";
import ConditionPill from "./ConditionPill";
import SeverityPill from "./SeverityPill";
import {
  primaryButtonClass,
  surfaceClass,
  tabButtonClass,
} from "./dashboardShared";

export default function PatientDetails({ patient, onClose, onSchedule }) {
  const [tab, setTab] = useState("Overview");
  const warnings = patient.warnings || [];
  const ageGenderLabel = [patient.age, patient.gender].filter(Boolean).join("");

  return (
    <Modal
      title={patientName(patient)}
      onClose={onClose}
      actions={
        <button
          type="button"
          className={primaryButtonClass}
          onClick={onSchedule}
        >
          Schedule Session
        </button>
      }
    >
      <div className="grid gap-4">
        {warnings.length ? (
          <div className="grid gap-2">
            {warnings.map((warning) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"
                key={warning}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white">
                  <Icon name="triangle-alert" size={16} color="#fff" />
                </span>
                {warning}
              </div>
            ))}
          </div>
        ) : null}

        <section className={surfaceClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {patientName(patient)}
                {ageGenderLabel ? `, ${ageGenderLabel}` : ""}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {patient.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SeverityPill severity={patient.severity} />
              <ConditionPill condition={patient.condition} />
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500 sm:grid-cols-2">
            <span>
              Last active: {lastSeenLabel(patient).replace("Last: ", "")}
            </span>
            <span>Next session: Not scheduled</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {["Overview", "Mood", "Sleep", "HRV", "Journal"].map((item) => (
            <button
              type="button"
              className={tabButtonClass(tab === item)}
              key={item}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <PatientDetailTab patient={patient} tab={tab} />
      </div>
    </Modal>
  );
}

function PatientDetailTab({ patient, tab }) {
  if (tab === "Mood") {
    const currentMood = patient.mood ?? 0;
    const firstTrend = patient.trend?.[0] ?? currentMood;
    const trendDelta = Math.round(currentMood - firstTrend);

    return (
      <div className="grid gap-4">
        <section className={surfaceClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <small className="text-xs font-black uppercase text-[var(--primary)]">
                Mood trend
              </small>
              <h3 className="mt-1 text-lg font-bold text-slate-950">
                {currentMood || "No"} / 100 latest score
              </h3>
            </div>
            <span
              className={`rounded-lg px-3 py-2 text-xs font-black ${trendDelta < 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              {trendDelta >= 0 ? "+" : ""}
              {trendDelta} this week
            </span>
          </div>
          <LineChart
            data={
              patient.trend?.length
                ? patient.trend
                : [currentMood, currentMood, currentMood]
            }
            color="#6366f1"
          />
        </section>
        <InsightGrid
          items={[
            [
              "Risk signal",
              currentMood < 40 ? "Elevated" : "Monitored",
              currentMood < 40 ? "#ef4444" : "#6366f1",
            ],
            [
              "Suggested action",
              currentMood < 40 ? "Schedule check-in" : "Continue care plan",
              "#10b981",
            ],
            [
              "Patient context",
              patient.journal
                ? "Recent journal available"
                : "No recent journal",
              "#8b5cf6",
            ],
          ]}
        />
      </div>
    );
  }

  if (tab === "Sleep") {
    const sleepPercent =
      patient.sleep === null || patient.sleep === undefined
        ? 0
        : Math.round(patient.sleep * 100);

    return (
      <div className="grid gap-4">
        <InsightGrid
          items={[
            [
              "Sleep efficiency",
              sleepPercent ? `${sleepPercent}%` : "No data",
              sleepPercent < 65 ? "#ef4444" : "#10b981",
            ],
            [
              "Clinical note",
              sleepPercent < 65
                ? "Poor rest may amplify symptoms"
                : "Sleep is supporting recovery",
              "#6366f1",
            ],
            ["Next step", "Review bedtime consistency", "#8b5cf6"],
          ]}
        />
        <section className={`${surfaceClass} grid gap-3`}>
          {[
            "Ask about awakenings and nightmares.",
            "Compare sleep changes with mood movement.",
            "Consider a shorter evening routine goal.",
          ].map((item) => (
            <p
              className="flex items-center gap-3 text-sm font-semibold text-slate-600"
              key={item}
            >
              <Icon name="moon" size={20} color="#8b5cf6" />
              {item}
            </p>
          ))}
        </section>
      </div>
    );
  }

  if (tab === "HRV") {
    const hrv = patient.hrv ?? 0;
    const deviation = patient.hrvDeviation ?? 0;

    return (
      <div className="grid gap-4">
        <InsightGrid
          items={[
            ["Latest HRV", hrv ? `${hrv} ms` : "No data", "#6366f1"],
            [
              "Baseline movement",
              `${deviation > 0 ? "+" : ""}${Math.round(deviation)}%`,
              deviation < -20 ? "#ef4444" : "#10b981",
            ],
            [
              "Readiness",
              deviation < -20 ? "Reduced resilience" : "Within expected range",
              "#8b5cf6",
            ],
          ]}
        />
        <section className={surfaceClass}>
          <small className="text-xs font-black uppercase text-slate-400">
            Interpretation
          </small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            HRV is shown as a supporting signal, not a diagnosis. Pair it with
            mood, sleep, and patient narrative before changing the care plan.
          </p>
        </section>
      </div>
    );
  }

  if (tab === "Journal") {
    return (
      <div className="grid gap-4">
        <section className={surfaceClass}>
          <small className="text-xs font-black uppercase text-[var(--primary)]">
            Latest journal
          </small>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
            {patient.journal ||
              "No journal entry is attached to this patient record yet."}
          </p>
        </section>
        <InsightGrid
          items={[
            [
              "Tone",
              patient.journal ? journalTone(patient.journal) : "Unavailable",
              "#6366f1",
            ],
            [
              "Follow-up",
              patient.journal
                ? "Discuss entry themes"
                : "Encourage first entry",
              "#10b981",
            ],
            ["Privacy", "Use during clinical review only", "#8b5cf6"],
          ]}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <InsightGrid
        items={[
          [
            "Mood",
            patient.mood === null || patient.mood === undefined
              ? "No data"
              : `${patient.mood}/100`,
            "#6366f1",
          ],
          [
            "Sleep",
            patient.sleep === null || patient.sleep === undefined
              ? "No data"
              : `${Math.round(patient.sleep * 100)}%`,
            "#10b981",
          ],
          [
            "HRV",
            patient.hrv === null || patient.hrv === undefined
              ? "No data"
              : `${patient.hrv} ms`,
            "#ef4444",
          ],
        ]}
      />
      <section className={surfaceClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <small className="text-xs font-black uppercase text-[var(--primary)]">
              Seven day trend
            </small>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              Mood trajectory
            </h3>
          </div>
        </div>
        <LineChart
          data={
            patient.trend?.length
              ? patient.trend
              : [patient.mood || 0, patient.mood || 0, patient.mood || 0]
          }
          color="#6366f1"
        />
      </section>
      <section className={`${surfaceClass} grid gap-3`}>
        {carePlanItems(patient).map((item, index) => (
          <p
            className="flex items-center gap-3 text-sm font-semibold text-slate-600"
            key={item}
          >
            <Icon
              name={["calendar", "clock", "clipboard-list"][index]}
              size={20}
              color="#64748b"
            />
            {item}
          </p>
        ))}
      </section>
    </div>
  );
}

function InsightGrid({ items }) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {items.map(([label, value, color]) => (
        <div className={surfaceClass} key={label}>
          <small className="text-xs font-black uppercase text-slate-400">
            {label}
          </small>
          <strong
            className="mt-2 block text-lg font-black text-slate-950"
            style={{ color }}
          >
            {value}
          </strong>
        </div>
      ))}
    </section>
  );
}

function carePlanItems(patient) {
  const items: string[] = [];
  items.push(
    patient.severity === "critical"
      ? "Prioritize a same-day clinical check-in."
      : "Maintain the current follow-up cadence.",
  );
  items.push(
    patient.sleep && patient.sleep < 0.65
      ? "Add a sleep review to the next session."
      : "Keep monitoring sleep and HRV together.",
  );
  items.push(
    patient.journal
      ? "Use the latest journal entry to guide session agenda."
      : "Invite the patient to add a short journal note.",
  );
  return items;
}

function journalTone(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes("overwhelmed") ||
    lower.includes("unbearable") ||
    lower.includes("heavy")
  )
    return "Distressed";
  if (lower.includes("stable") || lower.includes("well")) return "Stable";
  return "Reflective";
}
