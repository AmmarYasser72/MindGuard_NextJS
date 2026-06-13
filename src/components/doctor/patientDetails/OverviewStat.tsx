type OverviewStatProps = {
  label: string;
  tone: "blue" | "emerald" | "red" | "violet";
  value: string;
};

export default function OverviewStat({
  label,
  tone,
  value,
}: OverviewStatProps) {
  const styles = {
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <div className={`rounded-xl border p-3 ${styles[tone] || styles.violet}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6">{value}</p>
    </div>
  );
}
