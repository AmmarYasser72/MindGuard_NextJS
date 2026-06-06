import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import { Modal } from "../../../components/common/Modal";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { slotService } from "../../../services/slotService";
import DashboardPanel from "./DashboardPanel";
import type { DoctorSession } from "../../../types/doctor";

type PatientAppointmentsSectionProps = {
  onNavigate: (path: string) => void;
};

function isUpcomingAppointment(session: DoctorSession) {
  const status = String(session.status || "").toLowerCase();
  return (
    !["available", "cancelled", "completed"].includes(status) &&
    session.scheduledAt.getTime() > Date.now()
  );
}

export default function PatientAppointmentsSection({
  onNavigate,
}: PatientAppointmentsSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<DoctorSession[]>([]);
  const [availableSlots, setAvailableSlots] = useState<DoctorSession[]>([]);
  const [cancelTarget, setCancelTarget] = useState<DoctorSession | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleTarget, setRescheduleTarget] =
    useState<DoctorSession | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const patientDetails = useMemo(
    () => ({
      patientEmail: user?.email || "",
      patientId: user?.uid || user?._id || user?.id || user?.email || "patient",
      patientName: user?.displayName || user?.email?.split("@")[0] || "Patient",
    }),
    [user],
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter(isUpcomingAppointment).slice(0, 4),
    [appointments],
  );

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const patientSlots = await slotService.getPatientSlots(patientDetails);
      setAppointments(patientSlots);
    } catch (loadError) {
      setAppointments([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load appointments.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [patientDetails]);

  useEffect(() => {
    window.queueMicrotask(loadAppointments);
  }, [loadAppointments]);

  const loadAvailableSlots = useCallback(async (appointment: DoctorSession) => {
    const doctorId = appointment.doctorId || "";
    setSelectedSlotId("");
    setAvailableSlots([]);
    setRescheduleError("");

    if (!doctorId) {
      setRescheduleError("This appointment does not include a doctor id.");
      return;
    }

    setIsLoadingSlots(true);
    try {
      const slots = await slotService.getDoctorAvailableSlots(doctorId);
      setAvailableSlots(slots);
    } catch (loadError) {
      setRescheduleError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load available time slots.",
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  function openReschedule(appointment: DoctorSession) {
    setRescheduleTarget(appointment);
    void loadAvailableSlots(appointment);
  }

  async function cancelAppointment() {
    if (!cancelTarget) return;

    setIsMutating(true);
    try {
      await slotService.updateSlot(cancelTarget.id, {
        cancelledAt: new Date().toISOString(),
        cancelledBy: "patient",
        patient: cancelTarget.patientId || cancelTarget.raw?.patient,
        patientEmail:
          cancelTarget.raw?.patientEmail || patientDetails.patientEmail,
        patientId: cancelTarget.patientId || patientDetails.patientId,
        patientName: cancelTarget.patientName || patientDetails.patientName,
        status: "cancelled",
      });
      setCancelTarget(null);
      await loadAppointments();
      showToast("Appointment cancelled.", "success");
    } catch (cancelError) {
      showToast(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel appointment.",
        "error",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function rescheduleAppointment() {
    if (!rescheduleTarget || !selectedSlotId) return;

    setIsMutating(true);
    setRescheduleError("");
    try {
      const bookedSlot = await slotService.bookSlot(
        selectedSlotId,
        patientDetails,
      );
      await slotService.updateSlot(rescheduleTarget.id, {
        cancelledAt: new Date().toISOString(),
        cancelledBy: "patient",
        patient: rescheduleTarget.patientId || rescheduleTarget.raw?.patient,
        patientEmail:
          rescheduleTarget.raw?.patientEmail || patientDetails.patientEmail,
        patientId: rescheduleTarget.patientId || patientDetails.patientId,
        patientName: rescheduleTarget.patientName || patientDetails.patientName,
        rescheduledTo: bookedSlot.id,
        status: "cancelled",
      });
      setRescheduleTarget(null);
      setSelectedSlotId("");
      setAvailableSlots([]);
      await loadAppointments();
      showToast("Appointment rescheduled.", "success");
    } catch (rescheduleFailure) {
      const message =
        rescheduleFailure instanceof Error
          ? rescheduleFailure.message
          : "Unable to reschedule appointment.";
      setRescheduleError(message);
      showToast(message, "error");
      if (rescheduleTarget) {
        await loadAvailableSlots(rescheduleTarget);
      }
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <section aria-labelledby="patient-appointments-heading">
      <DashboardPanel className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">
              Care schedule
            </span>
            <h2
              id="patient-appointments-heading"
              className="mt-1 text-lg font-black text-slate-950"
            >
              Upcoming appointments
            </h2>
          </div>
          <Button
            variant="ghost"
            icon="refresh-cw"
            onClick={loadAppointments}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        <div className="grid gap-3 p-5">
          {isLoading ? (
            <AppointmentNotice message="Loading your booked sessions..." />
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && upcomingAppointments.length
            ? upcomingAppointments.map((appointment) => (
                <AppointmentRow
                  appointment={appointment}
                  key={appointment.id}
                  onCancel={() => setCancelTarget(appointment)}
                  onReschedule={() => openReschedule(appointment)}
                />
              ))
            : null}

          {!isLoading && !error && !upcomingAppointments.length ? (
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <strong className="block text-sm font-black text-slate-900">
                  No upcoming appointments
                </strong>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Book a future slot with a recommended doctor when you are
                  ready.
                </p>
              </div>
              <Button
                className="rounded-2xl bg-teal-600 hover:bg-teal-700 focus:ring-teal-200"
                icon="calendar-plus"
                onClick={() => onNavigate("/doctor-recommendations")}
              >
                Book session
              </Button>
            </div>
          ) : null}
        </div>
      </DashboardPanel>

      {cancelTarget ? (
        <CancelAppointmentModal
          appointment={cancelTarget}
          isCancelling={isMutating}
          onClose={() => setCancelTarget(null)}
          onConfirm={cancelAppointment}
        />
      ) : null}

      {rescheduleTarget ? (
        <RescheduleAppointmentModal
          appointment={rescheduleTarget}
          availableSlots={availableSlots}
          error={rescheduleError}
          isLoading={isLoadingSlots}
          isSaving={isMutating}
          onClose={() => setRescheduleTarget(null)}
          onRefresh={() => loadAvailableSlots(rescheduleTarget)}
          onSave={rescheduleAppointment}
          onSelectSlot={setSelectedSlotId}
          selectedSlotId={selectedSlotId}
        />
      ) : null}
    </section>
  );
}

function AppointmentNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-500">
      {message}
    </div>
  );
}

function AppointmentRow({
  appointment,
  onCancel,
  onReschedule,
}: {
  appointment: DoctorSession;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  const doctorNote =
    appointment.notes ||
    String(appointment.raw?.doctorNote || appointment.raw?.notes || "").trim();

  return (
    <article className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
        <Icon name="calendar-check" size={22} />
      </span>
      <div className="min-w-0">
        <strong className="block text-sm font-black text-slate-950">
          {formatAppointmentDate(appointment.scheduledAt)}
        </strong>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {appointment.duration || 60} min - {appointment.type || "video"}
        </p>
        {doctorNote ? (
          <p className="mt-2 rounded-2xl bg-teal-50 px-3 py-2 text-sm font-semibold leading-6 text-teal-800">
            Doctor note: {doctorNote}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-teal-700">
          {appointment.status || "booked"}
        </span>
        <Button
          className="min-h-9 rounded-full px-3 text-xs"
          icon="refresh-cw"
          onClick={onReschedule}
          variant="ghost"
        >
          Reschedule
        </Button>
        <Button
          className="min-h-9 rounded-full px-3 text-xs text-rose-700 hover:bg-rose-50 focus:ring-rose-100"
          icon="x"
          onClick={onCancel}
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </article>
  );
}

function CancelAppointmentModal({
  appointment,
  isCancelling,
  onClose,
  onConfirm,
}: {
  appointment: DoctorSession;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
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

function RescheduleAppointmentModal({
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
}: {
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
}) {
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

function formatAppointmentDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
