import Icon from "../../common/Icon";

export function InfoPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Icon name={icon} size={18} color="#6366f1" />
      <small className="mt-3 block text-xs font-black uppercase text-slate-400">
        {label}
      </small>
      <strong className="mt-1 block text-sm text-slate-950">{value}</strong>
    </div>
  );
}

export function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
