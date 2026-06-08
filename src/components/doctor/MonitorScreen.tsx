import { useMemo, useState } from "react";
import Icon from "../common/Icon";
import { Modal } from "../common/Modal";
import { useToast } from "../common/Toast";
import { clinicalSummaries, patients } from "../../data/doctorData";
import AlertSection from "./AlertSection";
import {
  primaryButtonClass,
  secondaryButtonClass,
  tabButtonClass,
} from "./dashboardShared";

export default function MonitorScreen({ onOpenSchedule }) {
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { showToast } = useToast();
  const wrappers = useMemo(
    () =>
      clinicalSummaries.map((summary) => ({
        summary,
        patient:
          patients.find((patient) => patient.id === summary.patientId) ||
          patients[0],
      })),
    [],
  );
  const critical = wrappers.filter(
    (item) => item.summary.severity === "critical",
  );
  const moderate = wrappers.filter(
    (item) => item.summary.severity === "moderate",
  );
  const shownCritical = filter === "moderate" ? [] : critical;
  const shownModerate = filter === "critical" ? [] : moderate;
  const avgConfidence = Math.round(
    (wrappers.reduce((sum, item) => sum + item.summary.confidenceScore, 0) /
      wrappers.length) *
      100,
  );

  function refreshNow() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast("Monitor refreshed.", "success");
    }, 650);
  }

  return (
    <div className="grid w-full max-w-none gap-5 p-4 sm:p-6 lg:gap-6 lg:p-8">
      <section className="rounded-2xl border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--primary)]">
              <Icon name="activity" size={14} />
              Realtime monitor
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Clinical signals that need attention
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2">
                <b className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
                Live stream
              </span>
              <span>Updates every 30s</span>
              <span>{wrappers.length} active summaries</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--doctor-line)] bg-[var(--doctor-card)] text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]"
              onClick={() => setSettingsOpen(true)}
              aria-label="Monitor filters"
              title="Monitor filters"
            >
              <Icon name="sliders-horizontal" size={20} />
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--doctor-line)] bg-[var(--doctor-card)] text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]"
              onClick={refreshNow}
              aria-label="Refresh monitor"
              title="Refresh monitor"
            >
              <Icon
                name="refresh-cw"
                size={20}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 grid w-full gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-left shadow-[0_10px_24px_rgba(239,68,68,0.08)] transition hover:-translate-y-0.5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          onClick={() => setFilter("critical")}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-600 text-white shadow-[0_10px_22px_rgba(239,68,68,0.22)]">
            <Icon name="triangle-alert" size={20} color="#fff" />
          </span>
          <span>
            <strong className="block text-base font-black text-red-700">
              {critical.length} high-risk patients need review
            </strong>
            <span className="mt-1 block text-sm font-semibold text-red-600">
              Acute changes in mood, HRV, or sleep were detected in the latest
              stream.
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-black text-red-700">
            View
            <Icon name="chevron-right" size={18} />
          </span>
        </button>
      </section>

      <section className="grid gap-4 rounded-2xl border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tabButtonClass(filter === "all")}
            onClick={() => setFilter("all")}
          >
            All alerts
          </button>
          <button
            type="button"
            className={tabButtonClass(filter === "critical")}
            onClick={() => setFilter("critical")}
          >
            Critical
          </button>
          <button
            type="button"
            className={tabButtonClass(filter === "moderate")}
            onClick={() => setFilter("moderate")}
          >
            Moderate
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700">
            <Icon name="podcast" size={16} color="#047857" />
            Live connection
          </span>
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-sm font-black text-[var(--primary)] transition hover:bg-violet-50"
            onClick={refreshNow}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh now"}
          </button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MonitorStat
          icon="triangle-alert"
          label="Critical"
          note="Immediate review"
          tone="red"
          value={critical.length}
        />
        <MonitorStat
          icon="bell"
          label="Moderate"
          note="Watch closely"
          tone="amber"
          value={moderate.length}
        />
        <MonitorStat
          icon="shield-check"
          label="Avg confidence"
          note="Model signal quality"
          tone="violet"
          value={`${avgConfidence}%`}
        />
      </div>

      <AlertSection
        title="High-risk alerts"
        tone="critical"
        items={shownCritical}
        onOpenSchedule={onOpenSchedule}
      />
      <AlertSection
        title="Moderate alerts"
        tone="moderate"
        items={shownModerate}
        onOpenSchedule={onOpenSchedule}
      />

      {settingsOpen ? (
        <Modal
          title="Monitor Settings"
          onClose={() => setSettingsOpen(false)}
          actions={
            <>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => {
                  showToast("Monitor preferences saved.", "success");
                  setSettingsOpen(false);
                }}
              >
                Save settings
              </button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingToggle
              title="Acute mood drop"
              description="Alert when a patient's mood score falls sharply within the week."
              checked
            />
            <SettingToggle
              title="HRV deviation"
              description="Alert when HRV moves significantly below baseline."
              checked
            />
            <SettingToggle
              title="Sleep decline"
              description="Flag poor sleep efficiency across multiple nights."
              checked
            />
            <SettingToggle
              title="Journal risk terms"
              description="Surface high-risk language from recent entries."
              checked
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function MonitorStat({ icon, label, note, tone, value }) {
  const styles = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    violet: "bg-violet-50 text-[var(--primary)] border-violet-200",
  };

  return (
    <article className="rounded-2xl border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl border ${styles[tone] || styles.violet}`}
        >
          <Icon name={icon} size={20} />
        </span>
        <strong className="text-3xl font-black text-slate-950">{value}</strong>
      </div>
      <div className="mt-4">
        <small className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          {label}
        </small>
        <p className="mt-1 text-sm font-semibold text-slate-500">{note}</p>
      </div>
    </article>
  );
}

function SettingToggle({ title, description, checked }) {
  const [enabled, setEnabled] = useState(checked);

  return (
    <button
      type="button"
      className="grid gap-3 rounded-xl border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4 text-left transition hover:bg-slate-50"
      onClick={() => setEnabled((current) => !current)}
    >
      <span className="flex items-start justify-between gap-3">
        <strong className="text-sm font-black text-slate-950">{title}</strong>
        <span
          className={`grid h-6 w-11 items-center rounded-full p-1 transition ${enabled ? "justify-end bg-[var(--primary)]" : "justify-start bg-slate-200"}`}
        >
          <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
        </span>
      </span>
      <span className="text-sm font-semibold leading-6 text-slate-500">
        {description}
      </span>
    </button>
  );
}
