import { severityLabels } from "../../data/doctorData";

export default function SeverityPill({ severity }) {
  const styles = {
    critical: "bg-red-600 text-white",
    moderate: "bg-amber-500 text-white",
    mild: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    normal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };

  return <span className={`inline-flex min-h-6 items-center rounded-lg px-2 text-xs font-bold ${styles[severity] || "bg-slate-100 text-slate-600"}`}>{severityLabels[severity] || "Unknown"}</span>;
}
