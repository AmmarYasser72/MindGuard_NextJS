"use client";

import { useToast } from "../../components/common/Toast";
import { useRouter } from "../../hooks/useRouter";
import ActionGrid from "../../components/patient/ActionGrid";
import AppTopBar from "../../components/patient/AppTopBar";
import HeaderCard from "../../components/patient/HeaderCard";
import ToolSection from "./ToolSection";

export default function PatientToolPage({ config }) {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  function toastAction(item) {
    showToast(item.toast || "Details - Coming soon");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f3ff_0%,#f8fafc_46%,#ffffff_100%)]">
      <AppTopBar
        title={config.title}
        onBack={() => navigate("/patient-dashboard")}
        actionIcon={config.title === "Journal" || config.title === "Sleep Log" ? "plus" : undefined}
        onAction={() => showToast(`${config.title} - Coming soon`)}
      />
      <div className="mx-auto grid max-w-5xl gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
        <HeaderCard {...config} />
        {config.actions ? <ActionGrid actions={config.actions} onAction={toastAction} /> : null}
        {config.sections.map((section) => (
          <ToolSection key={section.title} section={section} color={config.color} onAction={toastAction} />
        ))}
      </div>
    </main>
  );
}
