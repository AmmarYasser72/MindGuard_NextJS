import Icon from "../common/Icon";
import DonutChart from "../common/DonutChart";
import { conditionLabels } from "../../data/doctorData";
import ActionIcon from "./ActionIcon";
import DoctorStat from "./DoctorStat";
import EmptyPanel from "./EmptyPanel";
import SessionSnippet from "./SessionSnippet";
import { surfaceClass } from "./dashboardShared";
import type { DoctorPatient, DoctorSession } from "../../types/doctor";

type DoctorHomeProps = {
  onNavigate: (destination: string) => void;
  onRefresh: () => void;
  patientError?: string;
  patients?: DoctorPatient[];
  sessions?: DoctorSession[];
  slotError?: string;
};

function isToday(date: Date) {
  const current = new Date();
  return date.getFullYear() === current.getFullYear()
    && date.getMonth() === current.getMonth()
    && date.getDate() === current.getDate();
}

export default function DoctorHome({ onNavigate, onRefresh, patientError, patients = [], sessions = [], slotError }: DoctorHomeProps) {
  const conditionDistribution = patients.reduce((totals, patient) => {
    const condition = patient.condition || "none";
    return { ...totals, [condition]: (totals[condition] || 0) + 1 };
  }, { anxiety: 0, stress: 0, depression: 0, mixed: 0, none: 0 });
  const segments = [
    { label: conditionLabels.anxiety, value: conditionDistribution.anxiety, color: "#6366f1" },
    { label: conditionLabels.stress, value: conditionDistribution.stress, color: "#8b5cf6" },
    { label: conditionLabels.depression, value: conditionDistribution.depression, color: "#ec4899" },
    { label: conditionLabels.mixed, value: conditionDistribution.mixed, color: "#10b981" },
    { label: "No significant condition", value: conditionDistribution.none, color: "#94a3b8" },
  ];
  const totalPanel = segments.reduce((sum, segment) => sum + segment.value, 0);
  const leadingCondition = [...segments].sort((a, b) => b.value - a.value)[0];
  const leadingPercent = totalPanel ? Math.round((leadingCondition.value / totalPanel) * 100) : 0;
  const upcoming = sessions.filter((item) => item.scheduledAt >= new Date() && item.status !== "cancelled").slice(0, 6);
  const activeToday = patients.filter((patient) => patient.lastSeen && isToday(patient.lastSeen)).length;
  const criticalCount = patients.filter((patient) => patient.severity === "critical").length;
  const sessionsToday = sessions.filter((session) => isToday(session.scheduledAt)).length;

  return (
    <div className="grid w-full max-w-none gap-5 p-4 sm:p-6 lg:p-8">
      {patientError || slotError ? (
        <section className="grid gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {patientError ? <span>Patients API: {patientError}</span> : null}
          {slotError ? <span>Slots API: {slotError}</span> : null}
          <button type="button" className="w-fit rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700" onClick={onRefresh}>Retry dashboard APIs</button>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DoctorStat title="Total Patients" value={patients.length} icon="users" helper="Assigned panel" tone="violet" />
        <DoctorStat title="Active Today" value={activeToday} icon="activity" helper="Recent check-ins" tone="emerald" />
        <DoctorStat title="Critical Count" value={criticalCount} icon="triangle-alert" helper="Needs attention" tone="red" />
        <DoctorStat title="Sessions Today" value={sessionsToday} icon="calendar-days" helper="On the calendar" tone="amber" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)]">
        <section className="doctor-surface dashboard-surface overflow-hidden rounded-lg border">
          <div className="doctor-panel-head flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex min-h-7 items-center gap-2 rounded-lg bg-violet-50 px-2.5 text-xs font-black uppercase text-[var(--primary)] ring-1 ring-violet-100">
                <Icon name="chart-no-axes-combined" size={14} />
                Clinical mix
              </span>
              <h2 className="mt-3 text-xl font-black text-slate-950">Condition Distribution</h2>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">Current clinical mix across the assigned patient panel.</p>
            </div>
            <button type="button" className="dashboard-outline-btn inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold shadow-sm shadow-violet-950/5" onClick={onRefresh}>
              <Icon name="rotate-ccw" size={16} />
              Refresh
            </button>
          </div>

          <div className="grid gap-5 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="doctor-card-gradient rounded-lg border border-slate-100 bg-slate-50 p-4">
                <small className="text-xs font-black uppercase text-slate-400">Panel total</small>
                <strong className="mt-2 block text-2xl font-black text-slate-950">{totalPanel}</strong>
                <span className="text-xs font-semibold text-slate-500">assigned patients</span>
              </div>
              <div className="doctor-card-gradient rounded-lg border border-slate-100 bg-slate-50 p-4">
                <small className="text-xs font-black uppercase text-slate-400">Largest group</small>
                <strong className="mt-2 block truncate text-lg font-black text-slate-950">{leadingCondition.label}</strong>
                <span className="text-xs font-semibold text-slate-500">{leadingPercent}% of the panel</span>
              </div>
              <div className="doctor-card-gradient rounded-lg border border-slate-100 bg-slate-50 p-4">
                <small className="text-xs font-black uppercase text-slate-400">Tracked categories</small>
                <strong className="mt-2 block text-2xl font-black text-slate-950">{segments.length}</strong>
                <span className="text-xs font-semibold text-slate-500">condition cohorts</span>
              </div>
            </div>

            <DonutChart segments={segments} size={240} />
          </div>
        </section>

        <section className={surfaceClass}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Upcoming Sessions</h2>
              <p className="text-sm text-slate-500">{upcoming.length ? `Next ${upcoming.length} confirmed sessions` : "No confirmed sessions for the next few hours"}</p>
            </div>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)]" aria-label="Refresh sessions" onClick={onRefresh}>
              <Icon name="refresh-cw" size={18} />
            </button>
          </div>
          {upcoming.length ? (
            <div className="grid gap-3">
              {upcoming.slice(0, 4).map((session) => <SessionSnippet session={session} key={session.id} />)}
            </div>
          ) : <EmptyPanel message="No upcoming sessions in the next 24 hours." />}
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">Quick Actions</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <button type="button" className="doctor-action-card grid min-h-32 content-between rounded-lg border border-violet-100 bg-white p-4 text-left shadow-sm shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md" onClick={() => onNavigate("patients")}><ActionIcon icon="users" color="#6366f1" bg="#eef2ff" /><strong className="text-base text-slate-950">View All Patients</strong></button>
          <button type="button" className="doctor-action-card grid min-h-32 content-between rounded-lg border border-violet-100 bg-white p-4 text-left shadow-sm shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md" onClick={() => onNavigate("monitor")}><ActionIcon icon="activity" color="#ec4899" bg="#fce7f3" /><strong className="text-base text-slate-950">Real-Time Monitor</strong></button>
          <button type="button" className="doctor-action-card grid min-h-32 content-between rounded-lg border border-violet-100 bg-white p-4 text-left shadow-sm shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md" onClick={() => onNavigate("sessions")}><ActionIcon icon="calendar-plus" color="#10b981" bg="#d1fae5" /><strong className="text-base text-slate-950">Schedule Session</strong></button>
        </div>
      </section>
    </div>
  );
}
