import Icon from "../common/Icon";

export default function ActionGrid({ actions, onAction }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <button
          type="button"
          className="patient-action-card grid min-h-32 content-between rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          key={action.title}
          onClick={() => onAction(action)}
        >
          
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/60"
            style={{ backgroundColor: `${action.color}1a` }}
          >
            <Icon name={action.icon} size={24} color={action.color} />
          </span>
          <strong className="text-sm font-bold text-app-text">
            {action.title}
          </strong>
        </button>
      ))}
    </div>
  );
}
