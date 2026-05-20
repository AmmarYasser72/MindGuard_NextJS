import Icon from "../common/Icon";

export default function ActionIcon({ icon, color, bg }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: bg }}>
      <Icon name={icon} size={22} color={color} />
    </span>
  );
}
