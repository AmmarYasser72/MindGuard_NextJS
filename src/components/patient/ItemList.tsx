import Icon from "../common/Icon";

export default function ItemList({ items, color = "#6366f1", onItem }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <button
          type="button"
          className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          key={item.title}
          onClick={() => onItem?.(item)}
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: `${color}1a` }}>
            <Icon name={item.icon || "circle"} size={20} color={color} />
          </span>
          <span className="min-w-0">
            <strong className="block text-sm font-bold text-slate-900">{item.title}</strong>
            <small className="mt-1 block text-xs font-semibold text-slate-500">{item.subtitle}</small>
            {item.meta ? <em className="mt-1 block text-xs not-italic text-slate-400">{item.meta}</em> : null}
          </span>
          <Icon name="chevron-right" size={16} color="#9ca3af" />
        </button>
      ))}
    </div>
  );
}
