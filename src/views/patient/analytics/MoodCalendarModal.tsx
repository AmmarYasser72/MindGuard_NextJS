import Button from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";

export default function MoodCalendarModal({
  calendarCells,
  calendarLabels,
  canGoNextMonth,
  canRecord,
  changeViewMonth,
  getDayLabel,
  handleSelectDay,
  isOpen,
  isSavingMood,
  isViewingCurrentMonth,
  monthLabel,
  moodColor,
  moodEmojis,
  moodLabels,
  onClose,
  pendingMood,
  recordMoodForDay,
  saveMoodError,
  selectedDay,
  selectedEntry,
  setPendingMood,
  todayDay,
  viewYear,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      title={`${monthLabel} ${viewYear}`}
      onClose={onClose}
      actions={<Button onClick={onClose}>Done</Button>}
    >
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
            onClick={() => changeViewMonth(-1)}
            aria-label="Previous month"
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <strong className="text-sm font-bold text-slate-900">
            {monthLabel} {viewYear}
          </strong>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:text-slate-300"
            onClick={() => changeViewMonth(1)}
            disabled={!canGoNextMonth}
            aria-label="Next month"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>

        <section className="grid gap-4 rounded-xl bg-[linear-gradient(135deg,#eff6ff_0%,#ecfeff_100%)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em]"
              style={{
                backgroundColor: `${moodColor(selectedEntry.mood)}1a`,
                color: moodColor(selectedEntry.mood),
              }}
            >
              {selectedEntry.recorded
                ? `${selectedEntry.emoji} ${selectedEntry.label}`
                : "No mood recorded"}
            </span>
            {!isViewingCurrentMonth ? (
              <span className="text-xs font-bold text-slate-500">
                Previous month
              </span>
            ) : null}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-950">
              {getDayLabel(selectedEntry.day)}, {monthLabel} {selectedEntry.day}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {selectedEntry.recorded
                ? selectedEntry.summary
                : "No check-in was recorded for this day. Missing days break the streak, and the next recorded day starts from 1 again."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.25rem] bg-white/75 p-4">
              <small className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Check-in time
              </small>
              <strong className="mt-2 block text-sm font-bold text-slate-900">
                {selectedEntry.recorded
                  ? selectedEntry.checkInTime
                  : "Not recorded"}
              </strong>
            </div>
            <div className="rounded-[1.25rem] bg-white/75 p-4">
              <small className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Mood score
              </small>
              <strong className="mt-2 block text-sm font-bold text-slate-900">
                {selectedEntry.recorded ? `${selectedEntry.mood}/5` : "-"}
              </strong>
            </div>
            <div className="rounded-[1.25rem] bg-white/75 p-4">
              <small className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Day highlight
              </small>
              <strong className="mt-2 block text-sm font-bold text-slate-900">
                {selectedEntry.recorded
                  ? selectedEntry.highlight
                  : "Record a mood to continue your progress."}
              </strong>
            </div>
          </div>
          {canRecord ? (
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white/80 p-4">
              <div className="grid gap-1">
                <strong className="text-base font-bold text-slate-950">
                  Record this day
                </strong>
                <small className="text-sm leading-6 text-slate-500">
                  Select the emoji that matches how the patient felt, then save
                  it to continue the streak.
                </small>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {moodEmojis.map((emoji, index) => (
                  <button
                    type="button"
                    className={`grid min-h-24 justify-items-center gap-2 rounded-xl border p-3 text-center transition ${
                      pendingMood === index + 1
                        ? "border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-900/10"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-200"
                    }`}
                    key={`${emoji}-${index}`}
                    onClick={() => setPendingMood(index + 1)}
                  >
                    <span className="text-2xl leading-none">{emoji}</span>
                    <small className="text-[11px] font-bold leading-5 text-slate-700">
                      {moodLabels[index]}
                    </small>
                  </button>
                ))}
              </div>
              {saveMoodError ? (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  role="alert"
                >
                  {saveMoodError}
                </div>
              ) : null}
              <Button
                className="min-h-12 rounded-xl bg-[linear-gradient(135deg,#10b981,#0f766e)] shadow-lg shadow-emerald-900/15 hover:-translate-y-0.5"
                onClick={recordMoodForDay}
                disabled={!pendingMood || isSavingMood}
              >
                {isSavingMood
                  ? "Saving mood..."
                  : selectedEntry.recorded
                    ? "Update mood and streak"
                    : "Record mood and continue streak"}
              </Button>
            </div>
          ) : null}
        </section>

        <section className="grid gap-4">
          <div className="grid grid-cols-7 gap-2">
            {calendarLabels.map((label) => (
              <span
                className="text-center text-[11px] font-black uppercase tracking-[0.14em] text-slate-500"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((entry, index) => {
              if (!entry) {
                return (
                  <span
                    className="min-h-20 rounded-[1rem]"
                    key={`placeholder-${index}`}
                    aria-hidden="true"
                  />
                );
              }

              const isToday = entry.day === todayDay;
              const isSelected = entry.day === selectedDay;
              const isFuture = entry.day > todayDay;

              return (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={`grid min-h-20 content-start gap-2 rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-900/10"
                      : isToday
                        ? "border-violet-300 bg-white"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                  }`}
                  key={entry.day}
                  onClick={() => handleSelectDay(entry.day)}
                >
                  <small
                    className={`text-xs font-black ${isFuture ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {entry.day}
                  </small>
                  <strong
                    className={`text-2xl leading-none ${isFuture ? "opacity-30" : ""}`}
                  >
                    {isFuture || !entry.recorded ? "" : entry.emoji}
                  </strong>
                  <span
                    className={`text-[10px] font-semibold leading-4 ${isFuture ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {isFuture
                      ? "Upcoming"
                      : entry.recorded
                        ? entry.label
                        : "Not recorded"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
}
