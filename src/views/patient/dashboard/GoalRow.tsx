import ProgressBar from "../../../components/common/ProgressBar";

export default function GoalRow({ goal }) {
  const percentage = Math.round(goal.progress * 100);

  return (
    <div className="patient-list-row rounded-lg border border-slate-100 bg-slate-50/70 p-3 transition hover:border-violet-100 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <strong className="block truncate text-sm font-bold text-slate-800">
            {goal.title}
          </strong>
          <span className="mt-1 block text-xs font-semibold text-slate-500">
            {goal.current} / {goal.target}
          </span>
        </div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm shadow-slate-950/5">
          {percentage}%
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar
          value={goal.progress}
          color={progressColor(goal.progress)}
        />
      </div>
    </div>
  );
}

function progressColor(progress) {
  if (progress >= 0.7) return "#10b981";
  if (progress >= 0.4) return "#f59e0b";
  return "#ef4444";
}
