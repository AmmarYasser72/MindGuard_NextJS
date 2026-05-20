import Card from "../../../components/common/Card";
import LineChart from "../../../components/common/LineChart";
import type { ComponentProps } from "react";

const defaultLabels = ["01:00", "05:00", "09:00", "13:00", "17:00", "21:00"];

type AnalyticsChartProps = {
  color: string;
  data: number[];
  tag: string;
  title: string;
  description?: string;
  labels?: string[];
  series?: ComponentProps<typeof LineChart>["series"];
};

export default function AnalyticsChart({ title, tag, color, data, description, labels = defaultLabels, series }: AnalyticsChartProps) {
  return (
    <Card className="grid gap-5 rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
        <span className="grid gap-1.5">
          <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          {description ? <small className="text-sm leading-6 text-slate-500">{description}</small> : null}
        </span>
        <span className="inline-flex min-h-9 items-center rounded-full px-3 text-xs font-black uppercase tracking-[0.16em]" style={{ color, backgroundColor: `${color}1a` }}>
          {tag}
        </span>
      </div>
      <LineChart data={data} color={color} labels={labels} series={series} />
    </Card>
  );
}
