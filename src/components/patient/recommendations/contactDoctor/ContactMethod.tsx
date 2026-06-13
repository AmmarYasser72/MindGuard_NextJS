import Icon from "../../../common/Icon";

type ContactMethodProps = {
  icon: string;
  label: string;
  value: string;
};

export default function ContactMethod({
  icon,
  label,
  value,
}: ContactMethodProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-teal-700">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <strong className="mt-1 block break-words text-sm font-bold text-slate-800">
          {value}
        </strong>
      </span>
    </div>
  );
}
