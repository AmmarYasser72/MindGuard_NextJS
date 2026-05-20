"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Icon from "../../components/common/Icon";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "../../hooks/useRouter";
import DashboardContent from "./dashboard/DashboardContent";

const AnalyticsPage = dynamic(() => import("./AnalyticsPage"));

const primaryPurple = "var(--primary)";

export default function PatientDashboard() {
  const [tab, setTab] = useState("dashboard");
  const { user } = useAuth();
  const { navigate } = useRouter();
  const email = user?.email || "Patient";

  useEffect(() => {
    void import("./AnalyticsPage");
  }, []);

  return (
    <main className="min-h-screen text-slate-950" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #f8fafc 46%, #ffffff 100%)" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        {tab === "dashboard" ? <DashboardContent email={email} /> : <AnalyticsPage />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-violet-100 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(76,29,149,0.12)] backdrop-blur" aria-label="Patient navigation">
        <div className="mx-auto grid max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button type="button" className={bottomNavClass(tab === "dashboard")} onClick={() => setTab("dashboard")} aria-current={tab === "dashboard" ? "page" : undefined}>
            <Icon name="dashboard" size={22} color={primaryPurple} />
            <span>Dashboard</span>
          </button>
          <button type="button" className="grid h-14 w-14 place-items-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-violet-200" onClick={() => navigate(`/patient-chat/${encodeURIComponent(email)}`)} aria-label="Chat with NOVA">
            <Icon name="message-circle" size={26} color="#fff" />
          </button>
          <button type="button" className={bottomNavClass(tab === "analytics")} onClick={() => setTab("analytics")} aria-current={tab === "analytics" ? "page" : undefined}>
            <Icon name="analytics" size={22} color={primaryPurple} />
            <span>Analytics</span>
          </button>
        </div>
      </nav>
    </main>
  );
}

function bottomNavClass(active: boolean) {
  return `grid min-h-14 min-w-0 justify-items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold transition ${active ? "bg-[rgba(99,102,241,0.1)] text-[var(--primary)] shadow-sm shadow-violet-950/5" : "text-slate-500 hover:bg-violet-50 hover:text-[var(--primary)]"}`;
}
