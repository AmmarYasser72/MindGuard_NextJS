"use client";

import { useEffect, useMemo, useState } from "react";
import { patientConditionOptions } from "../data/doctorRecommendations";
import { getDoctorRecommendations } from "../services/doctorRecommendationService";
import type {
  DoctorRecommendation,
  DoctorRecommendationResult,
  PatientConditionId,
} from "../types/recommendations";

export const DEFAULT_DOCTOR_CONDITION: PatientConditionId = "anxiety";

export function useDoctorRecommendations() {
  const [selectedCondition, setSelectedCondition] =
    useState<PatientConditionId>(DEFAULT_DOCTOR_CONDITION);
  const [result, setResult] = useState<DoctorRecommendationResult | null>(null);
  const [contactDoctor, setContactDoctor] =
    useState<DoctorRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const selectedConditionOption = useMemo(
    () =>
      patientConditionOptions.find(
        (condition) => condition.id === selectedCondition,
      ) || patientConditionOptions[0],
    [selectedCondition],
  );

  useEffect(() => {
    let isActive = true;

    getDoctorRecommendations(selectedCondition)
      .then((nextResult) => {
        if (!isActive) return;
        setResult(nextResult);
      })
      .catch((loadError) => {
        if (!isActive) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load doctor recommendations.",
        );
        setResult(null);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [requestVersion, selectedCondition]);

  function prepareRequest() {
    setIsLoading(true);
    setError("");
    setResult(null);
  }

  function loadCondition(condition: PatientConditionId) {
    const shouldRefreshCurrentCondition = condition === selectedCondition;
    prepareRequest();
    setSelectedCondition(condition);

    if (shouldRefreshCurrentCondition) {
      setRequestVersion((version) => version + 1);
    }
  }

  function retryRecommendations() {
    prepareRequest();
    setRequestVersion((version) => version + 1);
  }

  function resetCondition() {
    loadCondition(DEFAULT_DOCTOR_CONDITION);
  }

  return {
    contactDoctor,
    error,
    isLoading,
    loadCondition,
    recommendations: result?.recommendations || [],
    resetCondition,
    retryRecommendations,
    result,
    selectedCondition,
    selectedConditionOption,
    setContactDoctor,
  };
}
