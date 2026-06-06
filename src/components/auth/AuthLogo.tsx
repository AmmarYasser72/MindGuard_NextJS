import Icon from "../common/Icon";
import { cn } from "../../utils/cn";

const toneClasses = {
  green:
    "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-950/15",
  indigo:
    "bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-indigo-950/15",
} as const;

type AuthLogoTone = keyof typeof toneClasses;

type AuthLogoProps = {
  icon?: string;
  size?: number;
  tone?: AuthLogoTone;
};

export default function AuthLogo({
  tone = "indigo",
  icon = "shield",
  size = 80,
}: AuthLogoProps) {
  return (
    <div
      className={cn(
        "grid place-items-center",
        toneClasses[tone] || toneClasses.indigo,
      )}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
    >
      <Icon name={icon} size={size * 0.5} color="#ffffff" />
    </div>
  );
}
