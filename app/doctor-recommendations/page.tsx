import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import DoctorRecommendationsPage from "@/src/views/patient/DoctorRecommendationsPage";

export default function Page() {
  return (
    <ProtectedRoute roles={["patient"]}>
      <DoctorRecommendationsPage />
    </ProtectedRoute>
  );
}
