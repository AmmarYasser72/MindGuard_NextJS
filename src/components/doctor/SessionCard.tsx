import { useToast } from "../common/Toast";
import Icon from "../common/Icon";
import {
  sessionTypeIcon,
  shortReason,
} from "../../data/doctorData";
import ConditionPill from "./ConditionPill";
import SeverityPill from "./SeverityPill";
import { formatTime, primaryButtonClass, secondaryButtonClass } from "./dashboardShared";

export default function SessionCard({ session, isPast, onDelete, onEdit }) {
  const { showToast } = useToast();
  const duration = session.duration ? `${session.duration} min` : "Duration unavailable";

  return (
    <article className="grid gap-4 rounded-lg border border-violet-100 bg-white p-5 shadow-sm shadow-violet-950/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">{formatTime(session.scheduledAt)}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-700"><Icon name={sessionTypeIcon(session.type)} size={18} /> {session.patientName} <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs text-[var(--primary)]">{shortReason(session.reason)}</span></p>
        </div>
        {session.severity ? <SeverityPill severity={session.severity} /> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {session.condition ? <ConditionPill condition={session.condition} /> : null}
        <span className="inline-flex min-h-6 items-center rounded-lg bg-violet-50 px-2 text-xs font-bold text-[var(--primary)]">{duration}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" className={primaryButtonClass} onClick={() => showToast(isPast ? "Review - Coming soon" : "Session started")}>{isPast ? "Review" : "Start"}</button>
        <button type="button" className={secondaryButtonClass} onClick={onEdit}>Edit</button>
        <button type="button" className={secondaryButtonClass} onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}
