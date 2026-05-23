import { useState } from "react";
import Icon from "../../components/common/Icon";
import {
  analyticsTabs,
  anxietyAnalytics,
  stressAnalytics,
} from "../../data/analyticsData";
import DepressionAnalytics from "./analytics/DepressionAnalytics";
import MoodAnalytics from "./analytics/MoodAnalytics";
import SleepAnalytics from "./analytics/SleepAnalytics";
import StressLikeAnalytics from "./analytics/StressLikeAnalytics";
import { cn } from "../../utils/cn";

const analyticsMeta = {
  mood: {
    eyebrow: "Mood rhythm",
    headline: "Your emotional rhythm is steadier when check-ins happen early in the day.",
    subtitle: "A calmer view of how your emotions, streaks, and check-ins are trending across the week.",
    status: "Updated today",
    stats: ["12 day streak", "Morning mood strongest", "15% better than last week"],
    gradient: ["#06443f", "#0d7668", "#10b981"],
  },
  stress: {
    eyebrow: "Stress balance",
    headline: "Pressure spikes are visible now, so relief tools are easier to time well.",
    subtitle: "See how pressure changes through the day and which techniques lower your stress fastest.",
    status: "Live snapshot",
    stats: ["Low current level", "14 relief sessions", "Meetings are top trigger"],
    gradient: ["#431407", "#b45309", "#f59e0b"],
  },
  sleep: {
    eyebrow: "Sleep recovery",
    headline: "Rest quality and next-day energy are moving in the same healthy direction.",
    subtitle: "Understand how rest quality, bedtime rhythm, and recovery energy shape your next day.",
    status: "7 day window",
    stats: ["7h 32m average", "85% quality", "Best sleep on weekends"],
    gradient: ["#2e1065", "#6d28d9", "#8b5cf6"],
  },
  depression: {
    eyebrow: "Mental wellness",
    headline: "Recovery signals are improving, with sleep and activity staying most connected.",
    subtitle: "Follow symptom trends, support patterns, and care signals in one focused recovery view.",
    status: "Weekly review",
    stats: ["Mild severity", "Improving trend", "Sleep has strongest correlation"],
    gradient: ["#450a0a", "#b91c1c", "#ef4444"],
  },
  anxiety: {
    eyebrow: "Anxiety patterns",
    headline: "You can see exactly when anxiety rises and which calming routines bring it down.",
    subtitle: "Track episodes, discover triggers, and jump into calming exercises when you need support.",
    status: "Today",
    stats: ["Moderate now", "18 breathing sessions", "Social situations lead"],
    gradient: ["#4a1d06", "#c2410c", "#fb923c"],
  },
};

export default function AnalyticsPage() {
  const [active, setActive] = useState("mood");
  const tab = analyticsTabs.find((item) => item.key === active) || analyticsTabs[0];
  const meta = analyticsMeta[tab.key];
  const heroStyle = {
    background: `linear-gradient(145deg, ${meta.gradient[0]} 0%, ${meta.gradient[1]} 58%, ${meta.gradient[2]} 100%)`,
  };

  return (
    <section className="patient-analytics-shell dashboard-analytics-shell min-h-screen w-full pb-24 pt-4 sm:pt-5 lg:pt-7">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 xl:px-0">
        <div
          className="relative grid min-h-[432px] overflow-hidden rounded-[1.75rem] p-5 text-white shadow-[0_22px_64px_rgba(15,23,42,0.14)] sm:p-6 lg:grid-rows-[auto_1fr_auto]"
          style={heroStyle}
        >
          <div className="pointer-events-none absolute inset-y-[-12%] left-[-10%] w-[26rem] rounded-full bg-white/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] h-[21rem] w-[21rem] rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <header className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-white/78">Patient insights</span>
              <h1 className="mt-3 text-[clamp(2.35rem,3.3vw,2.8rem)] font-normal leading-none tracking-[-0.05em]">{tab.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/92">{meta.headline}</p>
            </header>
            <span className="inline-flex min-h-11 w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/16 px-4 text-sm font-black text-white shadow-[0_10px_26px_rgba(15,23,42,0.1)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {meta.status}
            </span>
          </div>

          <div className="relative grid content-center gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8 lg:py-3">
            <div className="grid content-start gap-5">
              <span
                className="inline-flex min-h-10 w-fit items-center gap-2.5 rounded-full border border-white/15 px-4 text-sm font-black backdrop-blur-md"
                style={{ color: tab.color, backgroundColor: `${tab.color}20` }}
              >
                <Icon name={tab.icon} size={17} color={tab.color} />
                {meta.eyebrow}
              </span>
              <div>
                <h2 className="max-w-3xl text-[clamp(1.95rem,2.45vw,2.2rem)] font-normal leading-tight tracking-[-0.045em]">
                  Understand your progress at a glance
                </h2>
                <p className="mt-4 max-w-[40rem] text-base font-medium leading-7 text-white/75">{meta.subtitle}</p>
              </div>
            </div>
            <div className="grid gap-3 self-end lg:self-center">
              {meta.stats.map((stat) => (
                <div
                  className="flex min-h-[56px] items-center gap-3 rounded-[1.1rem] border border-white/14 bg-white/14 px-4 text-sm font-black shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-md"
                  key={stat}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <strong>{stat}</strong>
                </div>
              ))}
            </div>
          </div>

          <nav className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Patient analytics categories" role="tablist">
            {analyticsTabs.map((item) => (
              <button
                type="button"
                key={item.key}
                aria-controls={`analytics-panel-${item.key}`}
                aria-selected={item.key === active}
                className={cn(
                  "flex min-h-[74px] min-w-0 items-center gap-3 rounded-[1.2rem] border border-white/14 bg-white/12 p-3 text-left text-white transition hover:-translate-y-0.5 hover:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/20",
                  item.key === active && "border-white/22 shadow-[0_14px_30px_rgba(15,23,42,0.18)]",
                )}
                id={`analytics-tab-${item.key}`}
                role="tab"
                style={item.key === active ? { background: `linear-gradient(135deg, ${item.color} 0%, rgba(255,255,255,0.16) 170%)` } : undefined}
                tabIndex={item.key === active ? 0 : -1}
                onClick={() => setActive(item.key)}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] ${item.key === active ? "bg-white/24" : "bg-white/14"}`}>
                  <Icon name={item.icon} size={21} color={item.key === active ? "#fff" : item.color} />
                </span>
                <span className="grid min-w-0 gap-1">
                  <strong className="truncate text-sm font-black">{item.label}</strong>
                  <small className="truncate text-xs font-black text-white/75 sm:whitespace-normal">{item.title}</small>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto mt-5 w-full max-w-[1240px] px-4 sm:px-6 xl:px-0">
        <div
          className="patient-analytics-panel dashboard-surface overflow-hidden rounded-[1.75rem] border shadow-[0_20px_56px_rgba(15,23,42,0.08)]"
          aria-labelledby={`analytics-tab-${tab.key}`}
          id={`analytics-panel-${tab.key}`}
          role="tabpanel"
        >
          {active === "mood" ? <MoodAnalytics /> : null}
          {active === "stress" ? <StressLikeAnalytics data={stressAnalytics} /> : null}
          {active === "anxiety" ? <StressLikeAnalytics data={anxietyAnalytics} /> : null}
          {active === "sleep" ? <SleepAnalytics /> : null}
          {active === "depression" ? <DepressionAnalytics /> : null}
        </div>
      </div>
    </section>
  );
}
