"use client";

import Icon from "../../common/Icon";
import { cn } from "../../../utils/cn";
import type {
  PatientConditionId,
  PatientConditionOption,
} from "../../../types/recommendations";

type ConditionSelectorProps = {
  options: PatientConditionOption[];
  selectedCondition: PatientConditionId;
  onSelect: (condition: PatientConditionId) => void;
};

export default function ConditionSelector({
  options,
  selectedCondition,
  onSelect,
}: ConditionSelectorProps) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Choose your current condition"
    >
      {options.map((option) => {
        const isSelected = option.id === selectedCondition;

        return (
          <button
            type="button"
            key={option.id}
            className={cn(
              "patient-condition-card group min-h-[7.25rem] rounded-[1rem] border border-[var(--patient-line)] bg-[var(--patient-card)] p-3.5 text-left text-[var(--text)] transition duration-300 hover:border-[color-mix(in_srgb,var(--patient-doctor-accent)_34%,var(--patient-line))] hover:bg-[var(--patient-card-muted)] focus:outline-none focus:ring-4 focus:ring-teal-100 [html:not([data-theme='dark'])_&]:bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] [html:not([data-theme='dark'])_&]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] [html:not([data-theme='dark'])_&]:hover:bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] [html:not([data-theme='dark'])_&]:hover:shadow-[0_1rem_2rem_rgba(55,65,118,0.08)]",
              isSelected
                ? "is-active border-[color-mix(in_srgb,var(--patient-doctor-accent)_42%,var(--patient-line))] bg-[var(--patient-condition-active-bg)] shadow-[0_18px_42px_rgba(13,148,136,0.14)] [html:not([data-theme='dark'])_&]:shadow-[0_1.1rem_2.6rem_rgba(14,116,144,0.12)]"
                : "hover:-translate-y-0.5",
            )}
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
          >
            <span className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "patient-condition-icon grid h-10 w-10 place-items-center rounded-2xl bg-[var(--patient-condition-icon-bg)] text-[var(--patient-doctor-accent)] transition",
                  isSelected
                    ? "is-active bg-[var(--patient-condition-icon-active-bg)] text-white"
                    : "",
                )}
              >
                <Icon name={option.icon} size={20} color="currentColor" />
              </span>
              {isSelected ? (
                <span className="patient-condition-badge rounded-full bg-[var(--patient-condition-badge-bg)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--patient-doctor-accent)] shadow-[inset_0_0_0_1px_var(--patient-recommendation-soft-border)]">
                  Selected
                </span>
              ) : null}
            </span>
            <strong className="mt-4 block text-base font-black text-app-text">
              {option.label}
            </strong>
            <span className="mt-1.5 block text-sm leading-6 text-app-text-soft">
              {option.description}
            </span>
          </button>
        );
      })}
    </section>
  );
}
