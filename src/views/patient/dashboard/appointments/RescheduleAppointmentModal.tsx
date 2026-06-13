import Button from "../../../../components/common/Button";
import { Modal } from "../../../../components/common/Modal";
import type { DoctorSession } from "../../../../types/doctor";
import AppointmentNotice from "./AppointmentNotice";
import { formatAppointmentDate } from "./appointmentUtils";

type RescheduleAppointmentModalProps = {
  appointment: DoctorSession;
  availableSlots: DoctorSession[];
  error: string;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onSave: () => void;
  onSelectSlot: (slotId: string) => void;
  selectedSlotId: string;
};

export default function RescheduleAppointmentModal({
  appointment,
  availableSlots,
  error,
  isLoading,
  isSaving,
  onClose,
  onRefresh,
  onSave,
  onSelectSlot,
  selectedSlotId,
}: RescheduleAppointmentModalProps) {
  return (
    <Modal
      title="Reschedule appointment"
      onClose={onClose}
      actions={
        <>
          <Button disabled={isSaving} onClick={onClose} variant="ghost">
            Close
          </Button>
          <Button
            className="rounded-xl bg-teal-600 hover:bg-teal-700 focus:ring-teal-200"
            disabled={!selectedSlotId || isLoading || isSaving}
            icon="calendar-check"
            onClick={onSave}
          >
            {isSaving ? "Rescheduling..." : "Confirm new time"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Current appointment
          </span>
          <strong className="mt-1 block text-sm font-black text-slate-950">
            {formatAppointmentDate(appointment.scheduledAt)}
          </strong>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
              Available options
            </span>
            <h3 className="mt-1 text-lg font-black text-slate-950">
              Choose a new time slot
            </h3>
          </div>
          <Button
            disabled={isLoading || isSaving}
            icon="refresh-cw"
            onClick={onRefresh}
            variant="ghost"
          >
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <AppointmentNotice message="Loading available time slots..." />
        ) : null}

        {!isLoading && !availableSlots.length ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            No future open slots are available for this doctor right now.
          </div>
        ) : null}

        {!isLoading && availableSlots.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {availableSlots.map((slot) => {
              const selected = slot.id === selectedSlotId;
              return (
                <button
                  type="button"
                  className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-950 shadow-sm shadow-teal-950/10"
                      : "border-slate-100 bg-slate-50 text-slate-700 hover:border-teal-200 hover:bg-white"
                  }`}
                  key={slot.id}
                  onClick={() => onSelectSlot(slot.id)}
                >
                  <span className="block text-sm font-black">
                    {formatAppointmentDate(slot.scheduledAt)}
                  </span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">
                    {slot.duration || 60} min - {slot.type || "video"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
