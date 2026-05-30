import LineChart from "../../../components/common/LineChart";
import { weeklyMood } from "../../../data/patientData";
import DashboardPanel from "./DashboardPanel";

type MoodTrendPanelProps = {
  average: number;
  bestMoodDay: {
    value: number;
  };
};

export default function MoodTrendPanel({ average, bestMoodDay }: MoodTrendPanelProps) {
  return (
    <DashboardPanel>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Mood trend</span>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Weekly Mood Journey</h2>
          <p className="mt-1 text-sm text-slate-500">Average mood this week: <strong className="text-[var(--primary)]">{average}%</strong></p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right sm:min-w-44">
          <MiniStat label="Peak" value={`${Math.round(bestMoodDay.value * 100)}%`} />
          <MiniStat label="Status" value="Stable" />
        </div>
      </div>
      <LineChart data={weeklyMood.map((item) => item.value * 100)} color="#6366f1" labels={weeklyMood.map((item) => item.day)} />
    </DashboardPanel>
  );
}

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <span className="patient-mini-stat rounded-lg bg-violet-50 px-3 py-2 text-left">
      <small className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</small>
      <strong className="mt-1 block text-sm font-bold text-slate-900">{value}</strong>
    </span>
  );
}
