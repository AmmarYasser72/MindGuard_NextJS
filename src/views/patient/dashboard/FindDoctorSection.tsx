import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import DashboardPanel from "./DashboardPanel";

type FindDoctorSectionProps = {
  onNavigate: (path: string) => void;
};

const matchHighlights = ["Condition match", "Specialist fit", "Easy contact"];

export default function FindDoctorSection({
  onNavigate,
}: FindDoctorSectionProps) {
  return (
    <section aria-labelledby="find-doctor-heading">
      <DashboardPanel className="patient-find-doctor relative overflow-hidden p-0">
        <span
          className="patient-find-doctor-orb patient-find-doctor-orb-primary pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <span
          className="patient-find-doctor-orb patient-find-doctor-orb-secondary pointer-events-none absolute bottom-0 left-1/2 h-20 w-20 rounded-full blur-2xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="grid h-16 w-16 place-items-center rounded-[1.35rem] bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-[0_16px_34px_rgba(13,148,136,0.24)] ring-4 ring-white">
            <Icon name="stethoscope" size={34} color="#fff" />
          </span>

          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--patient-doctor-accent)]">
              Doctor Match
            </span>
            <h2
              id="find-doctor-heading"
              className="mt-1 text-xl font-black tracking-[-0.04em] text-app-text"
            >
              Find the right specialist for your condition
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app-text-soft">
              Get recommended doctors by condition, experience, and contact
              availability.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {matchHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="patient-find-doctor-chip rounded-full px-3 py-1.5 text-xs font-bold"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:min-w-44">
            <span className="patient-find-doctor-match hidden rounded-2xl px-4 py-3 text-center shadow-sm sm:block">
              <strong className="block text-2xl font-black text-[var(--patient-doctor-accent)]">
                96%
              </strong>
              <small className="font-bold text-[var(--patient-doctor-accent)]">
                top match
              </small>
            </span>
            <Button
              className="min-h-11 rounded-2xl bg-teal-600 px-4 hover:bg-teal-700 focus:ring-teal-200"
              icon="arrow-right"
              onClick={() => onNavigate("/doctor-recommendations")}
            >
              Find Doctor
            </Button>
          </div>
        </div>
      </DashboardPanel>
    </section>
  );
}
