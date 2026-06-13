import Button from "../../../../components/common/Button";
import { Modal } from "../../../../components/common/Modal";
import type { DoctorSession } from "../../../../types/doctor";
import { formatAppointmentDate } from "./appointmentUtils";

type CancelAppointmentModalProps = {
  appointment: DoctorSession;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CancelAppointmentModal({
  appointment,
  isCancelling,
  onClose,
  onConfirm,
}: CancelAppointmentModalProps) {
  return (
    <Modal
      title="Cancel appointment"
      onClose={onClose}
      actions={
        <>
          <Button disabled={isCancelling} onClick={onClose} variant="ghost">
            Keep appointment
          </Button>
          <Button
            className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-100"
            disabled={isCancelling}
            icon="x"
            onClick={onConfirm}
          >
            {isCancelling ? "Cancelling..." : "Cancel appointment"}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-800">
        Cancel your appointment on{" "}
        <strong>{formatAppointmentDate(appointment.scheduledAt)}</strong>. The
        doctor will see this session as cancelled.
      </div>
    </Modal>
  );
}
