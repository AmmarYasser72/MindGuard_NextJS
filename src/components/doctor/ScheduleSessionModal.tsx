import { useMemo, useState } from "react";
import Icon from "../common/Icon";
import { Modal } from "../common/Modal";
import { useToast } from "../common/Toast";
import { createDefaultScheduleForm, patientName } from "../../data/doctorData";
import {
  fieldClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./dashboardShared";
import type { DoctorPatient, ScheduleForm } from "../../types/doctor";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const quickTimes = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

type ScheduleSessionModalProps = {
  onClose: () => void;
  onCreate: (form: ScheduleForm) => Promise<void>;
  patient: DoctorPatient | null;
};

export default function ScheduleSessionModal({
  patient,
  onClose,
  onCreate,
}: ScheduleSessionModalProps) {
  const [form, setForm] = useState(() => ({
    ...createDefaultScheduleForm(),
    patient: patient ? patientName(patient) : "Unassigned",
  }));
  const [calendarMonth, setCalendarMonth] = useState(() =>
    firstDayOfMonth(parseDateInput(form.date)),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = parseDateInput(form.date);
  const monthDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const selectedDateLabel = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(selectedDate);

  function update<Key extends keyof ScheduleForm>(
    key: Key,
    value: ScheduleForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateDate(date: Date) {
    if (startOfDay(date) < today) return;
    update("date", formatDateInput(date));
    setCalendarMonth(firstDayOfMonth(date));
  }

  function updateDateInput(value: string) {
    update("date", value);
    const nextDate = parseDateInput(value);
    if (!Number.isNaN(nextDate.getTime())) {
      setCalendarMonth(firstDayOfMonth(nextDate));
    }
  }

  function moveMonth(offset: number) {
    setCalendarMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  async function submit() {
    setError("");
    setIsSubmitting(true);
    try {
      await onCreate(form);
      showToast(`Session scheduled for ${form.patient}`, "success");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to schedule session.";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title="Schedule New Session"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Session"}
          </button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>
          Patient
          <input
            className={inputClass}
            value={form.patient}
            readOnly={Boolean(patient)}
            onChange={(event) => update("patient", event.target.value)}
          />
        </label>
        <div className="grid gap-2 rounded-lg border border-violet-100 bg-violet-50/60 p-4">
          <span className="text-xs font-black uppercase text-[var(--primary)]">
            Selected
          </span>
          <strong className="text-lg font-black text-slate-950">
            {selectedDateLabel}
          </strong>
          <span className="text-sm font-bold text-slate-500">
            {form.time} - {form.duration} min
          </span>
        </div>

        <section className="grid gap-3 rounded-lg border border-violet-100 bg-white p-4 shadow-sm shadow-violet-950/5 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className={calendarNavButtonClass}
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <strong className="text-sm font-black text-slate-950">
              {formatMonth(calendarMonth)}
            </strong>
            <button
              type="button"
              className={calendarNavButtonClass}
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdayLabels.map((day) => (
              <span
                className="py-1 text-[11px] font-black uppercase text-slate-400"
                key={day}
              >
                {day}
              </span>
            ))}
            {monthDays.map((date) => {
              const past = startOfDay(date) < today;
              const outsideMonth = date.getMonth() !== calendarMonth.getMonth();
              const selected = isSameDate(date, selectedDate);
              return (
                <button
                  type="button"
                  className={calendarDayClass({
                    outsideMonth,
                    past,
                    selected,
                  })}
                  key={date.toISOString()}
                  onClick={() => updateDate(date)}
                  disabled={past}
                  aria-pressed={selected}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </section>

        <label className={fieldClass}>
          Date
          <input
            className={inputClass}
            type="date"
            min={formatDateInput(today)}
            value={form.date}
            onChange={(event) => updateDateInput(event.target.value)}
          />
        </label>
        <label className={fieldClass}>
          Time
          <input
            className={inputClass}
            type="time"
            value={form.time}
            onChange={(event) => update("time", event.target.value)}
          />
        </label>
        <div className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-bold text-slate-700">Quick times</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {quickTimes.map((time) => (
              <button
                type="button"
                className={`min-h-10 rounded-lg border px-2 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-violet-100 ${
                  form.time === time
                    ? "border-violet-500 bg-[var(--primary)] text-white shadow-sm shadow-violet-950/10"
                    : "border-violet-100 bg-white text-slate-600 hover:bg-violet-50 hover:text-[var(--primary)]"
                }`}
                key={time}
                onClick={() => update("time", time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <label className={fieldClass}>
          Duration
          <select
            className={inputClass}
            value={form.duration}
            onChange={(event) => update("duration", event.target.value)}
          >
            <option>30</option>
            <option>45</option>
            <option>60</option>
          </select>
        </label>
        <label className={fieldClass}>
          Type
          <select
            className={inputClass}
            value={form.type}
            onChange={(event) => update("type", event.target.value)}
          >
            <option>Video</option>
            <option>Audio</option>
            <option>In-Person</option>
            <option>Chat</option>
          </select>
        </label>
        <label className={fieldClass}>
          Reason
          <input
            className={inputClass}
            value={form.reason}
            onChange={(event) => update("reason", event.target.value)}
          />
        </label>
        <label className={`${fieldClass} sm:col-span-2`}>
          Notes
          <textarea
            className={`${inputClass} min-h-28 py-3`}
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Add any additional notes..."
          />
        </label>
      </div>
    </Modal>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function firstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(month: Date) {
  const start = firstDayOfMonth(month);
  const firstVisible = new Date(start);
  firstVisible.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + index);
    return date;
  });
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

const calendarNavButtonClass =
  "grid h-9 w-9 place-items-center rounded-lg border border-violet-100 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-violet-100";

function calendarDayClass({
  outsideMonth,
  past,
  selected,
}: {
  outsideMonth: boolean;
  past: boolean;
  selected: boolean;
}) {
  if (selected) {
    return "min-h-10 rounded-lg bg-[var(--primary)] text-sm font-black text-white shadow-sm shadow-violet-950/10 focus:outline-none focus:ring-4 focus:ring-violet-100";
  }
  if (past) {
    return "min-h-10 cursor-not-allowed rounded-lg bg-slate-50 text-sm font-bold text-slate-300";
  }
  return `min-h-10 rounded-lg text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-violet-100 ${
    outsideMonth
      ? "text-slate-400 hover:bg-violet-50 hover:text-[var(--primary)]"
      : "bg-violet-50/70 text-slate-700 hover:bg-violet-100 hover:text-[var(--primary)]"
  }`;
}
