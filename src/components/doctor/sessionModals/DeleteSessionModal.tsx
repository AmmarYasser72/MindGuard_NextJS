import { Modal } from "../../common/Modal";
import {
  formatDateTime,
  secondaryButtonClass,
} from "../dashboardShared";
import type { DoctorSession } from "../../../types/doctor";

export function DeleteSessionModal({
  session,
  isDeleting,
  onClose,
  onConfirm,
}: {
  session: DoctorSession;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const hasBookedPatient = Boolean(
    session.patientId || session.raw?.patient || session.raw?.patientId,
  );
  const title = hasBookedPatient ? "Cancel Session" : "Delete Session";
  const actionLabel = hasBookedPatient ? "Cancel session" : "Delete";

  return (
    <Modal
      title={title}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-sm shadow-red-950/10 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? hasBookedPatient
                ? "Cancelling..."
                : "Deleting..."
              : actionLabel}
          </button>
        </>
      }
    >
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
        {hasBookedPatient ? (
          <>
            Cancel the session with {session.patientName} on{" "}
            {formatDateTime(session.scheduledAt)}. The patient will receive a
            cancellation notification.
          </>
        ) : (
          <>
            Delete the open slot on {formatDateTime(session.scheduledAt)}. This
            removes it from the doctor schedule.
          </>
        )}
      </div>
    </Modal>
  );
}
