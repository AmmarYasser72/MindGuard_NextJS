import Icon from "../../../components/common/Icon";

export default function MetricGradientCard({ current }) {
  return (
    <section
      className="grid gap-5 rounded-[1.75rem] px-6 py-6 text-white shadow-[0_22px_40px_rgba(76,29,149,0.14)]"
      style={{ background: `linear-gradient(135deg, ${current.gradient[0]}, ${current.gradient[1]})` }}
    >
      <h2 className="text-2xl font-bold">{current.title}</h2>
      <div className="flex flex-wrap items-start justify-between gap-4">
        {current.metrics.map((metric, index) => metric.gauge ? (
          <span
            className="grid h-24 w-24 place-items-center rounded-full border border-white/70 bg-white/8 text-center"
            key={index}
          >
            <span>
              <strong className="block text-3xl font-bold leading-none">{metric.value}</strong>
              <small className="mt-1 block text-[11px] font-bold text-white/85">{metric.label}</small>
            </span>
          </span>
        ) : (
          <span className="grid min-w-[9rem] gap-2" key={metric.label}>
            <Icon name={metric.icon} size={24} color="#fff" />
            <small className="text-sm font-bold text-white/80">{metric.label}</small>
            <strong className="text-[1.75rem] font-bold leading-none">{metric.value}</strong>
          </span>
        ))}
      </div>
      <em className="inline-flex w-fit items-center rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] not-italic text-white/90">
        {current.badge}
      </em>
    </section>
  );
}
