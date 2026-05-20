import Icon from "../common/Icon";

export default function JournalEntries({ items, onItem }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <button
          type="button"
          className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          key={item.title}
          onClick={() => onItem?.(item)}
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-xl">{item.mood}</span>
          <span className="min-w-0">
            <small className="block text-xs font-semibold text-slate-400">{item.date}</small>
            <strong className="mt-1 block text-sm font-bold text-slate-900">{item.title}</strong>
            <em className="mt-1 block text-xs not-italic leading-5 text-slate-500">{item.preview}</em>
          </span>
          <Icon name="chevron-right" size={16} color="#9ca3af" />
        </button>
      ))}
    </div>
  );
}
