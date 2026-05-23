import { cn } from "../../../utils/cn";

export default function DashboardPanel({ children, className = "" }) {
  return (
    <section className={cn("patient-panel dashboard-surface rounded-lg border p-5 ring-1 ring-white/80", className)}>
      {children}
    </section>
  );
}
