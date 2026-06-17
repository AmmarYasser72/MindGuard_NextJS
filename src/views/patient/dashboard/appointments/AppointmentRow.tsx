import Button from "../../../../components/common/Button";
import Icon from "../../../../components/common/Icon";
import type { DoctorSession } from "../../../../types/doctor";
import { formatAppointmentDate } from "./appointmentUtils";

type AppointmentRowProps = {
  appointment: DoctorSession;
  onCancel: () => void;
  onReschedule: () => void;
};

export default function AppointmentRow({
  appointment,
  onCancel,
  onReschedule,
}: AppointmentRowProps) {
  const doctorName = appointment.doctorName?.trim() || "Doctor unavailable";
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
        <p className="mt-1 text-sm font-bold text-slate-700">
          Doctor: {doctorName}
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
