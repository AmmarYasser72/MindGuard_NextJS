import { useState } from "react";
import Icon from "../common/Icon";
import { Modal } from "../common/Modal";
import { useToast } from "../common/Toast";
import EmptyPanel from "./EmptyPanel";
import SessionCard from "./SessionCard";
import { fieldClass, formatDateTime, inputClass, primaryButtonClass, secondaryButtonClass, tabButtonClass } from "./dashboardShared";
import type { DoctorSession } from "../../types/doctor";

type SessionsScreenProps = {
  error?: string;
  isLoading: boolean;
  onDeleteSession: (session: DoctorSession) => Promise<void> | void;
  onEditSession: (session: DoctorSession) => Promise<void> | void;
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
  const [editingSession, setEditingSession] = useState<DoctorSession | null>(null);
  const [deleteSession, setDeleteSession] = useState<DoctorSession | null>(null);
  const [reviewSession, setReviewSession] = useState<DoctorSession | null>(null);
  const [liveSession, setLiveSession] = useState<DoctorSession | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const { showToast } = useToast();
  const upcoming = sessions.filter(isUpcomingSession);
  const past = sessions.filter((session) => !isUpcomingSession(session));
  const shown = tab === "upcoming" ? upcoming : past;

  async function submitEdit(session: DoctorSession) {
    setIsMutating(true);
    try {
      await onEditSession(session);
      setEditingSession(null);
    } finally {
      setIsMutating(false);
    }
  }

  async function confirmDelete() {
    if (!deleteSession) return;
    setIsMutating(true);
    try {
      await onDeleteSession(deleteSession);
      setDeleteSession(null);
    } finally {
      setIsMutating(false);
    }
  }

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
            onDelete={() => setDeleteSession(session)}
            onEdit={() => setEditingSession(session)}
            onReview={() => setReviewSession(session)}
            onStart={() => setLiveSession(session)}
          />
        )) : null}
        {!isLoading && !error && !shown.length ? <EmptyPanel message={tab === "past" ? "No past sessions" : "No upcoming sessions"} /> : null}
      </div>

      {editingSession ? <EditSessionModal session={editingSession} isSaving={isMutating} onClose={() => setEditingSession(null)} onSave={submitEdit} /> : null}
      {deleteSession ? <DeleteSessionModal session={deleteSession} isDeleting={isMutating} onClose={() => setDeleteSession(null)} onConfirm={confirmDelete} /> : null}
      {reviewSession ? <SessionReviewModal session={reviewSession} onClose={() => setReviewSession(null)} onSave={() => { showToast("Session review saved.", "success"); setReviewSession(null); }} /> : null}
      {liveSession ? <LiveSessionModal session={liveSession} onClose={() => setLiveSession(null)} onSave={() => { showToast("Session note saved.", "success"); setLiveSession(null); }} /> : null}
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

function EditSessionModal({ session, isSaving, onClose, onSave }: { session: DoctorSession; isSaving: boolean; onClose: () => void; onSave: (session: DoctorSession) => void }) {
  const [form, setForm] = useState(() => ({
    date: formatDateInput(session.scheduledAt),
    duration: String(session.duration || 60),
    reason: session.reason || "routineCheckIn",
    status: session.status || "available",
    time: formatTimeInput(session.scheduledAt),
    type: session.type || "video",
  }));
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError("");
    const start = new Date(`${form.date}T${form.time}`);
    const duration = Number(form.duration);

    if (Number.isNaN(start.getTime()) || !Number.isFinite(duration) || duration <= 0) {
      setError("Choose a valid date, time, and duration.");
      return;
    }

    const end = new Date(start.getTime() + duration * 60 * 1000);
    onSave({
      ...session,
      duration,
      reason: form.reason,
      scheduledAt: start,
      status: form.status,
      type: form.type,
      raw: {
        ...(session.raw || {}),
        endTime: end.toISOString(),
        startTime: start.toISOString(),
        status: form.status,
      },
    });
  }

  return (
    <Modal
      title="Edit Session"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="button" className={primaryButtonClass} onClick={save} disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
        </>
      )}
    >
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>Date<input className={inputClass} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
        <label className={fieldClass}>Time<input className={inputClass} type="time" value={form.time} onChange={(event) => update("time", event.target.value)} /></label>
        <label className={fieldClass}>Duration<select className={inputClass} value={form.duration} onChange={(event) => update("duration", event.target.value)}><option>30</option><option>45</option><option>60</option><option>90</option></select></label>
        <label className={fieldClass}>Status<select className={inputClass} value={form.status} onChange={(event) => update("status", event.target.value)}><option value="available">Available</option><option value="booked">Booked</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
        <label className={fieldClass}>Type<select className={inputClass} value={form.type} onChange={(event) => update("type", event.target.value)}><option value="video">Video</option><option value="audio">Audio</option><option value="inPerson">In person</option><option value="chat">Chat</option></select></label>
        <label className={fieldClass}>Reason<input className={inputClass} value={form.reason} onChange={(event) => update("reason", event.target.value)} /></label>
      </div>
    </Modal>
  );
}

