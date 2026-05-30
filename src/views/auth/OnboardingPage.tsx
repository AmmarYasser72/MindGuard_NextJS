"use client";

import { useState } from "react";
import { onboardingSlides } from "../../data/onboardingData";
import { useRouter } from "../../hooks/useRouter";
import OnboardingContentPanel from "./onboarding/OnboardingContentPanel";
import OnboardingHeader from "./onboarding/OnboardingHeader";
import OnboardingPreviewPanel from "./onboarding/OnboardingPreviewPanel";
import { slideTones } from "./onboarding/onboardingTheme";

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
        <OnboardingHeader onSkip={complete} tone={tone} />

        <section className="grid flex-1 gap-6 py-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(340px,0.72fr)] lg:items-center lg:gap-10 lg:py-7">
          <OnboardingContentPanel
            index={index}
            isFirst={isFirst}
            isLast={isLast}
            onBack={() => setIndex((value) => value - 1)}
            onNext={next}
            onSelect={setIndex}
            slide={slide}
            tone={tone}
          />
          <OnboardingPreviewPanel index={index} slide={slide} tone={tone} />
        </section>
      </div>
    </main>
  );
}
