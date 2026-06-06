import ProgressBar from "../../../components/common/ProgressBar";

export default function GoalProgress({ goal }) {
  const progress = Math.min(1, goal.current / goal.target);
  const color =
    progress >= 0.8 ? "#10b981" : progress >= 0.6 ? "#f59e0b" : "#ef4444";

  return (
    <div className="grid gap-2">
      <span className="flex items-center justify-between gap-3">
        <strong className="text-sm font-bold text-slate-900">
          {goal.goal}
        </strong>
        <em className="text-xs font-bold not-italic" style={{ color }}>
          {formatGoalValue(goal.current)} / {formatGoalValue(goal.target)}{" "}
          {goal.unit}
        </em>
      </span>
      <ProgressBar value={progress} color={color} />
    </div>
  );
}

function formatGoalValue(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
