import { useState } from "react";
import Icon from "../common/Icon";
import Field from "../common/Field";
import type { InputHTMLAttributes } from "react";

type PasswordFieldProps = Pick<InputHTMLAttributes<HTMLInputElement>, "autoComplete" | "disabled" | "placeholder"> & {
  label: string;
  onChange: (value: string) => void;
  value: string;
  error?: string;
};

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  error,
  autoComplete,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} icon="lock" error={error}>
      <input
        className="min-w-0 flex-1 bg-transparent py-1 text-sm font-bold text-app-text outline-none placeholder:text-app-faint disabled:cursor-not-allowed disabled:text-app-faint"
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="auth-field-icon grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-app-faint transition hover:bg-slate-200/70 hover:text-app-text focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setVisible((state) => !state)}
        aria-label="Toggle password visibility"
        disabled={disabled}
      >
        <Icon name={visible ? "eye-off" : "eye"} size={20} />
      </button>
    </Field>
  );
}
