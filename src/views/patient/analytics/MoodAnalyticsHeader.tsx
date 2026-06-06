import Icon from "../../../components/common/Icon";

type MoodAnalyticsHeaderProps = {
  currentStreak: number;
  onOpenCalendar: () => void;
};

export default function MoodAnalyticsHeader({
  currentStreak,
  onOpenCalendar,
}: MoodAnalyticsHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="grid gap-1.5">
        <h2 className="text-[2rem] font-medium leading-tight tracking-[-0.04em] text-slate-950">
          Mood Calendar
        </h2>
        <small className="text-sm leading-6 text-slate-500 sm:text-[0.95rem]">
          Every daily check-in is grouped into one monthly snapshot.
        </small>
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
        <span className="inline-flex min-h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-lg font-black text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
          <Icon name="flame" size={24} color="#f59e0b" />
          {currentStreak} day streak
        </span>
        <button
          type="button"
          className="inline-flex min-h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-lg font-black text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
          onClick={onOpenCalendar}
        >
          <Icon name="calendar-days" size={24} color="#10b981" />
          Open calendar
        </button>
      </div>
    </div>
  );
}
