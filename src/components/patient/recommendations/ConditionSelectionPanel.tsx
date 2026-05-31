import Button from "../../common/Button";
import Card from "../../common/Card";
import { patientConditionOptions } from "../../../data/doctorRecommendations";
import ConditionSelector from "./ConditionSelector";
import type { PatientConditionId } from "../../../types/recommendations";

type ConditionSelectionPanelProps = {
  selectedCondition: PatientConditionId;
  onReset: () => void;
  onSelect: (condition: PatientConditionId) => void;
};

export default function ConditionSelectionPanel({
  selectedCondition,
  onReset,
  onSelect,
}: ConditionSelectionPanelProps) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--patient-doctor-accent)]">Step 1</span>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-app-text">Choose the main condition</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-app-text-soft">
            Recommendations are scored by specialization, matching keywords, experience, and available contact methods.
          </p>
        </div>
        <Button variant="ghost" icon="refresh-cw" onClick={onReset}>
          Reset
        </Button>
      </div>
      <ConditionSelector
        options={patientConditionOptions}
        selectedCondition={selectedCondition}
        onSelect={onSelect}
      />
    </Card>
  );
}
