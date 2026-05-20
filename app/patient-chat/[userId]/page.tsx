import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import PatientChat from "@/src/views/patient/PatientChat";

function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type PatientChatPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function Page({ params }: PatientChatPageProps) {
  const { userId } = await params;

  return (
    <ProtectedRoute roles={["patient"]}>
      <PatientChat userId={decodeParam(userId)} />
    </ProtectedRoute>
  );
}
