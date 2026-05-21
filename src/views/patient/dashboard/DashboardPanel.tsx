import { cn } from "../../../utils/cn";

export default function DashboardPanel({ children, className = "" }) {
  return (
    <section className={cn("rounded-lg border border-violet-100/80 bg-white p-5 shadow-sm shadow-violet-950/5 ring-1 ring-white/80", className)}>
      {children}
    </section>
  );
}
