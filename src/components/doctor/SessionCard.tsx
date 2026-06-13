import Icon from "../common/Icon";
import {
  sessionTypeIcon,
  shortReason,
  timeCountdown,
} from "../../data/doctorData";
import ConditionPill from "./ConditionPill";
import SeverityPill from "./SeverityPill";
import {
  formatDateTime,
  formatTime,
  primaryButtonClass,
  secondaryButtonClass,
} from "./dashboardShared";
import { bookedAtDate } from "./doctorHome/doctorHomeUtils";

export default function SessionCard({
  session,
  isPast,
  onDelete,
  onEdit,
  onReview,
  onStart,
}) {
  const duration = session.duration
    ? `${session.duration} min`
    : "Duration unavailable";
  const bookedAt = bookedAtDate(session);
  const hasBookedPatient = Boolean(
    session.patientId ||
      session.raw?.patient ||
      session.raw?.patientId ||
      session.raw?.patientEmail,
  );
  const status = String(session.status || session.raw?.status || "")
    .trim()
    .toLowerCase();
  const isAvailableSlot = status === "available" && !hasBookedPatient;
  const patientDisplayName = isAvailableSlot
    ? "Open to patients"
    : session.patientName;
  const actionGridClass = isAvailableSlot
    ? "grid gap-3 sm:grid-cols-2"
    : "grid gap-3 sm:grid-cols-3";

  return (
    <article className="grid gap-4 rounded-lg border border-[var(--doctor-line)] bg-[var(--doctor-card)] p-5 shadow-sm shadow-violet-950/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">
            {formatTime(session.scheduledAt)}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-700">
            <Icon name={sessionTypeIcon(session.type)} size={18} />
            {patientDisplayName}
            <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs text-[var(--primary)]">
              {shortReason(session.reason)}
            </span>
          </p>
        </div>
        {session.severity ? <SeverityPill severity={session.severity} /> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {session.condition ? (
          <ConditionPill condition={session.condition} />
        ) : null}
        <span className="inline-flex min-h-6 items-center rounded-lg bg-violet-50 px-2 text-xs font-bold text-[var(--primary)]">
          {duration}
        </span>
        {!isPast ? (
          <span className="inline-flex min-h-6 items-center rounded-lg bg-white px-2 text-xs font-bold text-[var(--primary)] shadow-sm shadow-violet-950/5">
            {timeCountdown(session.scheduledAt)}
          </span>
        ) : null}
      </div>
      {bookedAt ? (
        <p className="text-xs font-semibold text-slate-500">
          Booked {formatDateTime(bookedAt)}
        </p>
      ) : null}
      <div className={actionGridClass}>
        {isAvailableSlot ? (
          <>
            <button
              type="button"
              className={primaryButtonClass}
              onClick={onEdit}
            >
              Edit slot
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onDelete}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={primaryButtonClass}
              onClick={isPast ? onReview : onStart}
            >
              {isPast ? "Review" : "Start"}
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onDelete}
            >
              {hasBookedPatient ? "Cancel" : "Delete"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
