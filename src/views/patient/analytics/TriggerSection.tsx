import Card from "../../../components/common/Card";
import ProgressBar from "../../../components/common/ProgressBar";

export default function TriggerSection({ title, triggers }) {
  return (
    <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <span className="inline-flex min-h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
          {triggers.length} tracked
        </span>
      </div>
      {triggers.map((trigger) => (
        <div className="grid gap-2" key={trigger.name}>
          <span className="flex items-center justify-between gap-3">
            <strong className="text-sm font-bold text-slate-900">{trigger.name}</strong>
            <em className="text-xs font-bold not-italic" style={{ color: trigger.color }}>{trigger.percentage}%</em>
          </span>
          <ProgressBar value={trigger.percentage / 100} color={trigger.color} />
        </div>
      ))}
    </Card>
  );
}
