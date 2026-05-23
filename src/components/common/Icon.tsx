import type { CSSProperties } from "react";

const aliases: Record<string, string> = {
  dashboard: "layout-dashboard",
  analytics: "chart-no-axes-combined",
  "check-circle": "circle-check",
  doctor: "stethoscope",
  edit: "square-pen",
  exercise: "dumbbell",
  journal: "book-open-text",
  "more-horizontal": "ellipsis",
  sleep: "moon",
  mood: "smile",
  monitor: "activity",
  sessions: "calendar-days",
  warning: "triangle-alert",
};

type IconProps = {
  name: string;
  className?: string;
  color?: string;
  size?: number;
  title?: string;
};

export default function Icon({ name, size = 20, color = "currentColor", className = "", title }: IconProps) {
  const iconName = aliases[name] || name;
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
    WebkitMask: `url(/assets/icons/${iconName}.svg) center / contain no-repeat`,
    mask: `url(/assets/icons/${iconName}.svg) center / contain no-repeat`,
  };

  return (
    <span
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      className={`inline-block shrink-0 align-middle ${className}`}
      role={title ? "img" : undefined}
      style={style}
    />
  );
}
