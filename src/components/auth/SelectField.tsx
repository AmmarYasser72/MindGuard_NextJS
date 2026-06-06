import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Icon from "../common/Icon";
import { cn } from "../../utils/cn";
import { useDismissableLayer } from "../../hooks/useDismissableLayer";
import type { ReactElement, ReactNode, SelectHTMLAttributes } from "react";

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value"
> & {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
  error?: string;
  icon?: string;
};

type OptionProps = {
  children?: ReactNode;
  disabled?: boolean;
  value?: string;
};

type SelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

function optionsFromChildren(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];

    const option = child as ReactElement<OptionProps>;
    const value = option.props.value;
    if (typeof value !== "string" || !value) return [];

    return [
      {
        disabled: Boolean(option.props.disabled),
        label: String(option.props.children || value),
        value,
      },
    ];
  });
}

export default function SelectField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  children,
  error,
  disabled,
  name,
  required,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => optionsFromChildren(children), [children]);
  const selected = options.find((option) => option.value === value);
  const close = useCallback(() => setOpen(false), []);

  useDismissableLayer({ active: open, onDismiss: close, ref: rootRef });

  function selectOption(option: SelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div className="relative grid gap-2" ref={rootRef}>
      <label
        className="text-xs font-black uppercase tracking-[0.12em] text-app-muted"
        id={`${fieldId}-label`}
      >
        {label}
      </label>
      <input
        name={name}
        required={required}
        type="hidden"
        value={value}
        readOnly
      />
      <button
        className={cn(
          "auth-field-control group flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left shadow-sm shadow-slate-950/5 transition focus:outline-none",
          error
            ? "border-red-300 bg-red-50/80 ring-4 ring-red-100"
            : "border-slate-200 bg-white hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100",
          disabled && "cursor-not-allowed opacity-60",
        )}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${fieldId}-label ${fieldId}-value`}
        onClick={() => setOpen((state) => !state)}
      >
        {icon ? (
          <span
            className={cn(
              "auth-field-icon grid h-9 w-9 place-items-center rounded-lg transition",
              error
                ? "bg-red-100 text-red-500"
                : "bg-slate-100 text-slate-400 group-focus:bg-violet-50 group-focus:text-[var(--primary)]",
            )}
          >
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-bold",
              selected ? "text-app-text" : "text-app-faint",
            )}
            id={`${fieldId}-value`}
          >
            {selected?.label || placeholder}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-app-faint">
            {selected ? "Selected option" : "Tap to open list"}
          </span>
        </span>
        <span
          className={cn(
            "auth-field-icon grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-app-faint transition",
            open && "rotate-180 bg-violet-50 text-[var(--primary)]",
          )}
        >
          <Icon name="chevron-down" size={18} />
        </span>
      </button>

      {open ? (
        <div
          className="auth-dropdown absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.16)]"
          role="listbox"
          aria-labelledby={`${fieldId}-label`}
          tabIndex={-1}
        >
          <div className="max-h-72 overflow-y-auto p-2 [scrollbar-color:#a78bfa_#eef2ff] [scrollbar-width:thin]">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition",
                    active
                      ? "bg-violet-50 text-[var(--primary)]"
                      : "text-app-text-soft hover:bg-slate-50 hover:text-app-text",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  onClick={() => selectOption(option)}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-lg",
                      active
                        ? "bg-violet-100 text-[var(--primary)]"
                        : "auth-field-icon bg-slate-100 text-app-faint",
                    )}
                  >
                    <Icon name={active ? "check" : "circle"} size={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? (
        <span className="text-xs font-bold text-red-600">{error}</span>
      ) : null}
    </div>
  );
}
