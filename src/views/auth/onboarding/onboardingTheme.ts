export type Tone = {
  accent: string;
  accentDark: string;
  border: string;
  glow: string;
  soft: string;
};

export const slideTones: Tone[] = [
  { accent: "#7c3aed", accentDark: "#4f46e5", border: "#ddd6fe", glow: "rgba(124,58,237,0.18)", soft: "#f3edff" },
  { accent: "#0f9f7a", accentDark: "#0284c7", border: "#bbf7d0", glow: "rgba(16,185,129,0.16)", soft: "#ecfdf5" },
  { accent: "#db2777", accentDark: "#e11d48", border: "#fbcfe8", glow: "rgba(219,39,119,0.15)", soft: "#fff1f6" },
  { accent: "#6d28d9", accentDark: "#2563eb", border: "#c7d2fe", glow: "rgba(37,99,235,0.16)", soft: "#eef2ff" },
];

export const previewBars = [48, 62, 54, 78, 68, 88, 76];
