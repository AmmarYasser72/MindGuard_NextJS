import PatientListButton from "./PatientListButton";

export default function ItemList({ items, color = "#6366f1", onItem }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <PatientListButton
          key={item.title}
          icon={item.icon || "circle"}
          iconBg={`${color}1a`}
          iconColor={color}
          title={item.title}
          subtitle={item.subtitle}
          meta={item.meta}
          onClick={() => onItem?.(item)}
        />
      ))}
    </div>
  );
}
