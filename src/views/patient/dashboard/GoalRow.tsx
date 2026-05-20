import ProgressBar from "../../../components/common/ProgressBar";

export default function GoalRow({ goal }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-bold text-slate-800">{goal.title}</strong>
        <span className="text-xs font-semibold text-slate-500">{goal.current} / {goal.target}</span>
      </div>
      <ProgressBar value={goal.progress} color={progressColor(goal.progress)} />
    </div>
  );
}

function progressColor(progress) {
  if (progress >= 0.7) return "#10b981";
  if (progress >= 0.4) return "#f59e0b";
  return "#ef4444";
}
