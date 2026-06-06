import type { MoodEntry } from "../../../services/moodCalendarService";

type MoodSevenDayStripProps = {
  days: MoodEntry[];
  getDayLabel: (day: number) => string;
  onSelectDay: (day: number) => void;
  selectedDay: number;
  todayDay: number;
};

export default function MoodSevenDayStrip({
  days,
  getDayLabel,
  onSelectDay,
  selectedDay,
  todayDay,
}: MoodSevenDayStripProps) {
  return (
    <div className="grid auto-cols-[72px] grid-flow-col gap-2 overflow-x-auto pb-1 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-7">
      {days.map((dayEntry) => {
        const day = dayEntry.day;
        const isToday = day === todayDay;
        const isSelected = day === selectedDay;
        const isFuture = day > todayDay;
        return (
          <button
            type="button"
            aria-pressed={isSelected}
            className={`grid min-w-[72px] gap-2 rounded-[1.25rem] border px-3 py-3 text-center transition ${
              isSelected
                ? "border-violet-300 bg-violet-50 shadow-sm shadow-violet-900/10"
                : isToday
                  ? "border-violet-200 bg-white"
                  : "patient-card-gradient border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]"
            } ${isFuture ? "text-slate-300" : "text-slate-600"}`}
            key={day}
            onClick={() => onSelectDay(day)}
          >
            <small className="text-xs font-black uppercase tracking-[0.14em]">
              {getDayLabel(day)}
            </small>
            <strong
              className={`text-lg font-bold ${isToday ? "text-[var(--primary)]" : ""}`}
            >
              {day}
            </strong>
            <span className={`text-lg ${isFuture ? "opacity-25" : ""}`}>
              {isFuture || !dayEntry?.recorded ? "" : dayEntry.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
