import Card from "../../../components/common/Card";
import Icon from "../../../components/common/Icon";
import { useToast } from "../../../components/common/Toast";
import { depressionAnalytics } from "../../../data/analyticsData";
import AnalyticsChart from "./AnalyticsChart";
import AnalyticsHeader from "./AnalyticsHeader";
import CrisisCard from "./CrisisCard";
import TechniqueSection from "./TechniqueSection";

export default function DepressionAnalytics() {
  const { showToast } = useToast();

  return (
    <div className="grid gap-5 p-4 sm:gap-6 sm:p-6">
      <AnalyticsHeader title="Depression" subtitle="Monitor your mental health patterns" timeframe={depressionAnalytics.timeframe} />
      <section className="grid gap-5 rounded-[1.75rem] bg-[linear-gradient(135deg,#ef4444,#dc2626)] px-6 py-6 text-white shadow-[0_22px_40px_rgba(185,28,28,0.16)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <span className="grid min-w-[9rem] gap-2"><Icon name="brain" size={24} color="#fff" /><small className="text-sm font-bold text-white/80">Severity</small><strong className="text-[1.75rem] font-bold leading-none">Mild</strong></span>
          <span className="grid min-w-[9rem] gap-2"><Icon name="clipboard-list" size={24} color="#fff" /><small className="text-sm font-bold text-white/80">Score</small><strong className="text-[1.75rem] font-bold leading-none">6/10</strong></span>
          <span className="grid min-w-[9rem] gap-2"><Icon name="trending-up" size={24} color="#fff" /><small className="text-sm font-bold text-white/80">Trend</small><strong className="text-[1.75rem] font-bold leading-none">Improving</strong></span>
        </div>
        <em className="inline-flex w-fit items-center rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] not-italic text-white/90">
          Last assessment: 2 days ago
        </em>
      </section>
      <AnalyticsChart
        title="Depression Severity Over Time"
        tag="Week"
        color="#ef4444"
        data={depressionAnalytics.severityData}
        description="Lower scores across the week suggest recovery is moving in a positive direction."
        labels={depressionAnalytics.labels}
      />
      <TechniqueSection title="Effective Coping Strategies" techniques={depressionAnalytics.strategies} color="#ef4444" />
      <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Mood Correlation Analysis</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {depressionAnalytics.correlations.map((item) => (
            <div
              className="grid min-h-32 content-start gap-2 rounded-[1.25rem] border border-white/70 p-4 shadow-sm"
              key={item.factor}
              style={{ backgroundColor: `${item.color}1a` }}
            >
              <strong className="text-sm font-bold" style={{ color: item.color }}>{item.factor}</strong>
              <b className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</b>
              <span className="text-xs leading-5 text-slate-600">{item.text}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="grid gap-4 rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Professional Support</h2>
        <div className="grid gap-3">
          {depressionAnalytics.support.map((item) => (
            <button
              type="button"
              className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              key={item.title}
              onClick={() => showToast(`${item.title} resources are ready to open`, "success")}
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: `${item.color}1a` }}>
                <Icon name={item.icon} size={20} color={item.color} />
              </span>
              <span className="grid gap-1">
                <strong className="text-sm font-bold text-slate-900">{item.title}</strong>
                <small className="text-xs leading-5 text-slate-500">Open guidance and next steps</small>
              </span>
              <Icon name="chevron-right" size={14} color={item.color} />
            </button>
          ))}
        </div>
      </Card>
      <CrisisCard
        crisis={{
          title: "Crisis Support",
          subtitle: "If you're having thoughts of self-harm, reach out immediately.",
          gradient: ["#ef4444", "#dc2626"],
          primary: "Safety Steps",
          secondary: "Support Chat",
          primaryAction: { type: "toast", message: "If you feel unsafe, contact your local emergency or crisis service immediately." },
          secondaryAction: { type: "navigate", path: "/patient-chat/support@mindguard.app" },
        }}
      />
    </div>
  );
}
