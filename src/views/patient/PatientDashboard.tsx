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
  const chatPath = `/patient-chat/${encodeURIComponent(email)}`;

  useEffect(() => {
    void import("./AnalyticsPage");
  }, []);

  return (
    <main className="patient-shell dashboard-shell min-h-screen text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-36 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-40 lg:pt-8">
        {tab === "dashboard" ? (
          <DashboardContent email={email} />
        ) : (
          <AnalyticsPage />
        )}
      </div>

      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8"
        aria-label="Patient navigation"
      >
        <div className="dashboard-nav pointer-events-auto mx-auto grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border p-2 ring-1 ring-white/80 animate-[nav-rise_420ms_ease_both]">
          <BottomNavButton
            active={tab === "dashboard"}
            icon="dashboard"
            label="Dashboard"
            onClick={() => setTab("dashboard")}
          />

          <button
            type="button"
            className="patient-nova-button group relative -mt-8 grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_100%)] text-white shadow-[0_16px_34px_rgba(99,102,241,0.34)] ring-4 ring-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(99,102,241,0.42)] focus:outline-none focus:ring-violet-200"
            onClick={() => navigate(chatPath)}
            aria-label="Chat with NOVA"
          >
            <span
              className="absolute inset-0 rounded-full bg-violet-400/20 animate-[nova-pulse_2.4s_ease-in-out_infinite]"
              aria-hidden="true"
            />
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white/15 transition duration-300 group-hover:scale-105">
              <Icon name="message-circle" size={28} color="#fff" />
            </span>
            <span className="patient-nova-label absolute -bottom-7 rounded-lg border border-violet-100 bg-white px-2.5 py-1 text-[11px] font-black text-[var(--primary)] shadow-sm shadow-violet-950/5">
              NOVA
            </span>
          </button>

          <BottomNavButton
            active={tab === "analytics"}
            icon="analytics"
            label="Analytics"
            onClick={() => setTab("analytics")}
          />
        </div>
      </nav>
    </main>
  );
}

type BottomNavButtonProps = {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
};

function BottomNavButton({
  active,
  icon,
  label,
  onClick,
}: BottomNavButtonProps) {
  return (
    <button
      type="button"
      className={`group relative grid min-h-16 min-w-0 justify-items-center gap-1 overflow-hidden rounded-lg px-4 py-2 text-xs font-bold transition duration-300 focus:outline-none focus:ring-4 focus:ring-violet-100 ${active ? "bg-violet-50 text-[var(--primary)] shadow-sm shadow-violet-950/5 animate-[nav-item-pop_260ms_ease_both]" : "text-slate-500 hover:bg-violet-50 hover:text-[var(--primary)]"}`}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={`absolute inset-x-5 top-1 h-1 rounded-full transition duration-300 ${active ? "bg-[var(--primary)] opacity-100" : "bg-transparent opacity-0"}`}
        aria-hidden="true"
      />
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg transition duration-300 ${active ? "bg-white text-[var(--primary)] shadow-sm shadow-violet-950/5" : "group-hover:bg-white/80"}`}
      >
        <Icon
          name={icon}
          size={22}
          color={active ? primaryPurple : "currentColor"}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}
