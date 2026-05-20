import Icon from "../../../components/common/Icon";

export default function MetricTile({ metric }) {
  return (
    <div className="min-h-28 rounded-lg border border-white/70 p-4 shadow-sm" style={{ backgroundColor: metric.bg }}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white">
        <Icon name={metric.icon} size={18} color={metric.color} />
      </span>
      <strong className="mt-3 block text-2xl font-bold" style={{ color: metric.color }}>{metric.value}</strong>
      <small className="mt-1 block text-xs font-bold text-slate-600">{metric.label}</small>
    </div>
  );
}
