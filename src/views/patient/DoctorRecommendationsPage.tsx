"use client";

import AppTopBar from "../../components/patient/AppTopBar";
import ConditionSelectionPanel from "../../components/patient/recommendations/ConditionSelectionPanel";
import ContactDoctorModal from "../../components/patient/recommendations/ContactDoctorModal";
import RecommendationHero from "../../components/patient/recommendations/RecommendationHero";
import RecommendationResultsSection from "../../components/patient/recommendations/RecommendationResultsSection";
import { useAuth } from "../../hooks/useAuth";
import { useDoctorRecommendations } from "../../hooks/useDoctorRecommendations";
import { useRouter } from "../../hooks/useRouter";

export default function DoctorRecommendationsPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const {
    contactDoctor,
    error,
    isLoading,
    loadCondition,
    recommendations,
    resetCondition,
    result,
    retryRecommendations,
    selectedCondition,
    selectedConditionOption,
    setContactDoctor,
  } = useDoctorRecommendations();
  const patientChatPath = `/patient-chat/${encodeURIComponent(user?.email || user?.uid || "patient")}`;

  function openCareChat() {
    navigate(patientChatPath);
  }

  return (
    <main className="patient-shell dashboard-shell min-h-screen text-app-text">
      <AppTopBar title="Doctor Recommendations" onBack={() => navigate("/patient-dashboard")} actionIcon="message-circle" onAction={openCareChat} />

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <RecommendationHero
          conditionLabel={selectedConditionOption.label}
          totalDoctors={recommendations.length}
          backendAvailable={Boolean(result?.backendAvailable)}
          usedCuratedProfiles={Boolean(result?.usedCuratedProfiles)}
        />

        <ConditionSelectionPanel
          selectedCondition={selectedCondition}
          onReset={resetCondition}
          onSelect={loadCondition}
        />

        <RecommendationResultsSection
          conditionLabel={selectedConditionOption.label}
          error={error}
          isLoading={isLoading}
          recommendations={recommendations}
          usedCuratedProfiles={Boolean(result?.usedCuratedProfiles)}
          onContact={setContactDoctor}
          onRetry={retryRecommendations}
        />
      </section>

      {contactDoctor ? (
        <ContactDoctorModal
          conditionLabel={selectedConditionOption.label}
          doctor={contactDoctor}
          patientEmail={user?.email}
          onClose={() => setContactDoctor(null)}
          onOpenCareChat={openCareChat}
        />
      ) : null}
    </main>
  );
}
