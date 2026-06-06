"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/common/Toast";
import { useRouter } from "../../hooks/useRouter";
import ActionGrid from "../../components/patient/ActionGrid";
import AppTopBar from "../../components/patient/AppTopBar";
import HeaderCard from "../../components/patient/HeaderCard";
import ToolSection from "./ToolSection";
import ToolModal from "./toolPage/ToolModal";
import type {
  ActiveToolModal,
  PatientToolPageConfig,
  ToolAction,
  ToolItem,
  ToolModalKind,
} from "./toolPage/types";

type PatientToolPageProps = {
  config: PatientToolPageConfig;
};

const actionModalKinds: Record<string, ToolModalKind> = {
  "Log Activity": "activity-form",
  "Log Sleep": "sleep-form",
  "Mood Check": "mood-check",
  "New Entry": "journal-form",
  "Sleep Tips": "sleep-tips",
  "Start Workout": "workout",
};

export default function PatientToolPage({ config }: PatientToolPageProps) {
  const { back } = useRouter();
  const { showToast } = useToast();
  const [activeModal, setActiveModal] = useState<ActiveToolModal | null>(null);
  const [journalEntries, setJournalEntries] = useState<ToolItem[]>([]);
  const [sleepEntries, setSleepEntries] = useState<ToolItem[]>([]);

  const headerAction = useMemo(() => {
    if (config.title === "Journal")
      return config.actions?.find((action) => action.title === "New Entry");
    if (config.title === "Sleep Log")
      return config.actions?.find((action) => action.title === "Log Sleep");
    return null;
  }, [config.actions, config.title]);

  const sections = useMemo(
    () =>
      config.sections.map((section) => {
        const items = section.items || [];
        if (section.type === "journal")
          return { ...section, items: [...journalEntries, ...items] };
        if (section.type === "sleep")
          return { ...section, items: [...sleepEntries, ...items] };
        return section;
      }),
    [config.sections, journalEntries, sleepEntries],
  );

  function openAction(action: ToolAction) {
    setActiveModal({
      kind: actionModalKinds[action.title] || "item-detail",
      item: action,
    });
  }

  function openItem(item: ToolItem) {
    setActiveModal({ kind: modalKindForItem(config.title, item), item });
  }

  function closeModal() {
    setActiveModal(null);
  }

  function saveJournalEntry(entry: ToolItem) {
    setJournalEntries((current) => [entry, ...current]);
    showToast("Journal entry saved.", "success");
    closeModal();
  }

  function saveSleepEntry(entry: ToolItem) {
    setSleepEntries((current) => [entry, ...current]);
    showToast("Sleep entry logged.", "success");
    closeModal();
  }

  function finishAction(message: string) {
    showToast(message, "success");
    closeModal();
  }

  return (
    <main className="patient-shell dashboard-shell min-h-screen bg-[linear-gradient(180deg,#f5f3ff_0%,#f8fafc_46%,#ffffff_100%)]">
      <AppTopBar
        title={config.title}
        onBack={() => back("/patient-dashboard")}
        actionIcon={headerAction ? "plus" : undefined}
        onAction={headerAction ? () => openAction(headerAction) : undefined}
      />
      <div className="mx-auto grid max-w-5xl gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
        <HeaderCard
          bg={config.bg}
          color={config.color}
          icon={config.icon}
          subtitle={config.headerSubtitle}
          title={config.headerTitle}
        />
        {config.actions ? (
          <ActionGrid actions={config.actions} onAction={openAction} />
        ) : null}
        {sections.map((section) => (
          <ToolSection
            key={section.title}
            section={section}
            color={config.color}
            onAction={openItem}
          />
        ))}
      </div>

      {activeModal ? (
        <ToolModal
          activeModal={activeModal}
          color={config.color}
          onClose={closeModal}
          onFinish={finishAction}
          onSaveJournal={saveJournalEntry}
          onSaveSleep={saveSleepEntry}
          toolTitle={config.title}
        />
      ) : null}
    </main>
  );
}

function modalKindForItem(toolTitle: string, item: ToolItem): ToolModalKind {
  if (toolTitle === "Breathing Exercises") return "breathing-player";
  if (toolTitle === "Exercise") return "exercise-detail";
  if (item.preview) return "journal-detail";
  if (item.bedtime) return "sleep-detail";
  return "item-detail";
}
