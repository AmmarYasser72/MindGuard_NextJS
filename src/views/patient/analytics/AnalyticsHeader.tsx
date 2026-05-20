export default function AnalyticsHeader({ title, subtitle, timeframe }) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <span className="grid gap-1.5">
        <h2 className="text-2xl font-bold leading-tight text-slate-950">{title}</h2>
        <small className="text-sm leading-6 text-slate-500">{subtitle}</small>
      </span>
      {timeframe ? (
        <em className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold not-italic text-slate-600 shadow-sm shadow-slate-950/5">
          {timeframe}
        </em>
      ) : null}
    </div>
  );
}
