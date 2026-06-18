import BreathingPlayer from "./BreathingPlayer";
import {
  ActivityLogForm,
  ExerciseDetail,
  WorkoutPlanner,
} from "./ExerciseModals";
import GenericDetail from "./GenericDetail";
import {
  JournalDetail,
  JournalEntryForm,
  MoodCheckForm,
} from "./JournalModals";
import { SleepDetail, SleepLogForm, SleepTips } from "./SleepModals";
import type { ActiveToolModal, ToolItem } from "./types";

type ToolModalProps = {
  activeModal: ActiveToolModal;
  color: string;
  onClose: () => void;
  onFinish: (message: string) => void;
  onSaveActivity: (entry: ToolItem) => void;
  onSaveJournal: (entry: ToolItem) => void;
  onSaveSleep: (entry: ToolItem) => void;
  onSaveSleepNote: (entryId: string, note: string) => void;
  toolTitle: string;
};

export default function ToolModal({
  activeModal,
  color,
  onClose,
  onFinish,
  onSaveActivity,
  onSaveJournal,
  onSaveSleep,
  onSaveSleepNote,
  toolTitle,
}: ToolModalProps) {
  const item = activeModal.item as ToolItem;
  const itemTitle = item.title || toolTitle;

  if (activeModal.kind === "breathing-player") {
    return (
      <BreathingPlayer
        item={item}
        color={color}
        onClose={onClose}
        onFinish={() => onFinish(`${itemTitle} completed.`)}
      />
    );
  }

  if (activeModal.kind === "journal-form") {
    return <JournalEntryForm onClose={onClose} onSave={onSaveJournal} />;
  }

  if (activeModal.kind === "mood-check") {
    return (
      <MoodCheckForm
        onClose={onClose}
        onSave={() => onFinish("Mood check saved.")}
      />
    );
  }

  if (activeModal.kind === "workout") {
    return (
      <WorkoutPlanner
        item={item}
        onClose={onClose}
        onFinish={() => onFinish("Workout added to today's activity.")}
      />
    );
  }

  if (activeModal.kind === "activity-form") {
    return <ActivityLogForm onClose={onClose} onSave={onSaveActivity} />;
  }

  if (activeModal.kind === "sleep-form") {
    return <SleepLogForm onClose={onClose} onSave={onSaveSleep} />;
  }

  if (activeModal.kind === "sleep-tips") {
    return (
      <SleepTips
        onClose={onClose}
        onFinish={() => onFinish("Sleep plan saved for tonight.")}
      />
    );
  }

  if (activeModal.kind === "exercise-detail") {
    return <ExerciseDetail item={item} onClose={onClose} />;
  }

  if (activeModal.kind === "journal-detail") {
    return (
      <JournalDetail
        item={item}
        onClose={onClose}
        onFinish={() => onFinish("Reflection marked as reviewed.")}
      />
    );
  }

  if (activeModal.kind === "sleep-detail") {
    return (
      <SleepDetail
        item={item}
        onClose={onClose}
        onSaveNote={(note) => onSaveSleepNote(item.id || "", note)}
      />
    );
  }

  return (
    <GenericDetail
      item={item}
      color={color}
      onClose={onClose}
      onFinish={() => onFinish(`${toolTitle} item updated.`)}
    />
  );
}
