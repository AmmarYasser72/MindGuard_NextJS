import { fieldClass, panelClass } from "./constants";

type RangeFieldProps = {
  label: string;
  onChange: (value: number) => void;
  value: number;
};

export function RangeField({ label, value, onChange }: RangeFieldProps) {
  return (
    <label className={fieldClass}>
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <strong className="text-[var(--primary)]">{value}/10</strong>
      </span>
      <input
        className="accent-[var(--primary)]"
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type InfoTileProps = {
  label: string;
  value?: string;
};

export function InfoTile({ label, value = "" }: InfoTileProps) {
  return (
    <div className={panelClass}>
      <small className="text-xs font-black uppercase text-slate-400">
        {label}
      </small>
      <strong className="mt-2 block text-lg font-black text-slate-950">
        {value}
      </strong>
    </div>
  );
}
