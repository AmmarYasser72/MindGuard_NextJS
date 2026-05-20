"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import Button from "../../components/common/Button";
import { onboardingSlides } from "../../data/onboardingData";
import { useRouter } from "../../hooks/useRouter";

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const { navigate } = useRouter();
  const slide = onboardingSlides[index];

  function complete() {
    navigate("/login");
  }

  function next() {
    if (index === onboardingSlides.length - 1) complete();
    else setIndex((value) => value + 1);
  }

  return (
    <main className="grid min-h-screen grid-rows-[auto_1fr_auto] gap-5 bg-[#f5f7ff] px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-900/15">
          <Icon name="shield" size={20} color="#fff" />
        </div>
        <strong className="text-xl font-bold text-slate-950">Mind Guard</strong>
        <button className="ml-auto text-sm font-bold text-[var(--primary)]" type="button" onClick={complete}>
          Skip
        </button>
      </header>
      <section
        className="mx-auto grid w-full max-w-5xl place-self-center rounded-[2rem] p-6 text-center shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10"
        style={{ background: `linear-gradient(180deg, ${slide.cardGradient[0]}, ${slide.cardGradient[1]})` }}
      >
        <div
          className="mx-auto mb-7 grid aspect-square w-[clamp(5rem,16vw,7.5rem)] place-items-center rounded-[28%] shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
          style={{ background: `linear-gradient(135deg, ${slide.iconGradient[0]}, ${slide.iconGradient[1]})` }}
        >
          <Icon name={slide.icon} size={52} color="#fff" />
        </div>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-slate-950">{slide.title}</h1>
          <h2 className="mt-3 text-[clamp(1rem,2.5vw,1.35rem)] font-medium text-slate-600">{slide.subtitle}</h2>
          <p className="mx-auto mt-6 max-w-3xl text-left text-base leading-8 text-slate-700">{slide.body}</p>
        </div>
        <div className="mx-auto mt-8 grid w-full max-w-2xl gap-3 text-left">
          {slide.highlights.map((item) => (
            <div className="flex items-center gap-3 rounded-2xl bg-white/65 px-4 py-3 shadow-sm shadow-white/40" key={item}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slide.accent }} />
              <strong className="text-sm font-bold text-slate-800 sm:text-base">{item}</strong>
            </div>
          ))}
        </div>
      </section>
      <footer className="grid justify-items-center gap-4 pb-4">
        <div className="flex gap-3">
          {onboardingSlides.map((item, dotIndex) => (
            <span
              key={item.title}
              className={`h-2 rounded-full transition-all ${dotIndex === index ? "w-4" : "w-2 bg-slate-300"}`}
              style={dotIndex === index ? { backgroundColor: slide.iconGradient[1] } : undefined}
            />
          ))}
        </div>
        <Button
          className="h-14 w-full max-w-[16rem] rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 shadow-lg shadow-indigo-900/15 hover:from-violet-500 hover:to-indigo-500"
          onClick={next}
        >
          {index === onboardingSlides.length - 1 ? "Get Started" : "Continue"}
          <Icon name="arrow-right" size={20} color="#fff" />
        </Button>
        <button
          className="text-sm font-bold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((value) => value - 1)}
        >
          Previous
        </button>
      </footer>
    </main>
  );
}
