import Icon from "../common/Icon";

const toneClasses = {
  doctor: {
    icon: "#059669",
    iconSurface: "bg-emerald-100",
    panel:
      "border-emerald-200 bg-emerald-50/80 hover:border-emerald-300 hover:bg-emerald-50",
    subtitle: "text-emerald-700",
  },
  patient: {
    icon: "#6366f1",
    iconSurface: "bg-violet-100",
    panel:
      "border-violet-200 bg-violet-50/80 hover:border-violet-300 hover:bg-violet-50",
    subtitle: "text-[var(--primary)]",
  },
} as const;

type AuthRoleTone = keyof typeof toneClasses;

type AuthRoleCardProps = {
  icon: string;
  onClick: () => void;
  subtitle: string;
  title: string;
  tone: AuthRoleTone;
};

export default function AuthRoleCard({
  icon,
  onClick,
  subtitle,
  title,
  tone,
}: AuthRoleCardProps) {
  const styles = toneClasses[tone] || toneClasses.patient;

  return (
    <button
      type="button"
      className={`auth-role-card grid w-full grid-cols-[auto_1fr] items-center gap-4 rounded-[1.25rem] border px-4 py-4 text-left transition hover:-translate-y-0.5 ${styles.panel}`}
      onClick={onClick}
    >
      <span
        className={`auth-field-icon grid h-12 w-12 place-items-center rounded-2xl ${styles.iconSurface}`}
      >
        <Icon name={icon} size={24} color={styles.icon} />
      </span>
      <span className="min-w-0">
        <strong className="block text-sm font-bold text-app-text">
          {title}
        </strong>
        <small
          className={`mt-1 block text-sm font-semibold ${styles.subtitle}`}
        >
          {subtitle}
        </small>
      </span>
    </button>
  );
}
