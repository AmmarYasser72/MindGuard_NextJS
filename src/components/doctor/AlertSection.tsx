import Icon from "../common/Icon";
import { patientName } from "../../data/doctorData";
import { time } from "./dashboardShared";

export default function AlertSection({ title, tone, items, onOpenSchedule }) {
  if (!items.length) return null;
  const critical = tone === "critical";

  return (
    <section
      className={`doctor-alert overflow-hidden rounded-lg border shadow-sm ${critical ? "doctor-alert-critical border-red-200 bg-red-50" : "doctor-alert-warning border-amber-200 bg-amber-50"}`}
    >
      <header className="flex items-center gap-2 border-b border-white/80 p-3">
        <span
          className={`grid h-7 w-7 place-items-center rounded-lg text-white ${critical ? "bg-red-600" : "bg-amber-500"}`}
        >
          <Icon
            name={critical ? "triangle-alert" : "info"}
            size={15}
            color="#fff"
          />
        </span>
        <strong className={critical ? "text-red-700" : "text-amber-700"}>
          {title}
        </strong>
        <span className="ml-auto text-xs font-bold text-slate-500">
          {items.length} patients
        </span>
      </header>
      <div className="divide-y divide-white/80">
        {items.map(({ summary, patient }) => (
          <article
            className="grid gap-3 p-3 lg:grid-cols-[auto_1fr_minmax(180px,auto)_auto] lg:items-center"
            key={`${summary.patientId}-${summary.generatedAt}`}
          >
            <Icon
              name={critical ? "circle-alert" : "bell"}
              size={18}
              color={critical ? "#dc2626" : "#d97706"}
            />
            <p className="m-0 text-sm font-medium text-slate-700">
              {summary.summaryText}
            </p>
            <span className="grid gap-1 lg:justify-items-end">
              <strong className="text-sm text-slate-950">
                {patientName(patient)}
              </strong>
              <small className="text-xs font-semibold text-slate-500">
                Last update - {time(summary.generatedAt)}
              </small>
            </span>
            <button
              type="button"
              className="doctor-icon-button grid h-10 w-10 place-items-center rounded-lg border border-white bg-white/80 text-slate-700 shadow-sm transition hover:bg-white"
              onClick={() => onOpenSchedule(patient)}
              aria-label="Schedule session"
            >
              <Icon name="video" size={20} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
