import { timeCountdown } from "../../data/doctorData";
import { formatDateTime } from "./dashboardShared";
import SeverityPill from "./SeverityPill";

export default function SessionSnippet({ session }) {
  return (
    <article className="grid gap-2 rounded-lg border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <strong className="truncate text-sm font-bold text-slate-900">
          {session.patientName}
        </strong>
        {session.severity ? <SeverityPill severity={session.severity} /> : null}
      </div>
      <small className="text-sm font-medium text-slate-500">
        {formatDateTime(session.scheduledAt)}
      </small>
      <em className="w-fit rounded-lg bg-white px-3 py-1 text-xs font-bold not-italic text-[var(--primary)] shadow-sm shadow-violet-950/5">
        {timeCountdown(session.scheduledAt)}
      </em>
    </article>
  );
}
