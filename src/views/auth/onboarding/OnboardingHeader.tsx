import Icon from "../../../components/common/Icon";
import type { Tone } from "./onboardingTheme";

type OnboardingHeaderProps = {
  onSkip: () => void;
  tone: Tone;
};

export default function OnboardingHeader({
  onSkip,
  tone,
}: OnboardingHeaderProps) {
  return (
    <header className="flex min-h-12 items-center gap-3">
      <div className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left shadow-sm shadow-slate-950/5">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-white"
          style={{ background: tone.accent }}
        >
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
