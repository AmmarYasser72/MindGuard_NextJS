import Icon from "../../../components/common/Icon";
import { quickActions } from "../../../data/patientData";

type QuickActionsSectionProps = {
  onNavigate: (path: string) => void;
};

export default function QuickActionsSection({
  onNavigate,
}: QuickActionsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
            Tools
          </span>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Quick Actions
          </h2>
        </div>
        <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm shadow-violet-950/5">
          {quickActions.length} tools
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            type="button"
            className="patient-action-card group grid min-h-32 content-between rounded-lg border border-violet-100 bg-white p-4 text-left shadow-sm shadow-violet-950/5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-100"
            key={action.label}
            onClick={() => onNavigate(action.path)}
          >
            <span className="flex items-start justify-between gap-3">
              <span
                className="grid h-10 w-10 place-items-center rounded-lg"
                style={{ backgroundColor: action.bg }}
              >
                <Icon name={action.icon} size={20} color={action.color} />
              </span>
              <Icon
                name="arrow-up-right"
                size={16}
                color="#94a3b8"
                className="transition group-hover:text-[var(--primary)]"
              />
            </span>
            <strong className="text-sm font-bold text-slate-900">
              {action.label}
            </strong>
          </button>
        ))}
      </div>
    </section>
  );
}
