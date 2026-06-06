import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";

export default function GoalList({ items, onItem }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <button
          type="button"
          className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          key={item.title}
          onClick={() => onItem?.(item)}
        >
          <span className="flex items-start justify-between gap-3">
            <strong className="text-sm font-bold text-slate-900">
              {item.title}
            </strong>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ color: item.color, backgroundColor: `${item.color}1a` }}
            >
              {item.status}
            </span>
          </span>
          <em className="text-sm not-italic leading-6 text-slate-600">
            {item.description}
          </em>
          <small className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Icon name="clock" size={14} color="#9ca3af" /> {item.time}
          </small>
          <ProgressBar value={item.progress} color={item.color} />
        </button>
      ))}
    </div>
  );
}
