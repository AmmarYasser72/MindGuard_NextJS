import Icon from "../common/Icon";
import {
  clinicalSummaries,
  patients,
} from "../../data/doctorData";
import AlertSection from "./AlertSection";

export default function MonitorScreen({ onOpenSchedule }) {
  const wrappers = clinicalSummaries.map((summary) => ({
    summary,
    patient: patients.find((patient) => patient.id === summary.patientId) || patients[0],
  }));
  const critical = wrappers.filter((item) => item.summary.severity === "critical");
  const moderate = wrappers.filter((item) => item.summary.severity === "moderate");

  return (
    <div className="grid w-full max-w-none gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Realtime Monitor</h1>
          <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><b className="h-2 w-2 rounded-full bg-emerald-500" /> Live stream - Every 30s</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]"><Icon name="sliders-horizontal" size={20} /></button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]"><Icon name="more-horizontal" size={20} /></button>
        </div>
      </div>

      <section className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-600 p-4 text-sm font-bold text-white shadow-sm">
        <Icon name="triangle-alert" size={18} color="#fff" />
        <span className="min-w-0 flex-1">3 high-risk patients with acute changes in mood and HRV need attention.</span>
        <Icon name="chevron-right" size={18} color="#fff" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Icon name="podcast" size={16} color="#047857" />Live connection</span>
        <button type="button" className="rounded-lg px-3 py-2 text-sm font-bold text-[var(--primary)] hover:bg-violet-50">Refresh now</button>
      </div>

      <AlertSection title="High-risk alerts" tone="critical" items={critical} onOpenSchedule={onOpenSchedule} />
      <AlertSection title="Moderate alerts" tone="moderate" items={moderate} onOpenSchedule={onOpenSchedule} />
    </div>
  );
}
