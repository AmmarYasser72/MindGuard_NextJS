import type { ToolItem as BaseToolItem } from "../../../types/patient";

export type ToolItem = BaseToolItem;

export type ToolAction = {
  color: string;
  icon: string;
  title: string;
  toast?: string;
};

export type ToolSection = {
  active?: number;
  days?: string[];
  items?: ToolItem[];
  title: string;
  type: string;
};

export type PatientToolPageConfig = {
  bg: string;
  color: string;
  headerSubtitle: string;
  headerTitle: string;
  icon: string;
  sections: ToolSection[];
  title: string;
  actions?: ToolAction[];
};

export type ToolModalKind =
  | "activity-form"
  | "breathing-player"
  | "exercise-detail"
  | "item-detail"
  | "journal-detail"
  | "journal-form"
  | "mood-check"
  | "sleep-detail"
  | "sleep-form"
  | "sleep-tips"
  | "workout";

export type ToolModalItem = ToolAction | ToolItem;

export type ActiveToolModal = {
  item: ToolModalItem;
  kind: ToolModalKind;
};
