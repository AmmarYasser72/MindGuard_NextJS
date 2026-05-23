import Icon from "../../../components/common/Icon";
import type { CSSProperties } from "react";

export default function MetricTile({ metric }) {
  return (
    <div
      className="patient-metric-tile grid min-h-28 content-between rounded-lg border border-white/80 p-4 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ "--metric-bg": metric.bg, "--metric-color": metric.color } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white shadow-sm shadow-slate-950/5">
          <Icon name={metric.icon} size={18} color={metric.color} />
        </span>
        <span className="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-bold text-slate-500">Today</span>
      </div>
      <div>
        <strong className="block text-2xl font-bold text-[var(--metric-color)]">{metric.value}</strong>
        <small className="mt-1 block text-xs font-bold text-slate-600">{metric.label}</small>
      </div>
    </div>
  );
}
