import Icon from "../common/Icon";
import IconButton from "../common/IconButton";

export default function AppTopBar({ title, onBack, actionIcon, onAction }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-950/5 backdrop-blur sm:px-6">
      <div className="mx-auto grid max-w-5xl grid-cols-[44px_1fr_44px] items-center gap-3">
        <IconButton icon="arrow-left" label="Back" onClick={onBack} />
        <h1 className="text-center text-xl font-bold text-slate-950">{title}</h1>
        {actionIcon ? (
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-indigo-900/15 transition hover:-translate-y-0.5 hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-violet-200"
            onClick={onAction}
            aria-label={title}
          >
            <Icon name={actionIcon} size={20} color="#fff" />
          </button>
        ) : <span aria-hidden="true" />}
      </div>
    </header>
  );
}
