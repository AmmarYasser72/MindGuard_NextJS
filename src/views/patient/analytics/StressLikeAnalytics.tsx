import AnalyticsChart from "./AnalyticsChart";
import AnalyticsHeader from "./AnalyticsHeader";
import CrisisCard from "./CrisisCard";
import MetricGradientCard from "./MetricGradientCard";
import ProgressSection from "./ProgressSection";
import TechniqueSection from "./TechniqueSection";
import TriggerSection from "./TriggerSection";

export default function StressLikeAnalytics({ data }) {
  return (
    <div className="grid gap-5 p-4 sm:gap-6 sm:p-6">
      <AnalyticsHeader title={data.title} subtitle={data.subtitle} timeframe={data.timeframe} />
      <MetricGradientCard current={data.current} />
      <AnalyticsChart title={data.chart.title} tag={data.chart.tag} color={data.chart.color} data={data.chart.data} description={data.chart.description} labels={data.chart.labels} />
      <TriggerSection title={data.title.includes("Anxiety") ? "Top Anxiety Triggers" : "Top Stress Triggers"} triggers={data.triggers} />
      <TechniqueSection title={data.techniquesTitle} techniques={data.techniques} color="#f59e0b" />
      {data.secondaryTechniques ? <TechniqueSection title={data.secondaryTechniquesTitle} techniques={data.secondaryTechniques} color="#f59e0b" /> : null}
      <ProgressSection items={data.progress} />
      <CrisisCard crisis={data.crisis} />
    </div>
  );
}
