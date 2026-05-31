import Card from "../../common/Card";
import Icon from "../../common/Icon";

type RecommendationHeroProps = {
  backendAvailable: boolean;
  conditionLabel: string;
  totalDoctors: number;
  usedCuratedProfiles: boolean;
};

export default function RecommendationHero({
  backendAvailable,
  conditionLabel,
  totalDoctors,
  usedCuratedProfiles,
}: RecommendationHeroProps) {
  return (
    <Card className="patient-recommendation-hero relative overflow-hidden p-6 sm:p-8">
      <div className="patient-recommendation-hero-orb pointer-events-none absolute right-8 top-8 h-28 w-28 rounded-full blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <span className="patient-recommendation-badge inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.14em]">
            <Icon name="stethoscope" size={16} />
            Recommendation system
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] text-app-text sm:text-5xl">
            Find the right doctor for {conditionLabel.toLowerCase()}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-app-text-soft">
            MindGuard ranks doctors by patient condition, doctor specialization, experience, and contact readiness so patients can move from insight to support quickly.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-80 lg:grid-cols-1">
          <HeroMetric icon="users" label="Doctors shown" value={String(totalDoctors)} />
          <HeroMetric icon="server" label="Backend doctors" value={backendAvailable ? "Checked" : "Fallback"} />
          <HeroMetric icon="shield-check" label="Coverage" value={usedCuratedProfiles ? "Enhanced" : "Live"} />
        </div>
      </div>
    </Card>
  );
}

type HeroMetricProps = {
  icon: string;
  label: string;
  value: string;
};

function HeroMetric({ icon, label, value }: HeroMetricProps) {
  return (
    <div className="patient-recommendation-metric rounded-2xl p-4 shadow-sm">
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-app-muted">
        <Icon name={icon} size={15} />
        {label}
      </span>
      <strong className="mt-2 block text-xl font-black text-app-text">{value}</strong>
    </div>
  );
}
