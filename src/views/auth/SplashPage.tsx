"use client";

import { useEffect } from "react";
import Icon from "../../components/common/Icon";
import { useRouter } from "../../hooks/useRouter";

export default function SplashPage() {
  const { navigate } = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate("/intro"), 2200);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(180deg,#4a3b8c_0%,#6b46c1_60%,#8b5cf6_100%)] px-8 text-white">
      <div className="absolute left-[-20vw] top-[10%] aspect-square w-[min(80vw,500px)] rounded-full bg-white/5" />
      <div className="absolute bottom-[10%] right-[-30vw] aspect-square w-[min(100vw,680px)] rounded-full bg-white/5 opacity-75" />
      <div className="absolute right-[10%] top-[30%] aspect-square w-[min(50vw,320px)] rounded-full bg-white/5" />
      <div className="absolute left-[12%] top-[15%] grid aspect-square w-[clamp(42px,8vw,65px)] place-items-center rounded-full bg-[var(--green)] shadow-[0_0_22px_rgba(16,185,129,0.45)] animate-[float_5s_ease-in-out_infinite_alternate]">
        <Icon name="heart" size={30} color="#fff" />
      </div>
      <div className="absolute right-[10%] top-[12%] grid aspect-square w-[clamp(42px,8vw,65px)] place-items-center rounded-full bg-[var(--purple)] shadow-[0_0_22px_rgba(139,92,246,0.45)] [animation:float_5s_ease-in-out_infinite_alternate_0.7s]">
        <Icon name="brain" size={28} color="#fff" />
      </div>
      <section className="relative z-10 grid w-full max-w-[520px] justify-items-center text-center [animation:splash-in_900ms_ease_both]">
        <div className="relative mb-[5vh] aspect-square w-[min(55vw,250px)]">
          <span className="absolute inset-0 m-auto h-[90%] w-[90%] rounded-full border-2 border-white/20 animate-[spin_12s_linear_infinite]" />
          <span className="absolute inset-0 m-auto h-[75%] w-[75%] rounded-full border-2 border-white/20 animate-[spin_12s_linear_infinite_reverse]" />
          <span className="absolute inset-0 m-auto grid h-1/2 w-1/2 place-items-center rounded-[20%] bg-[var(--blue)] shadow-[0_0_35px_rgba(59,130,246,0.55)] animate-[pulse_2s_ease-in-out_infinite_alternate]">
            <Icon name="shield" size={54} color="#fff" />
          </span>
          <span className="absolute inset-x-0 bottom-0 m-auto grid h-[10%] w-[10%] place-items-center rounded-full bg-[#ff6b35] shadow-[0_0_16px_rgba(255,107,53,0.6)] animate-[pulse_2s_ease-in-out_infinite_alternate]">
            <Icon name="activity" size={16} color="#fff" />
          </span>
        </div>
        <h1 className="text-[clamp(2.125rem,8vw,2.625rem)] font-bold tracking-[0.12em]">Mind Guard</h1>
        <p className="mt-4 text-[clamp(1.05rem,4vw,1.375rem)] font-light text-white/75">Your Mental Health Companion</p>
        <div className="mt-[5vh] h-2 w-[min(70%,360px)] overflow-hidden rounded-full bg-white/20">
          <span className="block h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#3b82f6)] [animation:load_2s_ease-in-out_forwards]" />
        </div>
        <span className="mt-6 text-white/80">Loading...</span>
      </section>
    </main>
  );
}
