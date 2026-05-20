import Icon from "./Icon";

type ErrorStateProps = {
  actionLabel?: string;
  message?: string;
  onAction?: () => void;
  title?: string;
};

export default function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-rose-900">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-rose-600 shadow-sm">
          <Icon name="triangle-alert" size={20} />
        </span>
        <div className="min-w-0">
          <strong className="block text-sm font-bold">{title}</strong>
          {message ? <p className="mt-1 text-sm leading-6 text-rose-800/85">{message}</p> : null}
          {actionLabel && onAction ? (
            <button
              type="button"
              className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
