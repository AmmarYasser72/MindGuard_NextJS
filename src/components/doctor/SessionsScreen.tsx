import { useState } from "react";
import Icon from "../common/Icon";
import EmptyPanel from "./EmptyPanel";
import SessionCard from "./SessionCard";
import { primaryButtonClass, tabButtonClass } from "./dashboardShared";
import type { DoctorSession } from "../../types/doctor";

type SessionsScreenProps = {
  error?: string;
  isLoading: boolean;
  onDeleteSession: (session: DoctorSession) => void;
  onEditSession: (session: DoctorSession) => void;
  onOpenSchedule: () => void;
  onRetry: () => void;
  sessions?: DoctorSession[];
};

function isUpcomingSession(session: DoctorSession) {
  return !["cancelled", "completed"].includes(session.status || "") && session.scheduledAt >= new Date();
}

export default function SessionsScreen({
  error,
  isLoading,
  onDeleteSession,
  onEditSession,
  onOpenSchedule,
  onRetry,
  sessions = [],
}: SessionsScreenProps) {
  const [tab, setTab] = useState("upcoming");
  const upcoming = sessions.filter(isUpcomingSession);
  const past = sessions.filter((session) => !isUpcomingSession(session));
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="grid w-full max-w-none gap-4 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Sessions</h1>
          <p className="text-sm font-medium text-slate-500">{shown.length} {tab} sessions</p>
        </div>
        <button type="button" className={primaryButtonClass} onClick={onOpenSchedule} disabled={isLoading}><Icon name="plus" size={20} color="#fff" />New session</button>
      </header>

      <div className="grid max-w-md grid-cols-2 rounded-lg border border-violet-100 bg-white p-1 shadow-sm shadow-violet-950/5">
        <button type="button" className={tabButtonClass(tab === "upcoming")} onClick={() => setTab("upcoming")}>Upcoming</button>
        <button type="button" className={tabButtonClass(tab === "past")} onClick={() => setTab("past")}>Past</button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading ? <EmptyPanel message="Loading slots from the backend..." /> : null}
        {!isLoading && error ? <ApiErrorPanel message={error} onRetry={onRetry} /> : null}
        {!isLoading && !error && shown.length ? shown.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isPast={tab === "past"}
            onDelete={() => onDeleteSession(session)}
            onEdit={() => onEditSession(session)}
          />
        )) : null}
        {!isLoading && !error && !shown.length ? <EmptyPanel message={tab === "past" ? "No past sessions" : "No upcoming sessions"} /> : null}
      </div>
    </div>
  );
}

function ApiErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 lg:col-span-2">
      <span>{message}</span>
      <button type="button" className="w-fit rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700" onClick={onRetry}>
        Retry slots
      </button>
    </div>
  );
}
