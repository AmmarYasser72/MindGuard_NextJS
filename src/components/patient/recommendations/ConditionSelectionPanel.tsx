import Button from "../../common/Button";
import Card from "../../common/Card";
import { patientConditionOptions } from "../../../data/doctorRecommendations";
import ConditionSelector from "./ConditionSelector";
import type { PatientConditionId } from "../../../types/recommendations";

type ConditionSelectionPanelProps = {
  conditionLabel: string;
  selectedCondition: PatientConditionId;
  totalDoctors: number;
  usedCuratedProfiles: boolean;
  onReset: () => void;
  onSelect: (condition: PatientConditionId) => void;
};

export default function ConditionSelectionPanel({
  conditionLabel,
  selectedCondition,
  totalDoctors,
  usedCuratedProfiles,
  onReset,
  onSelect,
}: ConditionSelectionPanelProps) {
  return (
    <Card className="patient-recommendation-panel patient-recommendation-workspace overflow-hidden p-0 [html:not([data-theme='dark'])_&]:border-[rgba(180,197,219,0.8)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,252,255,0.96)_62%,rgba(244,247,255,0.92)_100%)] [html:not([data-theme='dark'])_&]:shadow-[0_1.2rem_2.8rem_rgba(55,65,118,0.08)]">
      <div className="patient-recommendation-workspace-head grid gap-4 p-5 [html:not([data-theme='dark'])_&]:bg-[linear-gradient(135deg,rgba(236,254,255,0.72),rgba(255,255,255,0.82)_46%,rgba(245,243,255,0.66))] sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="patient-recommendation-step-pill rounded-full bg-[color-mix(in_srgb,var(--patient-doctor-accent)_10%,var(--patient-card))] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[var(--patient-doctor-accent)] shadow-[inset_0_0_0_1px_var(--patient-recommendation-soft-border)]">Step 1</span>
            <span className="patient-recommendation-step-pill is-muted rounded-full bg-[color-mix(in_srgb,var(--primary)_8%,var(--patient-card))] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)] shadow-[inset_0_0_0_1px_var(--patient-recommendation-soft-border)]">Step 2 ready</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-app-text">
            Choose a condition and review matches
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-app-text-soft">
            Scores update by specialization, matching keywords, experience, and available contact methods.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="rounded-full bg-teal-50 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-teal-700 ring-1 ring-teal-100">
            {totalDoctors} doctors
          </span>
          {usedCuratedProfiles ? (
            <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-amber-700 ring-1 ring-amber-100">
              Curated included
            </span>
          ) : null}
          <Button className="patient-recommendation-reset-button [html:not([data-theme='dark'])_&]:border [html:not([data-theme='dark'])_&]:border-[rgba(203,213,225,0.82)] [html:not([data-theme='dark'])_&]:bg-white/70 [html:not([data-theme='dark'])_&]:hover:bg-white [html:not([data-theme='dark'])_&]:hover:shadow-[0_0.65rem_1.4rem_rgba(55,65,118,0.07)]" variant="ghost" icon="refresh-cw" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <ConditionSelector
          options={patientConditionOptions}
          selectedCondition={selectedCondition}
          onSelect={onSelect}
        />
      </div>

      <div className="patient-recommendation-summary-row flex flex-wrap items-center justify-between gap-3 border-t border-[var(--patient-line)] bg-[color-mix(in_srgb,var(--patient-doctor-accent)_5%,var(--patient-card))] px-5 py-4 [html:not([data-theme='dark'])_&]:border-[rgba(180,197,219,0.7)] [html:not([data-theme='dark'])_&]:bg-[linear-gradient(90deg,rgba(236,254,255,0.82),rgba(245,243,255,0.78))] sm:px-6">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Best matches</span>
          <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-app-text">
            Doctors for {conditionLabel.toLowerCase()}
          </h3>
        </div>
        <span className="patient-recommendation-summary-chip rounded-full bg-[color-mix(in_srgb,var(--patient-doctor-accent)_10%,var(--patient-card))] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--patient-doctor-accent)] shadow-[inset_0_0_0_1px_var(--patient-recommendation-soft-border)]">
          Ranked by condition fit
        </span>
      </div>
    </Card>
  );
}
