import { conditionLabels } from "../../data/doctorData";

export default function ConditionPill({ condition }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-lg bg-violet-50 px-2 text-xs font-bold text-[var(--primary)] ring-1 ring-violet-100">
      {conditionLabels[condition] || "Condition unavailable"}
    </span>
  );
}
