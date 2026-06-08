export default function EmptyPanel({ message }) {
  return (
    <div className="rounded-lg border border-dashed border-violet-200 bg-[var(--doctor-card)] p-8 text-center text-sm font-semibold text-slate-500">
      {message}
    </div>
  );
}
