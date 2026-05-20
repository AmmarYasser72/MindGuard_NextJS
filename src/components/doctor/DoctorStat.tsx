import Icon from "../common/Icon";

export default function DoctorStat({ title, value, icon, helper, tone }) {
  const styles = {
    violet: "bg-violet-50 text-[var(--primary)]",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-lg border border-violet-100 bg-white p-4 shadow-sm shadow-violet-950/5">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${styles[tone]}`}>
          <Icon name={icon} size={20} />
        </span>
        <strong className="text-3xl font-bold text-slate-950">{value}</strong>
      </div>
      <div className="mt-5">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <small className="mt-1 block text-xs font-semibold text-slate-500">{helper}</small>
      </div>
    </article>
  );
}
