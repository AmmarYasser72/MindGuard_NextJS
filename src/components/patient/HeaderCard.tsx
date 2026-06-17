import Card from "../common/Card";
import Icon from "../common/Icon";

export default function HeaderCard({ title, subtitle, icon, color, bg }) {
  return (
    <Card className="patient-tool-header flex items-center gap-4 rounded-[1.75rem] p-5 sm:p-6">
      <span
        className="patient-tool-header-icon grid h-12 w-12 place-items-center rounded-2xl"
        style={{ backgroundColor: bg }}
      >
        <Icon name={icon} size={24} color={color} />
      </span>
      <span className="min-w-0">
        <strong className="block text-lg font-bold text-app-text">
          {title}
        </strong>
        <small className="mt-1 block text-sm leading-6 text-app-muted">
          {subtitle}
        </small>
      </span>
    </Card>
  );
}
