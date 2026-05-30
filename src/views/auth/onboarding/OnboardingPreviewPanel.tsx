import Icon from "../../../components/common/Icon";
import { previewBars } from "./onboardingTheme";
import type { Tone } from "./onboardingTheme";
import type { onboardingSlides } from "../../../data/onboardingData";

type Slide = (typeof onboardingSlides)[number];

type OnboardingPreviewPanelProps = {
  index: number;
  slide: Slide;
  tone: Tone;
};

export default function OnboardingPreviewPanel({ index, slide, tone }: OnboardingPreviewPanelProps) {
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

type PreviewStatProps = {
  icon: string;
  label: string;
  tone: Tone;
  value: string;
};

function PreviewStat({ icon, label, tone, value }: PreviewStatProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-950/5">
      <Icon name={icon} size={16} color={tone.accent} />
      <small className="mt-2 block text-xs font-bold text-slate-400">{label}</small>
      <strong className="block text-lg font-bold text-slate-950 sm:text-xl">{value}</strong>
    </div>
  );
}
