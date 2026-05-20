import { notFound } from "next/navigation";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import { toolPages } from "@/src/data/patientData";
import PatientToolPage from "@/src/views/patient/PatientToolPage";

type ToolPageProps = {
  params: Promise<{ tool: string }>;
};

export default async function Page({ params }: ToolPageProps) {
  const { tool } = await params;
  const config = toolPages[`/${tool}` as keyof typeof toolPages];

  if (!config) {
    notFound();
  }

  return (
    <ProtectedRoute roles={["patient"]}>
      <PatientToolPage config={config} />
    </ProtectedRoute>
  );
}
