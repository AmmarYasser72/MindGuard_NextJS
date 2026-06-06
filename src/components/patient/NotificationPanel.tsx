import Icon from "../common/Icon";
import EmptyState from "../common/EmptyState";

export default function NotificationPanel({
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/45 px-4 py-6 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-notifications-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
              Patient alerts
            </span>
            <h2
              className="mt-1 text-2xl font-bold text-slate-950"
              id="patient-notifications-title"
            >
              Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} unread updates from your health tracking.`
                : "All caught up for now."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-violet-100 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 pb-5 pt-4 sm:px-6">
          <div className="space-y-3">
            {notifications.length ? (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-3xl border p-4 transition ${notification.unread ? "border-violet-200 bg-violet-50/60 shadow-sm shadow-violet-950/5" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                      style={{ backgroundColor: notification.bg }}
                    >
                      <Icon
                        name={notification.icon}
                        size={22}
                        color={notification.color}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-bold text-slate-950">
                          {notification.title}
                        </strong>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {notification.category}
                        </span>
                        {notification.unread ? (
                          <span className="rounded-full bg-violet-600 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                            New
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                          {notification.value}
                        </span>
                        <span className="text-slate-400">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState message="No notifications yet." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
