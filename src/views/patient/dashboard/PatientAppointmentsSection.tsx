import Button from "../../../components/common/Button";
import DashboardPanel from "./DashboardPanel";
import AppointmentNotice from "./appointments/AppointmentNotice";
import AppointmentRow from "./appointments/AppointmentRow";
import CancelAppointmentModal from "./appointments/CancelAppointmentModal";
import RescheduleAppointmentModal from "./appointments/RescheduleAppointmentModal";
import { usePatientAppointments } from "./appointments/usePatientAppointments";

type PatientAppointmentsSectionProps = {
  onNavigate: (path: string) => void;
};

export default function PatientAppointmentsSection({
  onNavigate,
}: PatientAppointmentsSectionProps) {
  const {
    availableSlots,
    cancelAppointment,
    cancelTarget,
    error,
    isLoading,
    isLoadingSlots,
    isMutating,
    loadAppointments,
    loadAvailableSlots,
    openReschedule,
    rescheduleAppointment,
    rescheduleError,
    rescheduleTarget,
    selectedSlotId,
    setCancelTarget,
    setRescheduleTarget,
    setSelectedSlotId,
    upcomingAppointments,
  } = usePatientAppointments();

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
