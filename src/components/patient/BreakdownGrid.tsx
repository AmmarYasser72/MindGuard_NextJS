import ProgressBar from "../common/ProgressBar";

export default function BreakdownGrid({ items }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div className="grid gap-2 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4" key={item.label}>
          <span className="flex items-center justify-between gap-3">
            <strong className="text-sm font-bold text-slate-900">{item.label}</strong>
            <em className="text-sm font-bold not-italic text-slate-500">{Math.round(item.progress * 100)}%</em>
          </span>
          <small className="text-sm text-slate-500">{item.value}</small>
          <ProgressBar value={item.progress} color={item.color} />
        </div>
      ))}
    </div>
  );
}
