import { timeCountdown } from "../../data/doctorData";
import { formatDateTime } from "./dashboardShared";
import SeverityPill from "./SeverityPill";

export default function SessionSnippet({ session }) {
  return (
    <article className="doctor-card-gradient grid gap-2 rounded-lg border border-violet-100 bg-violet-50/60 p-4">
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
