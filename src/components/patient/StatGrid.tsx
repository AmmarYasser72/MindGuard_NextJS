import Icon from "../common/Icon";

export default function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          className="grid min-h-28 content-between gap-3 rounded-[1.25rem] border border-white/70 p-4 shadow-sm"
          key={`${item.label}-${item.value}`}
          style={{ backgroundColor: `${item.color}1a` }}
        >
          {item.icon ? <Icon name={item.icon} size={20} color={item.color} /> : null}
          <strong className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</strong>
          <span className="text-xs font-bold text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
