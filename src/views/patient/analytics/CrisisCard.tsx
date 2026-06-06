import Icon from "../../../components/common/Icon";
import { useToast } from "../../../components/common/Toast";
import { useRouter } from "../../../hooks/useRouter";

export default function CrisisCard({ crisis }) {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  function handleAction(action, fallbackMessage) {
    if (!action) {
      showToast(fallbackMessage);
      return;
    }

    if (action.type === "navigate" && action.path) {
      navigate(action.path);
      return;
    }

    if (action.type === "toast" && action.message) {
      showToast(action.message);
      return;
    }

    showToast(fallbackMessage);
  }

  return (
    <section
      className="grid gap-5 rounded-[1.75rem] px-6 py-6 text-white shadow-[0_18px_34px_rgba(239,68,68,0.18)]"
      style={{
        background: `linear-gradient(135deg, ${crisis.gradient[0]}, ${crisis.gradient[1]})`,
      }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
        <Icon name="triangle-alert" size={24} color="#fff" />
      </div>
      <span className="grid gap-2">
        <strong className="text-xl font-bold">{crisis.title}</strong>
        <small className="text-sm leading-6 text-white/85">
          {crisis.subtitle}
        </small>
      </span>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="min-h-12 rounded-2xl bg-white px-4 text-sm font-bold text-red-600 transition hover:-translate-y-0.5"
          type="button"
          onClick={() =>
            handleAction(
              crisis.primaryAction,
              `${crisis.primary} is not configured yet`,
            )
          }
        >
          {crisis.primary}
        </button>
        <button
          className="min-h-12 rounded-2xl border border-white/30 bg-white/12 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/18"
          type="button"
          onClick={() =>
            handleAction(
              crisis.secondaryAction,
              `${crisis.secondary} is not configured yet`,
            )
          }
        >
          {crisis.secondary}
        </button>
      </div>
    </section>
  );
}
