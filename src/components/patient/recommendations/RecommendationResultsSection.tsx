import EmptyState from "../../common/EmptyState";
import ErrorState from "../../common/ErrorState";
import DoctorRecommendationCard from "./DoctorRecommendationCard";
import RecommendationSkeleton from "./RecommendationSkeleton";
import type { DoctorRecommendation } from "../../../types/recommendations";

type RecommendationResultsSectionProps = {
  conditionLabel: string;
  error: string;
  isLoading: boolean;
  recommendations: DoctorRecommendation[];
  usedCuratedProfiles: boolean;
  onContact: (doctor: DoctorRecommendation) => void;
  onRetry: () => void;
};

export default function RecommendationResultsSection({
  conditionLabel,
  error,
  isLoading,
  recommendations,
  usedCuratedProfiles,
  onContact,
  onRetry,
}: RecommendationResultsSectionProps) {
  const hasRecommendations = recommendations.length > 0;

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Step 2</span>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-app-text">
            Best matches for {conditionLabel.toLowerCase()}
          </h2>
        </div>
        {usedCuratedProfiles ? (
          <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-amber-700 ring-1 ring-amber-100">
            Curated profiles included
          </span>
        ) : null}
      </div>

      {error ? (
        <ErrorState
          title="Recommendations are unavailable"
          message={error}
          actionLabel="Try again"
          onAction={onRetry}
        />
      ) : null}

      {isLoading ? <RecommendationSkeleton /> : null}

      {!isLoading && !error && !hasRecommendations ? (
        <EmptyState message="No doctors matched this condition yet. Try another condition or check again after doctors are added." />
      ) : null}

      {!isLoading && !error && hasRecommendations ? (
        <div className="grid gap-4">
          {recommendations.map((doctor) => (
            <DoctorRecommendationCard key={doctor.id} doctor={doctor} onContact={onContact} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
