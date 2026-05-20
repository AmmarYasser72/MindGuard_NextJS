import Field from "../common/Field";
import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
  error?: string;
  icon?: string;
};

export default function SelectField({ label, icon, value, onChange, placeholder, children, error, ...props }: SelectFieldProps) {
  return (
    <Field label={label} icon={icon} error={error}>
      <select
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    </Field>
  );
}
