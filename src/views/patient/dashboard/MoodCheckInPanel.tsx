import Icon from "../../../components/common/Icon";
import ErrorState from "../../../components/common/ErrorState";
import { moodOptions } from "../../../data/patientData";
import DashboardPanel from "./DashboardPanel";

type MoodCheckInPanelProps = {
  currentStreak: number;
  isSavingMood: boolean;
  moodSaveError: string;
  onRecordMood: () => void;
  onSelectMood: (index: number) => void;
  recordedMood: string | null;
  selectedMood: number | null;
};

export default function MoodCheckInPanel({
  currentStreak,
  isSavingMood,
  moodSaveError,
  onRecordMood,
  onSelectMood,
  recordedMood,
  selectedMood,
}: MoodCheckInPanelProps) {
  return (
    <DashboardPanel className="patient-checkin-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[var(--primary)] shadow-sm shadow-violet-950/5">
            <Icon name="heart" size={19} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-950">How are you feeling today?</h2>
            <p className="text-sm text-slate-600">Choose the closest match for this moment.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="w-fit rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm shadow-violet-950/5">1 minute check-in</span>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-amber-600 shadow-sm shadow-violet-950/5">
            <Icon name="flame" size={14} color="#f59e0b" />
            {currentStreak} day streak
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {moodOptions.map((mood, index) => {
          const active = selectedMood === index;
          return (
            <button
              type="button"
              className={`patient-mood-button grid min-h-28 content-center justify-items-center rounded-lg border p-3 text-center transition focus:outline-none focus:ring-4 focus:ring-violet-200 ${active ? "is-active border-[var(--primary)] bg-white shadow-md shadow-violet-950/10" : "border-violet-100 bg-white/70 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white hover:shadow-sm"}`}
              key={`${mood.label}-${index}`}
              onClick={() => onSelectMood(index)}
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg text-3xl leading-none" style={{ backgroundColor: mood.bg }}>
                {mood.emoji}
              </span>
              <small className={`mt-3 block text-xs font-bold ${active ? "text-[var(--primary)]" : "text-slate-600"}`}>{mood.label}</small>
            </button>
          );
        })}
      </div>

      {moodSaveError ? (
        <div className="mt-4">
          <ErrorState title="Mood could not be saved" message={moodSaveError} actionLabel="Try again" onAction={onRecordMood} />
        </div>
      ) : null}
      {recordedMood && !moodSaveError ? (
        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {recordedMood} mood saved for today.
        </div>
      ) : null}
      <button
        type="button"
        className="dashboard-primary-btn mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-slate-300"
        disabled={selectedMood === null || isSavingMood}
        onClick={onRecordMood}
      >
        <Icon name={isSavingMood ? "loader-circle" : "check-circle"} size={18} color="#fff" className={isSavingMood ? "animate-spin" : ""} />
        {isSavingMood ? "Saving mood..." : "Record today's mood"}
      </button>
    </DashboardPanel>
  );
}
