import EmptyState from "../../common/EmptyState";
import ErrorState from "../../common/ErrorState";
import DoctorRecommendationCard from "./DoctorRecommendationCard";
import RecommendationSkeleton from "./RecommendationSkeleton";
import type { DoctorRecommendation } from "../../../types/recommendations";

type RecommendationResultsSectionProps = {
  error: string;
  isLoading: boolean;
  recommendations: DoctorRecommendation[];
  onContact: (doctor: DoctorRecommendation) => void;
  onRetry: () => void;
};

export default function RecommendationResultsSection({
  error,
  isLoading,
  recommendations,
  onContact,
  onRetry,
}: RecommendationResultsSectionProps) {
  const hasRecommendations = recommendations.length > 0;

  return (
    <section
      className="patient-recommendation-results space-y-4"
      aria-live="polite"
    >
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
            <DoctorRecommendationCard
              key={doctor.id}
              doctor={doctor}
              onContact={onContact}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
