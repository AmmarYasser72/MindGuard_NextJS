import Card from "../../../components/common/Card";

export default function MoodTrackerCard({
  bars,
  cycle,
  moodColor,
  moodInsights,
  moodLabels,
}) {
  const averageMood = bars.length
    ? (bars.reduce((sum, bar) => sum + bar.mood, 0) / bars.length).toFixed(1)
    : "0.0";
  const peakMood = bars.reduce(
    (highest, bar) => (bar.mood > highest.mood ? bar : highest),
    bars[0] || { mood: 0, time: "--" },
  );
  const points = bars.map((bar, index) => {
    const x = bars.length === 1 ? 50 : (index / (bars.length - 1)) * 100;
    const y = 88 - ((bar.mood - 1) / 4) * 72;
    return { ...bar, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = points.length ? `${path} L 100 100 L 0 100 Z` : "";

  return (
    <Card className="grid gap-5 rounded-xl border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Mood Tracker</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Track your emotional patterns
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
            <small className="block text-[10px] font-bold uppercase text-emerald-700">
              Average
            </small>
            <strong className="mt-1 block text-lg font-bold text-emerald-700">
              {averageMood}
            </strong>
          </span>
          <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <small className="block text-[10px] font-bold uppercase text-blue-700">
              Peak
            </small>
            <strong className="mt-1 block text-lg font-bold text-blue-700">
              {peakMood.mood}/5
            </strong>
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <small className="block text-[10px] font-bold uppercase text-slate-500">
              Entries
            </small>
            <strong className="mt-1 block text-lg font-bold text-slate-800">
              {bars.length}
            </strong>
          </span>
        </div>
      </div>

      <section className="patient-card-gradient rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              Interactive Mood Chart
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Today from {bars[0]?.time || "--"} to {bars.at(-1)?.time || "--"}
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            {moodLabels[peakMood.mood - 1] || "No data"}
          </span>
        </div>
        <div className="relative h-64 overflow-hidden rounded-lg bg-white p-3 shadow-inner shadow-slate-200/80">
          <div className="absolute inset-x-4 top-5 grid h-[calc(100%-3.5rem)] grid-rows-4">
            {[5, 4, 3, 2].map((label) => (
              <div
                className="border-t border-dashed border-slate-200"
                key={label}
              >
                <span className="-mt-2 inline-block bg-white pr-2 text-[10px] font-bold text-slate-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <svg
            className="absolute inset-4 h-[calc(100%-3.5rem)] w-[calc(100%-2rem)]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {areaPath ? <path d={areaPath} fill="url(#moodArea)" /> : null}
            <defs>
              <linearGradient id="moodArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {path ? (
              <path
                d={path}
                fill="none"
                stroke="#10b981"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          {points.map((point, index) => (
            <button
              type="button"
              className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-white text-lg shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              key={`${point.time}-${index}`}
              style={{
                left: `${4 + point.x * 0.92}%`,
                top: `${8 + point.y * 0.68}%`,
              }}
              aria-label={`${point.time}, ${moodLabels[point.mood - 1]}`}
              onClick={() => cycle(index)}
            >
              {point.emoji}
            </button>
          ))}
          <div
            className="absolute inset-x-4 bottom-3 grid"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, bars.length)}, minmax(0, 1fr))`,
            }}
          >
            {bars.map((bar) => (
              <span
                className="text-center text-[11px] font-bold text-slate-400"
                key={bar.time}
              >
                {bar.time}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-base font-bold text-slate-950">Mood Insights</h3>
        <ul className="grid gap-2 md:grid-cols-2">
          {moodInsights.map((insight, index) => (
            <li
              className="patient-analytics-row flex gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600"
              key={insight}
            >
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: moodColor((index % 5) + 1) }}
              />
              {insight}
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}