function DeleteSessionModal({ session, isDeleting, onClose, onConfirm }: { session: DoctorSession; isDeleting: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      title="Delete Session"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose} disabled={isDeleting}>Cancel</button>
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-sm shadow-red-950/10 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</button>
        </>
      )}
    >
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
        Delete the session with {session.patientName} on {formatDateTime(session.scheduledAt)}. This removes the slot from the doctor schedule.
      </div>
    </Modal>
  );
}

function SessionReviewModal({ session, onClose, onSave }: { session: DoctorSession; onClose: () => void; onSave: () => void }) {
  const [outcome, setOutcome] = useState("Stable");
  const [notes, setNotes] = useState("");

  return (
    <Modal
      title="Session Review"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button>
          <button type="button" className={primaryButtonClass} onClick={onSave}>Save review</button>
        </>
      )}
    >
      <div className="grid gap-4">
        <section className="rounded-lg border border-violet-100 bg-violet-50 p-4">
          <small className="text-xs font-black uppercase text-[var(--primary)]">Completed session</small>
          <h3 className="mt-2 text-xl font-black text-slate-950">{session.patientName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{formatDateTime(session.scheduledAt)} - {session.duration || 60} min</p>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fieldClass}>Outcome<select className={inputClass} value={outcome} onChange={(event) => setOutcome(event.target.value)}><option>Stable</option><option>Improving</option><option>Needs follow-up</option><option>Escalate care</option></select></label>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <small className="text-xs font-black uppercase text-slate-400">Clinical flags</small>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Mood", "Sleep", "HRV", "Medication"].map((flag) => <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600" key={flag}>{flag}</span>)}
            </div>
          </div>
        </div>
        <label className={fieldClass}>Review notes<textarea className={`${inputClass} min-h-32 py-3`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add session summary, risk notes, and follow-up plan." /></label>
      </div>
    </Modal>
  );
}

function LiveSessionModal({ session, onClose, onSave }: { session: DoctorSession; onClose: () => void; onSave: () => void }) {
  const [note, setNote] = useState("");

  return (
    <Modal
      title="Session Room"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>End session</button>
          <button type="button" className={primaryButtonClass} onClick={onSave}>Save note</button>
        </>
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="grid min-h-64 place-items-center rounded-lg border border-violet-100 bg-[linear-gradient(135deg,#312e81_0%,#6366f1_58%,#8b5cf6_100%)] p-5 text-center text-white">
          <span>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/15"><Icon name="video" size={34} color="#fff" /></span>
            <strong className="mt-4 block text-2xl font-black">{session.patientName}</strong>
            <small className="mt-2 block text-sm font-bold text-violet-100">Ready for {session.type || "video"} session</small>
          </span>
        </section>
        <aside className="grid gap-3">
          <InfoPill icon="calendar" label="When" value={formatDateTime(session.scheduledAt)} />
          <InfoPill icon="timer" label="Duration" value={`${session.duration || 60} min`} />
          <InfoPill icon="activity" label="Status" value={session.status || "scheduled"} />
        </aside>
        <label className={`${fieldClass} lg:col-span-2`}>Live note<textarea className={`${inputClass} min-h-28 py-3`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Capture observations, care-plan updates, and follow-up tasks." /></label>
      </div>
    </Modal>
  );
}

function InfoPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Icon name={icon} size={18} color="#6366f1" />
      <small className="mt-3 block text-xs font-black uppercase text-slate-400">{label}</small>
      <strong className="mt-1 block text-sm text-slate-950">{value}</strong>
    </div>
  );
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
