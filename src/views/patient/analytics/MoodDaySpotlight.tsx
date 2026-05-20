export default function MoodDaySpotlight({ getDayLabel, monthLabel, selectedDay, selectedEntry }) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm shadow-slate-950/5">
      <div className="flex items-start gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-violet-50 text-2xl">
          {selectedEntry.recorded ? selectedEntry.emoji : "\u{1F4DD}"}
        </span>
        <div>
          <strong className="block text-lg font-bold text-slate-950">{getDayLabel(selectedDay)} {selectedDay}</strong>
          <small className="mt-1 block text-sm leading-6 text-slate-500">
            {selectedEntry.recorded
              ? `${selectedEntry.label} mood recorded at ${selectedEntry.checkInTime}`
              : `No mood recorded for ${monthLabel} ${selectedDay} yet`}
          </small>
        </div>
      </div>
      <p className="text-sm leading-7 text-slate-600">
        {selectedEntry.recorded
          ? selectedEntry.summary
          : "This day does not have a mood check-in yet. Recording today keeps your streak moving, but missing days resets it."}
      </p>
      <em className="text-sm font-bold not-italic text-emerald-600">
        {selectedEntry.recorded ? selectedEntry.highlight : "Record this day to build your streak from here."}
      </em>
    </div>
  );
}
