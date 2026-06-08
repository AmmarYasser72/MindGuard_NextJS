import Icon from "../common/Icon";
import { patientName } from "../../data/doctorData";
import { time } from "./dashboardShared";

export default function AlertSection({ title, tone, items, onOpenSchedule }) {
  if (!items.length) return null;
  const critical = tone === "critical";

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] ${
        critical ? "border-red-200" : "border-amber-200"
      }`}
    >
      <header
        className={`flex flex-wrap items-center gap-3 border-b p-4 ${
          critical ? "border-red-100 bg-red-50" : "border-amber-100 bg-amber-50"
        }`}
      >
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm ${critical ? "bg-red-600" : "bg-amber-500"}`}
        >
          <Icon
            name={critical ? "triangle-alert" : "info"}
            size={18}
            color="#fff"
          />
        </span>
        <div>
          <strong
            className={`block text-lg font-black ${critical ? "text-red-700" : "text-amber-700"}`}
          >
            {title}
          </strong>
          <span className="text-xs font-bold text-slate-500">
            {items.length} patients require follow-up
          </span>
        </div>
      </header>

      <div
        className={`divide-y ${critical ? "divide-red-100" : "divide-amber-100"}`}
      >
        {items.map(({ summary, patient }) => (
          <article
            className="grid gap-3 p-4 transition hover:bg-white/50 lg:grid-cols-[auto_1fr_minmax(180px,auto)_auto] lg:items-center"
            key={`${summary.patientId}-${summary.generatedAt}`}
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl ${critical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
            >
              <Icon
                name={critical ? "circle-alert" : "bell"}
                size={18}
                color="currentColor"
              />
            </span>
            <p className="m-0 text-sm font-semibold leading-6 text-slate-700">
              {summary.summaryText}
            </p>
            <span className="grid gap-1 lg:justify-items-end">
              <strong className="text-sm font-black text-slate-950">
                {patientName(patient)}
              </strong>
              <small className="text-xs font-semibold text-slate-500">
                Updated {time(summary.generatedAt)}
              </small>
            </span>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--doctor-line)] bg-[var(--doctor-card)] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              onClick={() => onOpenSchedule(patient)}
              aria-label="Schedule session"
              title="Schedule session"
            >
              <Icon name="video" size={20} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
