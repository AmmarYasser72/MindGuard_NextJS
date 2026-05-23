import Card from "../../../components/common/Card";
import Icon from "../../../components/common/Icon";
import { useToast } from "../../../components/common/Toast";

export default function TechniqueSection({ title, techniques, color }) {
  const { showToast } = useToast();

  return (
    <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="grid gap-3">
        {techniques.map((technique) => (
          <div className="patient-analytics-row grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center" key={technique.name}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: `${color}1a` }}>
              <Icon name={technique.icon} size={20} color={color} />
            </span>
            <span className="grid gap-1">
              <strong className="text-sm font-bold text-slate-900">{technique.name}</strong>
              <small className="text-xs leading-5 text-slate-500">{technique.description}</small>
              <em className="text-[11px] font-bold not-italic text-emerald-600">
                {technique.duration ? `${technique.duration} - ` : ""}
                {technique.effectiveness} effective
              </em>
            </span>
            <button
              type="button"
              className="patient-calm-action min-h-11 rounded-2xl px-4 text-sm font-bold text-white transition hover:-translate-y-0.5"
              onClick={() => showToast(`${technique.name} ready to start`, "success")}
            >
              {technique.duration ? `Start ${technique.duration}` : "Start"}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
