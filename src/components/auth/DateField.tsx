import { useCallback, useId, useMemo, useRef, useState } from "react";
import Icon from "../common/Icon";
import { cn } from "../../utils/cn";
import { useDismissableLayer } from "../../hooks/useDismissableLayer";

type DateFieldProps = {
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  label: string;
  name?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function sameDay(a: Date | null, b: Date | null) {
  return Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date: Date, amount: number) {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1);
}

function defaultBirthView() {
  const today = new Date();
  return new Date(today.getFullYear() - 20, today.getMonth(), 1);
}

function formatDisplayDate(value: string) {
  const date = parseIsoDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function calendarDays(viewDate: Date) {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function DateField({
  autoComplete,
  disabled,
  error,
  label,
  name,
  onChange,
  placeholder = "Select date",
  value,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseIsoDate(value) || defaultBirthView());
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseIsoDate(value);
  const close = useCallback(() => setOpen(false), []);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const days = useMemo(() => calendarDays(viewDate), [viewDate]);

  useDismissableLayer({ active: open, onDismiss: close, ref: rootRef });

  function selectDate(date: Date) {
    if (date > today) return;
    onChange(toIsoDate(date));
    setOpen(false);
  }

  function clearDate() {
    onChange("");
    setViewDate(defaultBirthView());
    setOpen(false);
  }

  return (
    <div className="relative grid gap-2" ref={rootRef}>
      <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500" id={`${fieldId}-label`}>
        {label}
      </label>
      <input autoComplete={autoComplete} name={name} type="hidden" value={value} readOnly />
      <button
        className={cn(
          "group flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left shadow-sm shadow-slate-950/5 transition focus:outline-none",
          error
            ? "border-red-300 bg-red-50/80 ring-4 ring-red-100"
            : "border-slate-200 bg-white hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100",
          disabled && "cursor-not-allowed opacity-60",
        )}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby={`${fieldId}-label ${fieldId}-value`}
        onClick={() => setOpen((state) => !state)}
      >
        <span className={cn(
          "grid h-9 w-9 place-items-center rounded-lg transition",
          error ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-400 group-focus:bg-violet-50 group-focus:text-[var(--primary)]",
        )}>
          <Icon name="calendar-days" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn("block truncate text-sm font-bold", value ? "text-slate-900" : "text-slate-400")}
            id={`${fieldId}-value`}
          >
            {formatDisplayDate(value) || placeholder}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-slate-400">
            {value ? "Selected birth date" : "Open custom calendar"}
          </span>
        </span>
        <span className={cn(
          "grid h-8 w-8 place-items-center rounded-lg transition",
          open ? "bg-violet-50 text-[var(--primary)]" : "bg-slate-100 text-slate-400",
        )}>
          <Icon name="chevron-down" size={18} />
        </span>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.16)]"
          role="dialog"
          aria-labelledby={`${fieldId}-label`}
        >
          <div className="p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-violet-50 hover:text-[var(--primary)]" type="button" onClick={() => setViewDate((date) => addYears(date, -1))} aria-label="Previous year">
                <Icon name="chevrons-left" size={18} />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-violet-50 hover:text-[var(--primary)]" type="button" onClick={() => setViewDate((date) => addMonths(date, -1))} aria-label="Previous month">
                <Icon name="chevron-left" size={18} />
              </button>
              <strong className="min-w-0 flex-1 text-center text-sm font-black text-slate-950">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </strong>
              <button className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-violet-50 hover:text-[var(--primary)]" type="button" onClick={() => setViewDate((date) => addMonths(date, 1))} aria-label="Next month">
                <Icon name="chevron-right" size={18} />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-violet-50 hover:text-[var(--primary)]" type="button" onClick={() => setViewDate((date) => addYears(date, 1))} aria-label="Next year">
                <Icon name="chevrons-right" size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdayLabels.map((day) => (
                <span className="py-2 text-xs font-black text-slate-400" key={day}>{day}</span>
              ))}
              {days.map((date) => {
                const inMonth = date.getMonth() === viewDate.getMonth();
                const active = sameDay(date, selectedDate);
                const isToday = sameDay(date, today);
                const isFuture = date > today;

                return (
                  <button
                    className={cn(
                      "grid h-9 place-items-center rounded-lg text-sm font-bold transition",
                      active && "bg-[var(--primary)] text-white shadow-md shadow-indigo-950/15",
                      !active && inMonth && "text-slate-800 hover:bg-violet-50 hover:text-[var(--primary)]",
                      !active && !inMonth && "text-slate-300 hover:bg-slate-50",
                      !active && isToday && "ring-2 ring-violet-200",
                      isFuture && "cursor-not-allowed text-slate-200 hover:bg-transparent hover:text-slate-200",
                    )}
                    key={toIsoDate(date)}
                    type="button"
                    disabled={isFuture}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <button className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" type="button" onClick={clearDate}>
                Clear
              </button>
              <button className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-bold text-[var(--primary)] transition hover:bg-violet-100" type="button" onClick={() => selectDate(today)}>
                Today
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? <span className="text-xs font-bold text-red-600">{error}</span> : null}
    </div>
  );
}
