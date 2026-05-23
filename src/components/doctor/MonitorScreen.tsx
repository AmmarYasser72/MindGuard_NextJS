import { useMemo, useState } from "react";
import Icon from "../common/Icon";
import { Modal } from "../common/Modal";
import { useToast } from "../common/Toast";
import {
  clinicalSummaries,
  patients,
} from "../../data/doctorData";
import AlertSection from "./AlertSection";
import { primaryButtonClass, secondaryButtonClass, tabButtonClass } from "./dashboardShared";

export default function MonitorScreen({ onOpenSchedule }) {
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { showToast } = useToast();
  const wrappers = useMemo(() => clinicalSummaries.map((summary) => ({
    summary,
    patient: patients.find((patient) => patient.id === summary.patientId) || patients[0],
  })), []);
  const critical = wrappers.filter((item) => item.summary.severity === "critical");
  const moderate = wrappers.filter((item) => item.summary.severity === "moderate");
  const shownCritical = filter === "moderate" ? [] : critical;
  const shownModerate = filter === "critical" ? [] : moderate;

  function refreshNow() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast("Monitor refreshed.", "success");
    }, 650);
  }

  return (
    <div className="grid w-full max-w-none gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Realtime Monitor</h1>
          <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><b className="h-2 w-2 rounded-full bg-emerald-500" /> Live stream - Every 30s</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]" onClick={() => setSettingsOpen(true)} aria-label="Monitor filters" title="Monitor filters"><Icon name="sliders-horizontal" size={20} /></button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]" onClick={refreshNow} aria-label="Refresh monitor" title="Refresh monitor"><Icon name="refresh-cw" size={20} className={isRefreshing ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <button type="button" className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-600 p-4 text-left text-sm font-bold text-white shadow-sm transition hover:bg-red-700" onClick={() => setFilter("critical")}>
        <Icon name="triangle-alert" size={18} color="#fff" />
        <span className="min-w-0 flex-1">{critical.length} high-risk patients with acute changes in mood and HRV need attention.</span>
        <Icon name="chevron-right" size={18} color="#fff" />
      </button>

      <section className="grid gap-3 rounded-lg border border-violet-100 bg-white p-4 shadow-sm shadow-violet-950/5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabButtonClass(filter === "all")} onClick={() => setFilter("all")}>All alerts</button>
          <button type="button" className={tabButtonClass(filter === "critical")} onClick={() => setFilter("critical")}>Critical</button>
          <button type="button" className={tabButtonClass(filter === "moderate")} onClick={() => setFilter("moderate")}>Moderate</button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Icon name="podcast" size={16} color="#047857" />Live connection</span>
          <button type="button" className="rounded-lg px-3 py-2 text-sm font-bold text-[var(--primary)] hover:bg-violet-50" onClick={refreshNow} disabled={isRefreshing}>{isRefreshing ? "Refreshing..." : "Refresh now"}</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MonitorStat label="Critical" value={critical.length} color="#ef4444" />
        <MonitorStat label="Moderate" value={moderate.length} color="#f59e0b" />
        <MonitorStat label="Avg confidence" value={`${Math.round((wrappers.reduce((sum, item) => sum + item.summary.confidenceScore, 0) / wrappers.length) * 100)}%`} color="#6366f1" />
      </div>

      <AlertSection title="High-risk alerts" tone="critical" items={shownCritical} onOpenSchedule={onOpenSchedule} />
      <AlertSection title="Moderate alerts" tone="moderate" items={shownModerate} onOpenSchedule={onOpenSchedule} />

      {settingsOpen ? (
        <Modal
          title="Monitor Settings"
          onClose={() => setSettingsOpen(false)}
          actions={(
            <>
              <button type="button" className={secondaryButtonClass} onClick={() => setSettingsOpen(false)}>Close</button>
              <button type="button" className={primaryButtonClass} onClick={() => { showToast("Monitor preferences saved.", "success"); setSettingsOpen(false); }}>Save settings</button>
            </>
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingToggle title="Acute mood drop" description="Alert when a patient's mood score falls sharply within the week." checked />
            <SettingToggle title="HRV deviation" description="Alert when HRV moves significantly below baseline." checked />
            <SettingToggle title="Sleep decline" description="Flag poor sleep efficiency across multiple nights." checked />
            <SettingToggle title="Journal risk terms" description="Surface high-risk language from recent entries." checked />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function MonitorStat({ label, value, color }) {
  return (
    <div className="rounded-lg border border-violet-100 bg-white p-4 shadow-sm shadow-violet-950/5">
      <small className="text-xs font-black uppercase text-slate-400">{label}</small>
      <strong className="mt-2 block text-2xl font-black text-slate-950" style={{ color }}>{value}</strong>
    </div>
  );
}

function SettingToggle({ title, description, checked }) {
  const [enabled, setEnabled] = useState(checked);

  return (
    <button type="button" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50" onClick={() => setEnabled((current) => !current)}>
      <span className="flex items-start justify-between gap-3">
        <strong className="text-sm font-black text-slate-950">{title}</strong>
        <span className={`grid h-6 w-11 items-center rounded-full p-1 transition ${enabled ? "justify-end bg-[var(--primary)]" : "justify-start bg-slate-200"}`}>
          <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
        </span>
      </span>
      <span className="text-sm font-semibold leading-6 text-slate-500">{description}</span>
    </button>
  );
}
