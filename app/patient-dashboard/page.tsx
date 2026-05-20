import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import PatientDashboard from "@/src/views/patient/PatientDashboard";

export default function Page() {
  return (
    <ProtectedRoute roles={["patient"]}>
      <PatientDashboard />
    </ProtectedRoute>
  );
}
