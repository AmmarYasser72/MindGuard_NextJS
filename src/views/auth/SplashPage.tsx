"use client";

import { useEffect } from "react";
import Icon from "../../components/common/Icon";
import { useRouter } from "../../hooks/useRouter";

const signalTokens = [
  { className: "left-[8%] top-[18%] bg-emerald-400/18 text-emerald-100 shadow-emerald-950/20", icon: "heart-pulse", label: "Mood care" },
  { className: "right-[8%] top-[16%] bg-cyan-400/16 text-cyan-100 shadow-cyan-950/20", icon: "brain", label: "AI insight" },
  { className: "bottom-[18%] left-[10%] hidden bg-white/12 text-white shadow-indigo-950/20 sm:grid", icon: "activity", label: "Monitoring" },
  { className: "bottom-[20%] right-[10%] hidden bg-rose-400/16 text-rose-100 shadow-rose-950/20 sm:grid", icon: "shield-check", label: "Protected" },
];

export default function SplashPage() {
  const { navigate } = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate("/intro"), 2200);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#151636] px-5 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#151636_0%,#31226f_48%,#12667a_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="absolute inset-x-[-8%] top-[12%] h-28 rotate-[-8deg] bg-white/8 blur-2xl" />
      <div className="absolute inset-x-[-10%] bottom-[8%] h-28 rotate-[7deg] bg-cyan-300/10 blur-2xl" />

      {signalTokens.map((token, index) => (
        <div
          className={`absolute grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-xl border border-white/10 px-3 shadow-xl backdrop-blur-md animate-[float_5s_ease-in-out_infinite_alternate] ${token.className}`}
          style={{ animationDelay: `${index * 0.42}s` }}
          key={token.label}
        >
          <Icon name={token.icon} size={18} />
          <span className="hidden text-xs font-bold sm:block">{token.label}</span>
        </div>
      ))}

      <section className="relative z-10 grid w-full max-w-[560px] justify-items-center text-center [animation:splash-in_800ms_ease_both]">
        <div className="relative grid aspect-square w-[min(58vw,260px)] place-items-center">
          <span className="absolute inset-0 rounded-[30%] border border-white/14" />
          <span className="absolute inset-[8%] rounded-full border border-cyan-200/22 animate-[spin_16s_linear_infinite]" />
          <span className="absolute inset-[18%] rounded-[28%] border border-white/18 animate-[spin_18s_linear_infinite_reverse]" />
          <span className="absolute inset-[30%] rounded-full bg-cyan-200/10 blur-xl" />
          <span className="grid h-[46%] w-[46%] place-items-center rounded-[24%] bg-[linear-gradient(135deg,#60a5fa_0%,#7c3aed_58%,#22d3ee_100%)] shadow-[0_28px_70px_rgba(34,211,238,0.26)] animate-[pulse_2.1s_ease-in-out_infinite_alternate]">
            <Icon name="shield" size={56} color="#fff" />
          </span>
          <span className="absolute bottom-[14%] right-[23%] grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/14 shadow-lg backdrop-blur">
            <Icon name="lock-keyhole" size={17} color="#fff" />
          </span>
        </div>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100 shadow-sm shadow-black/10 backdrop-blur">
          <Icon name="sparkles" size={14} color="#a5f3fc" />
          Secure wellness space
        </div>

        <h1 className="mt-5 text-[clamp(2.35rem,9vw,3.75rem)] font-bold leading-none tracking-normal">Mind Guard</h1>
        <p className="mt-4 max-w-md text-[clamp(1rem,3vw,1.25rem)] font-medium leading-7 text-white/78">
          Your mental health companion is getting everything ready.
        </p>

        <div className="mt-9 w-full max-w-sm">
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-white/58">
            <span>Starting</span>
            <span>Ready</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/16 shadow-inner shadow-black/20">
            <span className="block h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#60a5fa_46%,#a78bfa_100%)] shadow-[0_0_18px_rgba(96,165,250,0.55)] [animation:load_2s_ease-in-out_forwards]" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/70">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.65)] animate-[pulse_1.2s_ease-in-out_infinite_alternate]" />
          Loading your care experience
        </div>
      </section>
    </main>
  );
}
