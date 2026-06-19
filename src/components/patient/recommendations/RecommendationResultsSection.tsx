import { useState } from "react";
import EmptyState from "../../common/EmptyState";
import ErrorState from "../../common/ErrorState";
import Icon from "../../common/Icon";
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
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecommendations = normalizedQuery
    ? recommendations.filter((doctor) => {
        const searchableText = [
          doctor.displayName,
          doctor.specialization,
          doctor.bio,
          doctor.languages.join(" "),
          doctor.careModes.join(" "),
          doctor.matchReasons.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : recommendations;
  const hasRecommendations = recommendations.length > 0;
  const hasFilteredRecommendations = filteredRecommendations.length > 0;

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

      {!isLoading && !error && hasRecommendations ? (
        <div className="flex flex-col gap-3 rounded-[1.35rem] border border-[var(--patient-line)] bg-[var(--patient-card)] p-4 shadow-app sm:flex-row sm:items-center sm:justify-between">
          <label className="group flex min-h-12 w-full items-center gap-3 rounded-[1rem] border border-[var(--patient-line)] bg-[var(--patient-card-soft)] px-4 transition focus-within:border-[color-mix(in_srgb,var(--patient-doctor-accent)_36%,var(--patient-line))] focus-within:ring-4 focus-within:ring-teal-100 sm:max-w-xl">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--patient-card)] text-[var(--patient-doctor-accent)] shadow-sm">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by doctor name, specialty, language, or care mode"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm font-semibold text-app-text outline-none placeholder:text-app-faint"
              aria-label="Search doctors"
            />
          </label>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-sm font-semibold text-app-text-soft">
              {filteredRecommendations.length} result
              {filteredRecommendations.length === 1 ? "" : "s"}
            </p>
            {searchQuery ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--patient-line)] bg-[var(--patient-card-soft)] px-4 text-sm font-bold text-app-text-soft transition hover:border-[color-mix(in_srgb,var(--patient-doctor-accent)_24%,var(--patient-line))] hover:text-app-text focus:outline-none focus:ring-4 focus:ring-teal-100"
                onClick={() => setSearchQuery("")}
              >
                <Icon name="x" size={16} />
                Clear
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isLoading && !error && !hasRecommendations ? (
        <EmptyState message="No doctors matched this condition yet. Try another condition or check again after doctors are added." />
      ) : null}

      {!isLoading && !error && hasRecommendations && !hasFilteredRecommendations ? (
        <EmptyState
          message={`No doctors matched "${searchQuery}". Try another name, specialty, language, or care mode.`}
        />
      ) : null}

      {!isLoading && !error && hasFilteredRecommendations ? (
        <div className="grid gap-4">
          {filteredRecommendations.map((doctor) => (
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
