import PatientListButton from "./PatientListButton";

export default function ActivityRows({ items, onItem }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <PatientListButton
          key={`${item.title}-${item.time}`}
          icon={item.icon}
          iconBg={`${item.color}1a`}
          iconColor={item.color}
          title={item.title}
          subtitle={item.subtitle || item.time}
          meta={item.subtitle ? item.time : null}
          onClick={() => onItem?.(item)}
        />
      ))}
    </div>
  );
}
