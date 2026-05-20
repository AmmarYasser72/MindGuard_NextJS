import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import DoctorDashboard from "@/src/views/doctor/DoctorDashboard";

export default function Page() {
  return (
    <ProtectedRoute roles={["doctor"]}>
      <DoctorDashboard />
    </ProtectedRoute>
  );
}
