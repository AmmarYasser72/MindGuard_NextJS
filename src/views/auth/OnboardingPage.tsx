"use client";

import { useState } from "react";
import Icon from "../../components/common/Icon";
import Button from "../../components/common/Button";
import { onboardingSlides } from "../../data/onboardingData";
import { useRouter } from "../../hooks/useRouter";

type Slide = (typeof onboardingSlides)[number];

type Tone = {
  accent: string;
  accentDark: string;
  border: string;
  glow: string;
  soft: string;
};

const slideTones: Tone[] = [
  { accent: "#7c3aed", accentDark: "#4f46e5", border: "#ddd6fe", glow: "rgba(124,58,237,0.18)", soft: "#f3edff" },
  { accent: "#0f9f7a", accentDark: "#0284c7", border: "#bbf7d0", glow: "rgba(16,185,129,0.16)", soft: "#ecfdf5" },
  { accent: "#db2777", accentDark: "#e11d48", border: "#fbcfe8", glow: "rgba(219,39,119,0.15)", soft: "#fff1f6" },
  { accent: "#6d28d9", accentDark: "#2563eb", border: "#c7d2fe", glow: "rgba(37,99,235,0.16)", soft: "#eef2ff" },
];

const previewBars = [48, 62, 54, 78, 68, 88, 76];

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const { navigate } = useRouter();
  const slide = onboardingSlides[index];
  const tone = slideTones[index] || slideTones[0];
  const isFirst = index === 0;
  const isLast = index === onboardingSlides.length - 1;

  function complete() {
    navigate("/login");
  }

  function next() {
    if (isLast) complete();
    else setIndex((value) => value + 1);
  }

  return (
    <main className="min-h-dvh bg-[#f7f9fc] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-7xl flex-col">
        <Header onSkip={complete} tone={tone} />

        <section className="grid flex-1 gap-6 py-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(340px,0.72fr)] lg:items-center lg:gap-10 lg:py-7">
          <ContentPanel
            index={index}
            isFirst={isFirst}
            isLast={isLast}
            onBack={() => setIndex((value) => value - 1)}
            onNext={next}
            onSelect={setIndex}
            slide={slide}
            tone={tone}
          />
          <PreviewPanel index={index} slide={slide} tone={tone} />
        </section>
      </div>
    </main>
  );
}

function Header({ onSkip, tone }: { onSkip: () => void; tone: Tone }) {
  return (
    <header className="flex min-h-12 items-center gap-3">
      <div className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left shadow-sm shadow-slate-950/5">
        <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: tone.accent }}>
          <Icon name="shield" size={17} color="#fff" />
        </span>
        <strong className="text-sm font-bold text-slate-950">Mind Guard</strong>
      </div>
      <button
        className="ml-auto min-h-10 rounded-lg px-3 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-950"
        type="button"
        onClick={onSkip}
      >
        Skip
      </button>
    </header>
  );
}

function ContentPanel({
  index,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSelect,
  slide,
  tone,
}: {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  slide: Slide;
  tone: Tone;
}) {
  return (
    <article className="order-2 mx-auto w-full max-w-3xl lg:order-1 lg:mx-0">
      <div className="grid gap-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg text-white shadow-lg" style={{ background: tone.accent, boxShadow: `0 18px 34px ${tone.glow}` }}>
            <Icon name={slide.icon} size={26} color="#fff" />
          </span>
          <span className="min-w-0">
            <small className="block text-xs font-bold uppercase text-slate-400">Intro {index + 1} of {onboardingSlides.length}</small>
            <strong className="block text-sm font-bold text-slate-700">{slide.subtitle}</strong>
          </span>
        </div>

        <div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {slide.body}
          </p>
        </div>

        <FeatureList highlights={slide.highlights} tone={tone} />

        <SlideDots activeIndex={index} onSelect={onSelect} tone={tone} />

        <div className="grid grid-cols-[3.25rem_1fr] gap-3 sm:max-w-md">
          <button
            className="grid min-h-12 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 disabled:translate-y-0 disabled:opacity-40"
            type="button"
            disabled={isFirst}
            onClick={onBack}
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <Button
            className="min-h-12 w-full rounded-lg text-base shadow-lg"
            style={{ background: `linear-gradient(135deg, ${tone.accent}, ${tone.accentDark})`, boxShadow: `0 18px 34px ${tone.glow}` }}
            onClick={onNext}
          >
            {isLast ? "Get Started" : "Continue"}
            <Icon name="arrow-right" size={20} color="#fff" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function FeatureList({ highlights, tone }: { highlights: string[]; tone: Tone }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {highlights.map((item) => (
        <li
          className="grid min-h-20 grid-cols-[auto_1fr] items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm shadow-slate-950/5 sm:min-h-32 sm:grid-cols-1 sm:content-between sm:items-start"
          key={item}
          style={{ borderColor: tone.border }}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: tone.soft, color: tone.accent }}>
            <Icon name="check" size={16} />
          </span>
          <strong className="text-sm font-bold leading-5 text-slate-800 sm:text-base">{item}</strong>
        </li>
      ))}
    </ul>
  );
}

