export default function MoodSummaryCards({ averageMood, currentStreak, positiveMoments, recordedCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-[1.25rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm shadow-slate-950/5">
        <small className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Average mood</small>
        <strong className="mt-2 block text-2xl font-bold text-slate-950">{averageMood}/5</strong>
      </div>
      <div className="rounded-[1.25rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm shadow-slate-950/5">
        <small className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Positive check-ins</small>
        <strong className="mt-2 block text-2xl font-bold text-slate-950">{positiveMoments}/{recordedCount}</strong>
      </div>
      <div className="rounded-[1.25rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm shadow-slate-950/5">
        <small className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Current streak</small>
        <strong className="mt-2 block text-2xl font-bold text-slate-950">{currentStreak} day{currentStreak === 1 ? "" : "s"}</strong>
      </div>
    </div>
  );
}
