import Icon from "../common/Icon";
import type { CSSProperties } from "react";

export default function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          className="patient-mini-stat grid min-h-28 content-between gap-3 rounded-[1.25rem] border border-white/70 p-4 shadow-sm"
          key={`${item.label}-${item.value}`}
          style={{ "--metric-color": item.color } as CSSProperties}
        >
          {item.icon ? (
            <Icon name={item.icon} size={20} color={item.color} />
          ) : null}
          <strong className="text-2xl font-bold" style={{ color: item.color }}>
            {item.value}
          </strong>
          <span className="text-xs font-bold text-app-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
