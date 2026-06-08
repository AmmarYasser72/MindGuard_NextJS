export const destinations = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "patients", label: "Patients", icon: "users" },
  { key: "monitor", label: "Monitor", icon: "monitor" },
  { key: "sessions", label: "Sessions", icon: "calendar-days" },
];

export const primaryPurple = "var(--primary)";
export const surfaceClass =
  "rounded-lg border border-[var(--doctor-line)] bg-[var(--doctor-card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]";
export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:bg-[var(--primary-strong)] focus:outline-none focus:ring-4 focus:ring-violet-200";
export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--doctor-line)] bg-[var(--doctor-card)] px-4 text-sm font-bold text-slate-700 shadow-sm shadow-violet-950/5 transition hover:bg-[var(--doctor-card-muted)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-violet-100";
export const fieldClass = "grid gap-2 text-sm font-bold text-slate-700";
export const inputClass =
  "min-h-12 w-full rounded-lg border border-[var(--doctor-line)] bg-[var(--doctor-card)] px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function firstName(name) {
  if (name.includes("@")) return name.split("@")[0].split(".")[0];
  return name.split(" ")[0];
}

export function railButtonClass(active) {
  return `grid min-h-20 justify-items-center gap-2 rounded-lg px-2 py-3 text-xs font-bold transition ${active ? "bg-[var(--primary)] text-white shadow-sm shadow-indigo-900/15" : "text-slate-500 hover:bg-violet-50 hover:text-[var(--primary)]"}`;
}

export function bottomNavClass(active) {
  return `grid min-h-14 justify-items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold transition ${active ? "bg-[rgba(99,102,241,0.1)] text-[var(--primary)] shadow-sm shadow-violet-950/5" : "text-slate-500 hover:bg-violet-50 hover:text-[var(--primary)]"}`;
}

export function filterButtonClass(active) {
  return `h-10 shrink-0 rounded-lg px-4 text-sm font-bold transition ${active ? "bg-[var(--primary)] text-white shadow-sm shadow-violet-950/10" : "border border-[var(--doctor-line)] bg-[var(--doctor-card)] text-slate-600 hover:bg-[var(--doctor-card-muted)] hover:text-[var(--primary)]"}`;
}

export function tabButtonClass(active) {
  return `min-h-10 rounded-lg px-3 text-sm font-bold transition ${active ? "bg-[var(--primary)] text-white shadow-sm shadow-violet-950/10" : "text-slate-500 hover:bg-[var(--doctor-card-muted)] hover:text-[var(--primary)]"}`;
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function time(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
