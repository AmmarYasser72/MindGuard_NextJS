import { cn } from "../../../utils/cn";

export default function DashboardPanel({ children, className = "" }) {
  return (
    <section className={cn("rounded-lg border border-violet-100 bg-white p-5 shadow-sm shadow-violet-950/5", className)}>
      {children}
    </section>
  );
}
