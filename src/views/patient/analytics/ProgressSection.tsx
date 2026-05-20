import Card from "../../../components/common/Card";
import Icon from "../../../components/common/Icon";

export default function ProgressSection({ items }) {
  return (
    <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">Weekly Progress</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            className="grid min-h-28 content-between gap-3 rounded-[1.25rem] border border-white/70 p-4 shadow-sm"
            style={{ backgroundColor: `${item.color}1a` }}
            key={item.label}
          >
            <Icon name={item.icon} size={24} color={item.color} />
            <strong className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</strong>
            <span className="text-xs font-bold text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
