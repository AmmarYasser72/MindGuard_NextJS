import Button from "../../../common/Button";
import type { DoctorSession } from "../../../../types/doctor";
import { formatSlotDateTime } from "./contactDoctorUtils";

type AvailableSlotsPanelProps = {
  isBooking: boolean;
  isLoadingSlots: boolean;
  onRefresh: () => void;
  onSelectSlot: (slotId: string) => void;
  selectedSlotId: string;
  slotError: string;
  slots: DoctorSession[];
};

export default function AvailableSlotsPanel({
  isBooking,
  isLoadingSlots,
  onRefresh,
  onSelectSlot,
  selectedSlotId,
  slotError,
  slots,
}: AvailableSlotsPanelProps) {
  return (
    <section className="rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
            Available sessions
          </span>
          <h4 className="mt-1 text-lg font-black text-slate-950">
            Future open slots
          </h4>
        </div>
        <Button
          variant="ghost"
          icon="refresh-cw"
          onClick={onRefresh}
          disabled={isLoadingSlots || isBooking}
        >
          Refresh
        </Button>
      </div>

      {slotError ? (
        <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {slotError}
        </div>
      ) : null}

      {isLoadingSlots ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500">
          Loading available slots...
        </div>
      ) : null}

      {!isLoadingSlots && !slots.length ? (
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
          No future open slots are available for this doctor right now. You can
          still email the doctor to request another time.
        </div>
      ) : null}

      {!isLoadingSlots && slots.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {slots.map((slot) => {
            const active = selectedSlotId === slot.id;
            return (
              <button
                type="button"
                key={slot.id}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                  active
                    ? "border-teal-500 bg-teal-50 text-teal-950 shadow-sm shadow-teal-950/10"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-teal-200 hover:bg-white"
                }`}
                onClick={() => onSelectSlot(slot.id)}
                aria-pressed={active}
              >
                <span className="block text-sm font-black">
                  {formatSlotDateTime(slot.scheduledAt)}
                </span>
                <span className="mt-1 block text-xs font-bold text-slate-500">
                  {slot.duration || 60} min - {slot.type || "video"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
