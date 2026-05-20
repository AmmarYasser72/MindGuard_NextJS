export default function DaysRow({ days, active }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => (
        <span
          className={`grid min-h-12 place-items-center rounded-2xl border text-sm font-bold ${index < active ? "border-violet-200 bg-violet-50 text-[var(--primary)]" : "border-slate-200 bg-white text-slate-400"}`}
          key={`${day}-${index}`}
        >
          {day}
        </span>
      ))}
    </div>
  );
}
