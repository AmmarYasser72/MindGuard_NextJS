import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import { onboardingSlides } from "../../../data/onboardingData";
import type { Tone } from "./onboardingTheme";

type Slide = (typeof onboardingSlides)[number];

type OnboardingContentPanelProps = {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  slide: Slide;
  tone: Tone;
};

export default function OnboardingContentPanel({
  index,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSelect,
  slide,
  tone,
}: OnboardingContentPanelProps) {
  return (
    <article className="order-2 mx-auto w-full max-w-3xl lg:order-1 lg:mx-0">
      <div className="grid gap-5">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-lg text-white shadow-lg"
            style={{
              background: tone.accent,
              boxShadow: `0 18px 34px ${tone.glow}`,
            }}
          >
            <Icon name={slide.icon} size={26} color="#fff" />
          </span>
          <span className="min-w-0">
            <small className="block text-xs font-bold uppercase text-slate-400">
              Intro {index + 1} of {onboardingSlides.length}
            </small>
            <strong className="block text-sm font-bold text-slate-700">
              {slide.subtitle}
            </strong>
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
            style={{
              background: `linear-gradient(135deg, ${tone.accent}, ${tone.accentDark})`,
              boxShadow: `0 18px 34px ${tone.glow}`,
            }}
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

type FeatureListProps = {
  highlights: string[];
  tone: Tone;
};

function FeatureList({ highlights, tone }: FeatureListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {highlights.map((item) => (
        <li
          className="grid min-h-20 grid-cols-[auto_1fr] items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm shadow-slate-950/5 sm:min-h-32 sm:grid-cols-1 sm:content-between sm:items-start"
          key={item}
          style={{ borderColor: tone.border }}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ backgroundColor: tone.soft, color: tone.accent }}
          >
            <Icon name="check" size={16} />
          </span>
          <strong className="text-sm font-bold leading-5 text-slate-800 sm:text-base">
            {item}
          </strong>
        </li>
      ))}
    </ul>
  );
}

type SlideDotsProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
  tone: Tone;
};

function SlideDots({ activeIndex, onSelect, tone }: SlideDotsProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Intro progress">
      {onboardingSlides.map((slide, dotIndex) => (
        <button
          key={slide.title}
          className={`h-2.5 rounded-full transition-all ${dotIndex === activeIndex ? "w-9" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
          style={
            dotIndex === activeIndex
              ? { backgroundColor: tone.accent }
              : undefined
          }
          type="button"
          aria-label={`Show slide ${dotIndex + 1}`}
          aria-current={dotIndex === activeIndex ? "step" : undefined}
          onClick={() => onSelect(dotIndex)}
        />
      ))}
    </div>
  );
}
