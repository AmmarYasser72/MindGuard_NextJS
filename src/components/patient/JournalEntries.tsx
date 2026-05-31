import PatientListButton from "./PatientListButton";

export default function JournalEntries({ items, onItem }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <PatientListButton
          key={item.title}
          eyebrow={item.date}
          leading={<span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-xl">{item.mood}</span>}
          title={item.title}
          meta={item.preview}
          onClick={() => onItem?.(item)}
        />
      ))}
    </div>
  );
}
