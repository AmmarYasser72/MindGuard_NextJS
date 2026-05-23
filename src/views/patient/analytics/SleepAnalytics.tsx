import Card from "../../../components/common/Card";
import Icon from "../../../components/common/Icon";
import LineChart from "../../../components/common/LineChart";
import { sleepAnalytics } from "../../../data/analyticsData";
import AnalyticsHeader from "./AnalyticsHeader";
import GoalProgress from "./GoalProgress";

export default function SleepAnalytics() {
  return (
    <div className="grid gap-5 p-4 sm:gap-6 sm:p-6">
      <AnalyticsHeader title="Sleep Analytics" subtitle="Track your sleep quality and recovery patterns" timeframe="7 day window" />
      <section className="grid gap-5 rounded-[1.75rem] bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] px-6 py-6 text-white shadow-[0_22px_40px_rgba(76,29,149,0.14)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {sleepAnalytics.summary.map((item) => (
            <span className="grid min-w-[9rem] gap-2" key={item.label}>
              <Icon name={item.icon} size={24} color="#fff" />
              <small className="text-sm font-bold text-white/80">{item.label}</small>
              <strong className="text-[1.75rem] font-bold leading-none">{item.value}</strong>
            </span>
          ))}
        </div>
        <em className="inline-flex w-fit items-center rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] not-italic text-white/90">
          Good Sleep
        </em>
      </section>
      <Card className="grid gap-5 rounded-[1.5rem] p-5 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
          <span className="grid gap-1.5">
            <h2 className="text-xl font-bold text-slate-950">Sleep Patterns</h2>
            <small className="text-sm leading-6 text-slate-500">Comparing sleep quality with next-day energy shows how recovery affects your routine.</small>
          </span>
          <span className="inline-flex min-h-9 items-center rounded-full bg-violet-100 px-3 text-xs font-black uppercase tracking-[0.16em] text-violet-700">
            7 days
          </span>
        </div>
        <LineChart
          labels={sleepAnalytics.labels}
          series={[
            { label: "Sleep Quality", data: sleepAnalytics.chart, color: "#8b5cf6", fill: true },
            { label: "Energy Level", data: sleepAnalytics.energy, color: "#06b6d4", dash: "5 4", fill: false },
          ]}
        />
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
          {sleepAnalytics.legend.map((item) => (
            <span className="inline-flex items-center gap-2" key={item.label}>
              <b className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </Card>
      <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Sleep Stages</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sleepAnalytics.stages.map((stage) => (
            <div
              className="grid min-h-28 content-between gap-3 rounded-[1.25rem] border border-white/70 p-4 shadow-sm"
              key={stage.stage}
              style={{ backgroundColor: `${stage.color}1a` }}
            >
              <strong className="text-sm font-bold" style={{ color: stage.color }}>{stage.stage}</strong>
              <b className="text-2xl font-bold" style={{ color: stage.color }}>{stage.duration}</b>
              <span className="text-xs font-bold text-slate-600">{stage.percentage}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Sleep Hygiene Tips</h2>
        <div className="grid gap-3">
          {sleepAnalytics.tips.map((tip) => (
            <div className="patient-analytics-row grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-[auto_1fr] sm:items-center" key={tip.title}>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100">
                <Icon name={tip.icon} size={20} color="#8b5cf6" />
              </span>
              <span className="grid gap-1">
                <strong className="text-sm font-bold text-slate-900">{tip.title}</strong>
                <small className="text-xs leading-5 text-slate-500">{tip.description}</small>
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Sleep Goals</h2>
        <div className="grid gap-4">
          {sleepAnalytics.goals.map((goal) => <GoalProgress key={goal.goal} goal={goal} />)}
        </div>
      </Card>
    </div>
  );
}
