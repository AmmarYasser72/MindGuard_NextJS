import Field from "../common/Field";
import Icon from "../common/Icon";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  onChange: (value: string) => void;
  value: string;
  error?: string;
  icon?: string;
};

export default function TextField({ label, icon, value, onChange, placeholder, type = "text", error, ...props }: TextFieldProps) {
  const isNumber = type === "number";

  return (
    <Field label={label} icon={icon} error={error}>
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent py-1 text-sm font-bold text-app-text outline-none placeholder:text-app-faint disabled:cursor-not-allowed disabled:text-app-faint",
          isNumber && "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {isNumber ? (
        <span className="auth-field-icon grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-app-faint">
          <Icon name="hash" size={16} />
        </span>
      ) : null}
    </Field>
  );
}
