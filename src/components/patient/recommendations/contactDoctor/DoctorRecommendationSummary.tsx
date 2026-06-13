import type { DoctorRecommendation } from "../../../../types/recommendations";
import { matchLabels } from "./contactDoctorUtils";

type DoctorRecommendationSummaryProps = {
  conditionLabel: string;
  doctor: DoctorRecommendation;
};

export default function DoctorRecommendationSummary({
  conditionLabel,
  doctor,
}: DoctorRecommendationSummaryProps) {
  return (
    <div className="rounded-[1.25rem] bg-teal-50 p-4 text-teal-950 ring-1 ring-teal-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
            Recommended for
          </span>
          <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">
            {conditionLabel}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-800">
            {doctor.bio}
          </p>
        </div>
        <span className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
          <strong className="block text-2xl font-black text-teal-800">
            {doctor.matchScore}%
          </strong>
          <small className="font-bold text-teal-700">
            {matchLabels[doctor.matchStatus]}
          </small>
        </span>
      </div>
    </div>
  );
}
