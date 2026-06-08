export default function MetricBlock({ label, value, note, tone }) {
  const styles = {
    violet: "bg-violet-50 text-[var(--primary)]",
    red: "bg-red-50 text-red-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-lg border border-[var(--doctor-line)] bg-[linear-gradient(180deg,var(--doctor-card)_0%,var(--doctor-card-soft)_100%)] p-4">
      <span className="text-xs font-bold uppercase text-slate-500">
        {label}
      </span>
      <strong
        className={`mt-2 block w-fit rounded-lg px-2 py-1 text-lg font-bold ${styles[tone]}`}
      >
        {value}
      </strong>
      <small className="mt-2 block text-xs font-semibold text-slate-500">
        {note}
      </small>
    </div>
  );
}
