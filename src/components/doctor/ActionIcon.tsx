import Icon from "../common/Icon";

export default function ActionIcon({ icon, bg }) {
  const toneClass =
    {
      "#d1fae5": "bg-emerald-50 text-emerald-600",
      "#eef2ff": "bg-violet-50 text-[var(--primary)]",
      "#fce7f3": "bg-pink-50 text-pink-500",
    }[bg] || "bg-slate-100 text-slate-600";

  return (
    <span
      className={`grid h-11 w-11 place-items-center rounded-lg ${toneClass}`}
    >
      <Icon name={icon} size={22} color="currentColor" />
    </span>
  );
}
