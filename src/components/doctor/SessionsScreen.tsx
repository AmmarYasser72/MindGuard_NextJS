import { useState } from "react";
import Icon from "../common/Icon";
import { useToast } from "../common/Toast";
import EmptyPanel from "./EmptyPanel";
import SessionCard from "./SessionCard";
import {
  DeleteSessionModal,
  EditSessionModal,
  LiveSessionModal,
  SessionReviewModal,
} from "./SessionModals";
import {
  primaryButtonClass,
  tabButtonClass,
} from "./dashboardShared";
import {
  compareSessionsByRemainingTime,
  isConfirmedUpcomingSession,
} from "./doctorHome/doctorHomeUtils";
import type { DoctorSession } from "../../types/doctor";

type SessionTab = "upcoming" | "available" | "past";

type SessionsScreenProps = {
  error?: string;
  isLoading: boolean;
  onDeleteSession: (session: DoctorSession) => Promise<void> | void;
  onEditSession: (session: DoctorSession) => Promise<void> | void;
  onOpenSchedule: () => void;
  onRetry: () => void;
  sessions?: DoctorSession[];
};

export default function SessionsScreen({
  error,
  isLoading,
  onDeleteSession,
  onEditSession,
  onOpenSchedule,
  onRetry,
  sessions = [],
}: SessionsScreenProps) {
  const [tab, setTab] = useState<SessionTab>("upcoming");
  const [editingSession, setEditingSession] = useState<DoctorSession | null>(
    null,
  );
  const [deleteSession, setDeleteSession] = useState<DoctorSession | null>(
    null,
  );
  const [reviewSession, setReviewSession] = useState<DoctorSession | null>(
    null,
  );
  const [liveSession, setLiveSession] = useState<DoctorSession | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const { showToast } = useToast();
  const upcoming = sessions
    .filter(isConfirmedUpcomingSession)
    .sort(compareSessionsByRemainingTime);
  const available = sessions
    .filter(isAvailableFutureSession)
    .sort(compareSessionsByRemainingTime);
  const past = sessions
    .filter(
      (session) =>
        !isConfirmedUpcomingSession(session) &&
        !isAvailableFutureSession(session),
    )
    .sort(compareSessionsByRemainingTime);
  const shown =
    tab === "upcoming" ? upcoming : tab === "available" ? available : past;

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
          <p className="text-sm font-medium text-slate-500">
            {shown.length}{" "}
            {tab === "available" ? "available slots" : `${tab} sessions`}
          </p>
        </div>
        <button
          type="button"
          className={primaryButtonClass}
          onClick={onOpenSchedule}
          disabled={isLoading}
        >
          <Icon name="plus" size={20} color="#fff" />
          New session
        </button>
      </header>

      <div className="grid max-w-2xl grid-cols-3 rounded-lg border border-violet-100 bg-white p-1 shadow-sm shadow-violet-950/5">
        <button
          type="button"
          className={tabButtonClass(tab === "upcoming")}
          onClick={() => setTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          type="button"
          className={tabButtonClass(tab === "available")}
          onClick={() => setTab("available")}
        >
          Available
        </button>
        <button
          type="button"
          className={tabButtonClass(tab === "past")}
          onClick={() => setTab("past")}
        >
          Past
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading ? (
          <EmptyPanel message="Loading slots from the backend..." />
        ) : null}
        {!isLoading && error ? (
          <ApiErrorPanel message={error} onRetry={onRetry} />
        ) : null}
        {!isLoading && !error && shown.length
          ? shown.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isPast={tab === "past"}
                onDelete={() => setDeleteSession(session)}
                onEdit={() => setEditingSession(session)}
                onReview={() => setReviewSession(session)}
                onStart={() => setLiveSession(session)}
              />
            ))
          : null}
        {!isLoading && !error && !shown.length ? (
          <EmptyPanel message={emptyMessageForTab(tab)} />
        ) : null}
      </div>

      {editingSession ? (
        <EditSessionModal
          session={editingSession}
          isSaving={isMutating}
          onClose={() => setEditingSession(null)}
          onSave={submitEdit}
        />
      ) : null}
      {deleteSession ? (
        <DeleteSessionModal
          session={deleteSession}
          isDeleting={isMutating}
          onClose={() => setDeleteSession(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
      {reviewSession ? (
        <SessionReviewModal
          session={reviewSession}
          onClose={() => setReviewSession(null)}
          onSave={() => {
            showToast("Session review saved.", "success");
            setReviewSession(null);
          }}
        />
      ) : null}
      {liveSession ? (
        <LiveSessionModal
          session={liveSession}
          onClose={() => setLiveSession(null)}
          onSave={() => {
            showToast("Session note saved.", "success");
            setLiveSession(null);
          }}
        />
      ) : null}
    </div>
  );
}

function isAvailableFutureSession(session: DoctorSession) {
  const status = String(session.status || session.raw?.status || "")
    .trim()
    .toLowerCase();

  return (
    session.scheduledAt >= new Date() &&
    status === "available" &&
    !hasSessionPatient(session)
  );
}

function hasSessionPatient(session: DoctorSession) {
  const name = String(session.patientName || "")
    .trim()
    .toLowerCase();

  return Boolean(
    session.patientId ||
      session.raw?.patient ||
      session.raw?.patientId ||
      session.raw?.patientEmail ||
      (name &&
        name !== "unassigned" &&
        name !== "open to patients" &&
        name !== "open to all patients"),
  );
}

function emptyMessageForTab(tab: SessionTab) {
  if (tab === "available") return "No available time slots";
  if (tab === "past") return "No past sessions";
  return "No upcoming sessions";
}

function ApiErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 lg:col-span-2">
      <span>{message}</span>
      <button
        type="button"
        className="w-fit rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
        onClick={onRetry}
      >
        Retry slots
      </button>
    </div>
  );
}
