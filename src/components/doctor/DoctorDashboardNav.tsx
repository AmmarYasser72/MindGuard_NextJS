import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import {
  bottomNavClass,
  destinations,
  primaryPurple,
  railButtonClass,
} from "./dashboardShared";

type DoctorNavigationProps = {
  onSelect: (key: string) => void;
  selected: string;
};

export function DoctorSideNav({ selected, onSelect }: DoctorNavigationProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-28 shrink-0 flex-col border-r border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-4 shadow-[var(--shadow)] backdrop-blur-[18px] lg:flex">
      <div className="mb-5 grid h-12 w-12 place-items-center self-center rounded-lg bg-[var(--primary)] text-white shadow-lg shadow-indigo-900/20">
        <Icon name="stethoscope" size={24} color="#fff" />
      </div>
      <nav className="grid gap-2" aria-label="Doctor navigation">
        {destinations.map((item) => (
          <button
            type="button"
            className={railButtonClass(selected === item.key)}
            key={item.key}
            onClick={() => onSelect(item.key)}
          >
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function DoctorMobileNav({ selected, onSelect }: DoctorNavigationProps) {
  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[var(--nav-shadow)] backdrop-blur-[20px] lg:hidden"
        aria-label="Doctor navigation"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-1">
          {destinations.map((item) => (
            <button
              type="button"
              className={bottomNavClass(selected === item.key)}
              key={item.key}
              onClick={() => onSelect(item.key)}
            >
              <Icon
                name={item.icon}
                size={22}
                color={selected === item.key ? primaryPurple : "currentColor"}
              />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="fixed bottom-[5.4rem] right-3 z-30 lg:hidden">
        <ThemeToggle />
      </div>
    </>
  );
}
