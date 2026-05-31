"use client";

import Icon from "../../common/Icon";
import { cn } from "../../../utils/cn";
import type { PatientConditionId, PatientConditionOption } from "../../../types/recommendations";

type ConditionSelectorProps = {
  options: PatientConditionOption[];
  selectedCondition: PatientConditionId;
  onSelect: (condition: PatientConditionId) => void;
};

export default function ConditionSelector({ options, selectedCondition, onSelect }: ConditionSelectorProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Choose your current condition">
      {options.map((option) => {
        const isSelected = option.id === selectedCondition;

        return (
          <button
            type="button"
            key={option.id}
            className={cn(
              "patient-condition-card group min-h-36 rounded-[1.35rem] border p-4 text-left transition duration-300 focus:outline-none focus:ring-4 focus:ring-teal-100",
              isSelected ? "is-active shadow-[0_18px_42px_rgba(13,148,136,0.14)]" : "hover:-translate-y-0.5",
            )}
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
          >
            <span className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "patient-condition-icon grid h-11 w-11 place-items-center rounded-2xl transition",
                  isSelected ? "is-active" : "",
                )}
              >
                <Icon name={option.icon} size={21} color="currentColor" />
              </span>
              {isSelected ? (
                <span className="patient-condition-badge rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]">
                  Active
                </span>
              ) : null}
            </span>
            <strong className="mt-5 block text-base font-black text-app-text">{option.label}</strong>
            <span className="mt-2 block text-sm leading-6 text-app-text-soft">{option.description}</span>
          </button>
        );
      })}
    </section>
  );
}
