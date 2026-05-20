import AuthLogo from "./AuthLogo";
import Icon from "../common/Icon";

type AuthBenefit = {
  icon: string;
  iconColor: string;
  label: string;
};

type AuthHeroPanelProps = {
  benefits: AuthBenefit[];
  description: string;
  eyebrow: string;
  title: string;
};

export default function AuthHeroPanel({ eyebrow, title, description, benefits }: AuthHeroPanelProps) {
  return (
    <section className="grid min-h-[560px] content-center gap-5 rounded-[2rem] bg-[linear-gradient(135deg,#0f766e_0%,#264653_55%,#4f46e5_100%)] p-7 text-white shadow-[0_24px_60px_rgba(15,118,110,0.18)] sm:p-10">
      <AuthLogo size={72} />
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-[0.24em] text-white/70">{eyebrow}</span>
        <h1 className="max-w-xl text-5xl font-bold leading-[0.95] sm:text-6xl">{title}</h1>
        <p className="max-w-md text-base leading-7 text-white/80">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2" aria-label="Sign in benefits">
        {benefits.map((benefit) => (
          <span
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/12 px-4 text-sm font-bold backdrop-blur"
            key={benefit.label}
          >
            <Icon name={benefit.icon} size={18} color={benefit.iconColor} />
            {benefit.label}
          </span>
        ))}
      </div>
    </section>
  );
}
