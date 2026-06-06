import Icon from "./Icon";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  title: string;
  actions?: ReactNode;
};

export function Modal({ title, children, onClose, actions }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-slate-950/45 p-5"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[86vh] w-full max-w-3xl overflow-auto rounded-[1.75rem] border border-app-line bg-app-card text-app-text shadow-[0_24px_90px_rgba(15,23,42,0.24)]"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
          <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 pb-5 sm:px-6">{children}</div>
        {actions ? (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
