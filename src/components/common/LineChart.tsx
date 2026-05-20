type LineSeries = {
  data: number[];
  color?: string;
  dash?: string;
  fill?: boolean;
  fillOpacity?: number;
  label?: string;
  showDots?: boolean;
};

type LineChartProps = {
  color?: string;
  data?: number[];
  fill?: boolean;
  labels?: string[];
  series?: LineSeries[];
};

export default function LineChart({ data = [], color = "#6366f1", fill = true, labels = [], series }: LineChartProps) {
  const normalizedSeries = series?.length
    ? series.map((entry, index) => ({
        color: entry.color || color,
        dash: entry.dash || undefined,
        data: entry.data?.length ? entry.data : [0],
        fill: entry.fill ?? (fill && index === 0),
        fillOpacity: entry.fillOpacity ?? 0.1,
        label: entry.label || `Series ${index + 1}`,
        showDots: entry.showDots ?? true,
      }))
    : [
        {
          color,
          dash: undefined,
          data: data.length ? data : [0],
          fill,
          fillOpacity: 0.1,
          label: "Series 1",
          showDots: true,
        },
      ];
  const values = normalizedSeries.flatMap((entry) => entry.data);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const plottedSeries = normalizedSeries.map((entry, entryIndex) => {
    const points = entry.data.map((value, index) => {
      const x = entry.data.length === 1 ? 50 : (index / (entry.data.length - 1)) * 100;
      const y = 90 - ((value - min) / range) * 75;
      return [x, y] as const;
    });
    const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
    const fillPath = `${path} L 100 100 L 0 100 Z`;

    return {
      ...entry,
      fillPath,
      key: `${entry.label}-${entryIndex}`,
      path,
      points,
    };
  });

  return (
    <div className="grid gap-3">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-40 w-full rounded-[1.25rem] bg-gradient-to-b from-slate-50 to-slate-100/80"
      >
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(156,163,175,0.35)" strokeDasharray="2 3" />
        ))}
        {plottedSeries
          .filter((entry) => entry.fill)
          .map((entry) => <path d={entry.fillPath} fill={entry.color} key={`${entry.key}-fill`} opacity={entry.fillOpacity} />)}
        {plottedSeries.map((entry) => (
          <path
            d={entry.path}
            fill="none"
            key={`${entry.key}-line`}
            stroke={entry.color}
            strokeDasharray={entry.dash}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        ))}
        {plottedSeries.map((entry) =>
          entry.showDots
            ? entry.points.map(([x, y], pointIndex) => (
                <circle key={`${entry.key}-${pointIndex}`} cx={x} cy={y} r="2" fill={entry.color} vectorEffect="non-scaling-stroke" />
              ))
            : null,
        )}
      </svg>
      {labels.length ? (
        <div className="flex justify-between gap-2 text-[11px] font-semibold text-slate-400">
          {labels.map((label) => <span key={label}>{label}</span>)}
        </div>
      ) : null}
    </div>
  );
}
