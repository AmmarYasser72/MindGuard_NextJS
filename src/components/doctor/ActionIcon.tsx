import Icon from "../common/Icon";
import type { CSSProperties } from "react";

export default function ActionIcon({ icon, color, bg }) {
  return (
    <span className="doctor-color-chip grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: bg, "--doctor-chip-color": color } as CSSProperties}>
      <Icon name={icon} size={22} color={color} />
    </span>
  );
}