function SlideDots({ activeIndex, onSelect, tone }: { activeIndex: number; onSelect: (index: number) => void; tone: Tone }) {
  return (
    <div className="flex items-center gap-2" aria-label="Intro progress">
      {onboardingSlides.map((slide, dotIndex) => (
        <button
          key={slide.title}
          className={`h-2.5 rounded-full transition-all ${dotIndex === activeIndex ? "w-9" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
          style={dotIndex === activeIndex ? { backgroundColor: tone.accent } : undefined}
          type="button"
          aria-label={`Show slide ${dotIndex + 1}`}
          aria-current={dotIndex === activeIndex ? "step" : undefined}
          onClick={() => onSelect(dotIndex)}
        />
      ))}
    </div>
  );
}

function PreviewPanel({ index, slide, tone }: { index: number; slide: Slide; tone: Tone }) {
  const activeHighlight = slide.highlights[0];

  return (
    <aside className="order-1 mx-auto hidden w-full max-w-lg md:block lg:order-2" aria-label="Onboarding preview">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <div className="p-4 text-white sm:p-5" style={{ background: `linear-gradient(135deg, ${tone.accent}, ${tone.accentDark})` }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/15">
                <Icon name={slide.icon} size={23} color="#fff" />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-base font-bold">Mind Guard Care</strong>
                <small className="block truncate text-xs font-bold text-white/75">Personalized onboarding</small>
              </span>
            </div>
            <span className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold">0{index + 1}</span>
          </div>
        </div>

        <div className="grid gap-4 bg-[#fbfcff] p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2">
            <PreviewStat icon="activity" label="Mood" tone={tone} value="82%" />
            <PreviewStat icon="moon" label="Sleep" tone={tone} value="7.4h" />
            <PreviewStat icon="shield-check" label="Care" tone={tone} value="Live" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-bold text-slate-950">Weekly rhythm</strong>
              <span className="text-xs font-bold" style={{ color: tone.accent }}>Improving</span>
            </div>
            <div className="mt-5 flex h-28 items-end gap-2">
              {previewBars.map((height, barIndex) => (
                <span
                  className="flex-1 rounded-t-lg"
                  key={`${height}-${barIndex}`}
                  style={{
                    height: `${height}%`,
                    background: barIndex === previewBars.length - 1
                      ? `linear-gradient(180deg, ${tone.accent}, ${tone.accentDark})`
                      : "#dbe4ef",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
            <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: tone.soft, color: tone.accent }}>
              <Icon name="sparkles" size={18} />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm font-bold text-slate-950">{activeHighlight}</strong>
              <small className="block truncate text-xs font-semibold text-slate-500">{slide.subtitle}</small>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PreviewStat({ icon, label, tone, value }: { icon: string; label: string; tone: Tone; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-950/5">
      <Icon name={icon} size={16} color={tone.accent} />
      <small className="mt-2 block text-xs font-bold text-slate-400">{label}</small>
      <strong className="block text-lg font-bold text-slate-950 sm:text-xl">{value}</strong>
    </div>
  );
}
