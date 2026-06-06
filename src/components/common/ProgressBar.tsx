export default function ProgressBar({
  value,
  color = "#6366f1",
}: {
  value: number;
  color?: string;
}) {
  const width = `${Math.max(0, Math.min(1, value)) * 100}%`;

  return (
    <span className="block h-2 overflow-hidden rounded-full bg-slate-100">
      <span
        className="block h-full rounded-full transition-[width]"
        style={{ width, backgroundColor: color }}
      />
    </span>
  );
}
