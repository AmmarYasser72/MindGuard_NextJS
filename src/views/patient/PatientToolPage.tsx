"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import { getPrimaryPatientIdentityKey } from "../../services/patientIdentity";
import { storage } from "../../services/storage";
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
  const { user } = useAuth();
  const patientKey = useMemo(() => getPrimaryPatientIdentityKey(user), [user]);
  const activityStorageKey = useMemo(
    () => `exercise-activities:${patientKey}`,
    [patientKey],
  );
  const sleepStorageKey = useMemo(
    () => `sleep-history:${patientKey}`,
    [patientKey],
  );
  const defaultExerciseEntries = useMemo(
    () =>
      (config.sections.find((section) => section.title === "Exercise Categories")
        ?.items || []
      ).map(normalizeExerciseEntry),
    [config.sections],
  );
  const defaultSleepEntries = useMemo(
    () =>
      (config.sections.find((section) => section.type === "sleep")?.items || []).map(
        normalizeSleepEntry,
      ),
    [config.sections],
  );
  const [activeModal, setActiveModal] = useState<ActiveToolModal | null>(null);
  const [exerciseEntries, setExerciseEntries] = useState<ToolItem[]>([]);
  const [exerciseEntriesReady, setExerciseEntriesReady] = useState(false);
  const [journalEntries, setJournalEntries] = useState<ToolItem[]>([]);
  const [sleepEntries, setSleepEntries] = useState<ToolItem[]>([]);
  const [sleepEntriesReady, setSleepEntriesReady] = useState(false);

  useEffect(() => {
    if (config.title !== "Exercise") return;
    const nextEntries = loadExerciseEntries(
      config.title,
      activityStorageKey,
      defaultExerciseEntries,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExerciseEntries(nextEntries);
    setExerciseEntriesReady(true);
  }, [activityStorageKey, config.title, defaultExerciseEntries]);

  useEffect(() => {
    if (config.title !== "Exercise" || !exerciseEntriesReady) return;
    storage.set(activityStorageKey, exerciseEntries);
  }, [activityStorageKey, config.title, exerciseEntries, exerciseEntriesReady]);

  useEffect(() => {
    if (config.title !== "Sleep Log") return;
    const nextEntries = loadSleepEntries(
      config.title,
      sleepStorageKey,
      defaultSleepEntries,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSleepEntries(nextEntries);
    setSleepEntriesReady(true);
  }, [config.title, defaultSleepEntries, sleepStorageKey]);

  useEffect(() => {
    if (config.title !== "Sleep Log" || !sleepEntriesReady) return;
    storage.set(sleepStorageKey, sleepEntries);
  }, [config.title, sleepEntries, sleepEntriesReady, sleepStorageKey]);

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
        if (
          config.title === "Exercise" &&
          section.title === "Exercise Categories"
        ) {
          return {
            ...section,
            items: exerciseEntriesReady
              ? exerciseEntries
              : items.map(normalizeExerciseEntry),
          };
        }
        if (section.type === "sleep")
          return {
            ...section,
            items: sleepEntriesReady
              ? sleepEntries
              : items.map(normalizeSleepEntry),
          };
        return section;
      }),
    [
      config.sections,
      config.title,
      exerciseEntries,
      exerciseEntriesReady,
      journalEntries,
      sleepEntries,
      sleepEntriesReady,
    ],
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

  function saveActivityEntry(entry: ToolItem) {
    const nextEntries = [normalizeExerciseEntry(entry), ...exerciseEntries];
    setExerciseEntries(nextEntries);
    showToast("Activity logged.", "success");
    closeModal();
  }

  function saveSleepEntry(entry: ToolItem) {
    const nextEntries = [normalizeSleepEntry(entry), ...sleepEntries];
    setSleepEntries(nextEntries);
    showToast("Sleep entry logged.", "success");
    closeModal();
  }

  function saveSleepNote(entryId: string, note: string) {
    const nextEntries = sleepEntries.map((entry) =>
      entry.id === entryId ? { ...entry, note } : entry,
    );
    setSleepEntries(nextEntries);
    showToast("Sleep note saved.", "success");
    closeModal();
  }

  function finishAction(message: string) {
    showToast(message, "success");
    closeModal();
  }

  return (
    <main className="patient-shell patient-tool-page dashboard-shell min-h-screen">
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
          onSaveActivity={saveActivityEntry}
          onSaveJournal={saveJournalEntry}
          onSaveSleep={saveSleepEntry}
          onSaveSleepNote={saveSleepNote}
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

function normalizeSleepEntry(item: ToolItem, index = 0): ToolItem {
  const fallbackId = `${item.date || "sleep"}-${item.bedtime || "unknown"}-${item.duration || index}`;

  return {
    ...item,
    id: item.id || fallbackId,
    note: item.note || "",
    title: item.title || "Sleep entry",
  };
}

function normalizeExerciseEntry(item: ToolItem, index = 0): ToolItem {
  const fallbackId = `${item.title || "exercise"}-${item.meta || item.duration || index}`;
  const minutes = Math.max(1, Number(item.time) || parseDurationMinutes(item.duration));

  return {
    ...item,
    id: item.id || fallbackId,
    icon: item.icon || "dumbbell",
    meta: item.meta || `${minutes} min`,
    time: `${minutes}`,
    duration: item.duration || `${minutes} min`,
  };
}

function parseDurationMinutes(duration?: string) {
  const match = duration?.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function loadExerciseEntries(
  toolTitle: string,
  storageKey: string,
  defaultEntries: ToolItem[],
) {
  if (toolTitle !== "Exercise") return [];
  const storedEntries = storage.get<ToolItem[] | null>(storageKey, null);
  return storedEntries?.length
    ? storedEntries.map(normalizeExerciseEntry)
    : defaultEntries;
}

function loadSleepEntries(
  toolTitle: string,
  storageKey: string,
  defaultEntries: ToolItem[],
) {
  if (toolTitle !== "Sleep Log") return [];
  const storedEntries = storage.get<ToolItem[] | null>(storageKey, null);
  return storedEntries?.length
    ? storedEntries.map(normalizeSleepEntry)
    : defaultEntries;
}
