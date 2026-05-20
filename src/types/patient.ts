export type ToolAction = {
  color: string;
  icon: string;
  title: string;
  toast: string;
};

export type ToolItem = {
  color?: string;
  date?: string;
  description?: string;
  duration?: string;
  icon?: string;
  label?: string;
  meta?: string;
  mood?: string;
  preview?: string;
  progress?: number;
  quality?: string;
  status?: string;
  subtitle?: string;
  time?: string;
  title?: string;
  toast?: string;
  value?: string;
};

export type ToolSection = {
  title: string;
  type: string;
  active?: number;
  days?: string[];
  items?: ToolItem[];
};

export type ToolPageConfig = {
  bg: string;
  color: string;
  headerSubtitle: string;
  headerTitle: string;
  icon: string;
  sections: ToolSection[];
  title: string;
  actions?: ToolAction[];
};
