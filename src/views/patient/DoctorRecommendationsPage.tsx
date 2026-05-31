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
  const { back, navigate } = useRouter();
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
    <main className="patient-shell patient-recommendations-shell dashboard-shell min-h-screen ![background:var(--patient-recommendations-bg)] text-app-text">
      <AppTopBar
        title="Doctor Recommendations"
        subtitle="Find care"
        onBack={() => back("/patient-dashboard")}
        actionIcon="message-circle"
        actionLabel="Open care chat"
        onAction={openCareChat}
      />

      <section className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-6 sm:px-6 lg:px-8">
        <RecommendationHero
          conditionLabel={selectedConditionOption.label}
          totalDoctors={recommendations.length}
          backendAvailable={Boolean(result?.backendAvailable)}
          usedCuratedProfiles={Boolean(result?.usedCuratedProfiles)}
        />

        <ConditionSelectionPanel
          conditionLabel={selectedConditionOption.label}
          selectedCondition={selectedCondition}
          totalDoctors={recommendations.length}
          usedCuratedProfiles={Boolean(result?.usedCuratedProfiles)}
          onReset={resetCondition}
          onSelect={loadCondition}
        />

        <RecommendationResultsSection
          error={error}
          isLoading={isLoading}
          recommendations={recommendations}
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
