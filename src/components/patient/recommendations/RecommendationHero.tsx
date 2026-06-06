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
    <Card className="patient-recommendation-hero overflow-hidden p-0 !border-[var(--patient-recommendation-soft-border)] ![background:var(--patient-recommendation-hero-bg)] [html:not([data-theme='dark'])_&]:shadow-[0_1rem_2.5rem_rgba(55,65,118,0.075),inset_0_0_0_1px_rgba(255,255,255,0.7)]">
      <div className="patient-recommendation-hero-grid grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:p-6">
        <div className="patient-recommendation-hero-copy min-w-0">
          <span className="patient-recommendation-badge inline-flex items-center gap-2 rounded-full bg-[var(--patient-recommendation-badge-bg)] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--patient-doctor-accent)] shadow-[inset_0_0_0_1px_var(--patient-recommendation-soft-border)]">
            <Icon name="stethoscope" size={16} />
            Care matching
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] text-app-text sm:text-4xl lg:text-[2.15rem]">
            Find supportive doctors for {conditionLabel.toLowerCase()}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-app-text-soft sm:text-base">
            MindGuard compares specialties, experience, contact readiness, and
            condition fit so the next step feels clear and comfortable.
          </p>
          <div className="patient-recommendation-hero-note mt-4 flex max-w-xl items-start gap-3 rounded-2xl p-3 [html:not([data-theme='dark'])_&]:border [html:not([data-theme='dark'])_&]:border-[rgba(14,116,144,0.12)] [html:not([data-theme='dark'])_&]:bg-white/60 [html:not([data-theme='dark'])_&]:shadow-[0_0.65rem_1.4rem_rgba(14,116,144,0.05)]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,rgba(14,116,144,0.12),rgba(99,102,241,0.12))] [html:not([data-theme='dark'])_&]:text-[var(--patient-doctor-accent)]">
              <Icon name="sparkles" size={17} />
            </span>
            <span className="text-sm font-semibold leading-6 text-app-text-soft">
              Recommendations refresh when you choose a different condition
              below.
            </span>
          </div>
        </div>

        <div className="patient-recommendation-metric-rail grid gap-2.5 rounded-[1.25rem] p-3 [html:not([data-theme='dark'])_&]:border [html:not([data-theme='dark'])_&]:border-[rgba(203,213,225,0.72)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,252,255,0.72))] [html:not([data-theme='dark'])_&]:shadow-[0_1rem_2.2rem_rgba(55,65,118,0.08),inset_0_0_0_1px_rgba(255,255,255,0.64)] max-lg:[html:not([data-theme='dark'])_&]:border-t-[rgba(99,102,241,0.1)]">
          <div className="patient-recommendation-snapshot-head flex items-center gap-3 [html:not([data-theme='dark'])_&]:rounded-2xl [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,rgba(236,254,255,0.76),rgba(245,243,255,0.68))] [html:not([data-theme='dark'])_&]:p-[0.65rem]">
            <span className="grid h-10 w-10 place-items-center rounded-2xl [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,var(--patient-doctor-accent),var(--primary))] [html:not([data-theme='dark'])_&]:text-white">
              <Icon name="heart-handshake" size={20} />
            </span>
            <span>
              <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-app-muted">
                Match snapshot
              </span>
              <strong className="block text-base font-black text-app-text">
                Ready for {conditionLabel.toLowerCase()}
              </strong>
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <HeroMetric
              icon="users"
              label="Doctors shown"
              value={String(totalDoctors)}
            />
            <HeroMetric
              icon="server"
              label="Doctor source"
              value={backendAvailable ? "Live checked" : "Fallback ready"}
            />
            <HeroMetric
              icon="shield-check"
              label="Coverage"
              value={usedCuratedProfiles ? "Enhanced" : "Live"}
            />
          </div>
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
    <div className="patient-recommendation-metric flex min-h-14 items-center gap-2 rounded-2xl bg-[var(--patient-recommendation-metric-bg)] p-3 shadow-[inset_0_0_0_1px_var(--patient-line),0_0.75rem_1.9rem_rgba(15,23,42,0.06)] [html:not([data-theme='dark'])_&]:min-h-[3.75rem] [html:not([data-theme='dark'])_&]:rounded-[1.1rem] [html:not([data-theme='dark'])_&]:bg-white/70 [html:not([data-theme='dark'])_&]:p-[0.65rem] [html:not([data-theme='dark'])_&]:shadow-[inset_0_0_0_1px_rgba(226,232,240,0.78),0_0.45rem_1rem_rgba(67,56,202,0.035)]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--patient-doctor-accent)] shadow-sm [html:not([data-theme='dark'])_&]:h-8 [html:not([data-theme='dark'])_&]:w-8 [html:not([data-theme='dark'])_&]:rounded-[0.8rem]">
        <Icon name={icon} size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-app-muted">
          {label}
        </span>
        <strong className="mt-0.5 block break-words text-lg font-black leading-5 text-app-text [html:not([data-theme='dark'])_&]:text-[0.96rem] [html:not([data-theme='dark'])_&]:leading-[1.1rem]">
          {value}
        </strong>
      </span>
    </div>
  );
}
