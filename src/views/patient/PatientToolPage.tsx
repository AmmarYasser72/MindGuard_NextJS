"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../components/common/Toast";
import Icon from "../../components/common/Icon";
import { useRouter } from "../../hooks/useRouter";
import ActionGrid from "../../components/patient/ActionGrid";
import AppTopBar from "../../components/patient/AppTopBar";
import HeaderCard from "../../components/patient/HeaderCard";
import ToolSection from "./ToolSection";

const panelClass = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5";
const fieldClass = "grid gap-2 text-sm font-bold text-slate-700";
const inputClass = "min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
const secondaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-violet-100";
const primaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-sm shadow-violet-950/10 transition hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:bg-slate-300";

const moodChoices = [
  { icon: "\u{1F620}", label: "Very Low", value: 1 },
  { icon: "\u{1F622}", label: "Low", value: 2 },
  { icon: "\u{1F610}", label: "Balanced", value: 3 },
  { icon: "\u{1F60A}", label: "Good", value: 4 },
  { icon: "\u{1F60D}", label: "Excellent", value: 5 },
];

const exercisePlans = {
  Cardio: ["5 min warmup walk", "12 min steady run or cycling", "6 min light intervals", "5 min cool down"],
  "Strength Training": ["Bodyweight squats", "Incline pushups", "Glute bridges", "Standing rows", "Breathing reset"],
  "Yoga & Flexibility": ["Cat-cow flow", "Low lunge", "Seated forward fold", "Supine twist", "Three calm breaths"],
  Walking: ["Easy first 5 minutes", "Brisk middle 15 minutes", "Relaxed final 5 minutes", "Mood note after finishing"],
};

type ToolItem = {
  bedtime?: string;
  color?: string;
  date?: string;
  description?: string;
  duration?: string;
  icon?: string;
  meta?: string;
  mood?: string;
  preview?: string;
  progress?: number;
  quality?: string;
  status?: string;
  subtitle?: string;
  time?: string;
  title: string;
  [key: string]: unknown;
};

type ActiveToolModal = {
  item: ToolItem;
  kind: string;
};

export default function PatientToolPage({ config }) {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [activeModal, setActiveModal] = useState<ActiveToolModal | null>(null);
  const [journalEntries, setJournalEntries] = useState<ToolItem[]>([]);
  const [sleepEntries, setSleepEntries] = useState<ToolItem[]>([]);

  const headerAction = useMemo(() => {
    if (config.title === "Journal") return config.actions?.find((action) => action.title === "New Entry");
    if (config.title === "Sleep Log") return config.actions?.find((action) => action.title === "Log Sleep");
    return null;
  }, [config]);

  const sections = useMemo(() => config.sections.map((section) => {
    if (section.type === "journal") return { ...section, items: [...journalEntries, ...section.items] };
    if (section.type === "sleep") return { ...section, items: [...sleepEntries, ...section.items] };
    return section;
  }), [config.sections, journalEntries, sleepEntries]);

  function openAction(action) {
    const actionMap = {
      "New Entry": "journal-form",
      "Mood Check": "mood-check",
      "Start Workout": "workout",
      "Log Activity": "activity-form",
      "Log Sleep": "sleep-form",
      "Sleep Tips": "sleep-tips",
    };
    setActiveModal({ kind: actionMap[action.title] || "item-detail", item: action });
  }

  function openItem(item) {
    if (config.title === "Breathing Exercises") {
      setActiveModal({ kind: "breathing-player", item });
      return;
    }

    if (config.title === "Exercise") {
      setActiveModal({ kind: "exercise-detail", item });
      return;
    }

    if (item.preview) {
      setActiveModal({ kind: "journal-detail", item });
      return;
    }

    if (item.bedtime) {
      setActiveModal({ kind: "sleep-detail", item });
      return;
    }

    setActiveModal({ kind: "item-detail", item });
  }

  function closeModal() {
    setActiveModal(null);
  }

  function saveJournalEntry(entry) {
    setJournalEntries((current) => [entry, ...current]);
    showToast("Journal entry saved.", "success");
    closeModal();
  }

  function saveSleepEntry(entry) {
    setSleepEntries((current) => [entry, ...current]);
    showToast("Sleep entry logged.", "success");
    closeModal();
  }

  function finishAction(message) {
    showToast(message, "success");
    closeModal();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f3ff_0%,#f8fafc_46%,#ffffff_100%)]">
      <AppTopBar
        title={config.title}
        onBack={() => navigate("/patient-dashboard")}
        actionIcon={headerAction ? "plus" : undefined}
        onAction={headerAction ? () => openAction(headerAction) : undefined}
      />
      <div className="mx-auto grid max-w-5xl gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
        <HeaderCard {...config} />
        {config.actions ? <ActionGrid actions={config.actions} onAction={openAction} /> : null}
        {sections.map((section) => (
          <ToolSection key={section.title} section={section} color={config.color} onAction={openItem} />
        ))}
      </div>

      {activeModal ? (
        <ToolModal
          activeModal={activeModal}
          color={config.color}
          onClose={closeModal}
          onFinish={finishAction}
          onSaveJournal={saveJournalEntry}
          onSaveSleep={saveSleepEntry}
          toolTitle={config.title}
        />
      ) : null}
    </main>
  );
}

function ToolModal({ activeModal, color, onClose, onFinish, onSaveJournal, onSaveSleep, toolTitle }) {
  const item = activeModal.item;

  if (activeModal.kind === "breathing-player") {
    return <BreathingPlayer item={item} color={color} onClose={onClose} onFinish={() => onFinish(`${item.title} completed.`)} />;
  }

  if (activeModal.kind === "journal-form") {
    return <JournalEntryForm onClose={onClose} onSave={onSaveJournal} />;
  }

  if (activeModal.kind === "mood-check") {
    return <MoodCheckForm onClose={onClose} onSave={() => onFinish("Mood check saved.")} />;
  }

  if (activeModal.kind === "workout") {
    return <WorkoutPlanner item={item} onClose={onClose} onFinish={() => onFinish("Workout added to today's activity.")} />;
  }

  if (activeModal.kind === "activity-form") {
    return <ActivityLogForm onClose={onClose} onSave={() => onFinish("Activity logged.")} />;
  }

  if (activeModal.kind === "sleep-form") {
    return <SleepLogForm onClose={onClose} onSave={onSaveSleep} />;
  }

  if (activeModal.kind === "sleep-tips") {
    return <SleepTips onClose={onClose} onFinish={() => onFinish("Sleep plan saved for tonight.")} />;
  }

  if (activeModal.kind === "exercise-detail") {
    return <ExerciseDetail item={item} onClose={onClose} onStart={() => onFinish(`${item.title} plan started.`)} />;
  }

  if (activeModal.kind === "journal-detail") {
    return <JournalDetail item={item} onClose={onClose} onFinish={() => onFinish("Reflection marked as reviewed.")} />;
  }

  if (activeModal.kind === "sleep-detail") {
    return <SleepDetail item={item} onClose={onClose} onFinish={() => onFinish("Sleep note saved.")} />;
  }

  return <GenericDetail item={item} color={color} onClose={onClose} onFinish={() => onFinish(`${toolTitle} item updated.`)} />;
}

function BreathingPlayer({ item, color, onClose, onFinish }) {
  const plan = breathingPlan(item.title);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const phase = plan.phases[phaseIndex];

  useEffect(() => {
    if (!isRunning) return undefined;
    const timeout = window.setTimeout(() => {
      setPhaseIndex((current) => (current + 1) % plan.phases.length);
    }, phase.seconds * 1000);
    return () => window.clearTimeout(timeout);
  }, [isRunning, phase.seconds, plan.phases.length]);

  return (
    <Modal
      title={item.title}
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={() => setIsRunning((current) => !current)}>
            <Icon name={isRunning ? "pause" : "play"} size={18} />
            {isRunning ? "Pause" : "Start"}
          </button>
          <button type="button" className={primaryButtonClass} onClick={onFinish}>Complete exercise</button>
        </>
      )}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <section className={panelClass}>
          <span className="inline-flex min-h-7 items-center rounded-lg px-3 text-xs font-black uppercase" style={{ backgroundColor: `${color}1a`, color }}>
            {item.meta}
          </span>
          <h3 className="mt-4 text-2xl font-black text-slate-950">{phase.label}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{phase.helper}</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${((phaseIndex + 1) / plan.phases.length) * 100}%`, backgroundColor: color }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className={secondaryButtonClass} onClick={() => setPhaseIndex((current) => (current + plan.phases.length - 1) % plan.phases.length)}>
              <Icon name="arrow-left" size={18} />
              Previous
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => setPhaseIndex((current) => (current + 1) % plan.phases.length)}>
              Next
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </section>

        <aside className="grid aspect-square place-items-center rounded-full border border-slate-200 bg-slate-50 p-5">
          <div className="grid h-full w-full place-items-center rounded-full text-center text-white shadow-lg shadow-slate-950/10" style={{ background: `radial-gradient(circle at 35% 30%, ${color} 0%, #6366f1 55%, #4c1d95 100%)` }}>
            <span>
              <strong className="block text-5xl font-black">{phase.seconds}</strong>
              <small className="mt-1 block text-xs font-black uppercase tracking-[0.16em] text-white/80">seconds</small>
            </span>
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {plan.tips.map((tip) => (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-semibold leading-5 text-slate-600" key={tip}>{tip}</div>
        ))}
      </div>
    </Modal>
  );
}

function JournalEntryForm({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(moodChoices[3]);
  const canSave = title.trim().length > 1 && body.trim().length > 4;

  function save() {
    onSave({
      date: "Just now",
      title: title.trim(),
      preview: body.trim(),
      mood: mood.icon,
    });
  }

  return (
    <Modal
      title="New Journal Entry"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryButtonClass} onClick={save} disabled={!canSave}>Save entry</button>
        </>
      )}
    >
      <div className="grid gap-4">
        <label className={fieldClass}>Title<input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this reflection a title" /></label>
        <div className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Mood</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {moodChoices.map((choice) => (
              <button
                type="button"
                className={`grid min-h-20 content-start justify-items-center rounded-lg border p-2 text-center text-xs font-bold transition ${mood.value === choice.value ? "border-[var(--primary)] bg-violet-50 text-[var(--primary)]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                key={choice.label}
                onClick={() => setMood(choice)}
              >
                <span className="text-2xl">{choice.icon}</span>
                <span className="mt-2 leading-4">{choice.label}</span>
              </button>
            ))}
          </div>
        </div>
        <label className={fieldClass}>Reflection<textarea className={`${inputClass} min-h-40 py-3 leading-6`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write what happened, what you felt, and one next step." /></label>
      </div>
    </Modal>
  );
}

function MoodCheckForm({ onClose, onSave }) {
  const [mood, setMood] = useState(moodChoices[3]);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(4);

  return (
    <Modal
      title="Mood Check"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryButtonClass} onClick={onSave}>Save check-in</button>
        </>
      )}
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {moodChoices.map((choice) => (
            <button
              type="button"
              className={`grid min-h-20 content-start justify-items-center rounded-lg border p-2 text-center text-xs font-bold transition ${mood.value === choice.value ? "border-[var(--primary)] bg-violet-50 text-[var(--primary)]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              key={choice.label}
              onClick={() => setMood(choice)}
            >
              <span className="text-2xl">{choice.icon}</span>
              <span className="mt-2 leading-4">{choice.label}</span>
            </button>
          ))}
        </div>
        <RangeField label="Energy" value={energy} onChange={setEnergy} />
        <RangeField label="Stress" value={stress} onChange={setStress} />
        <div className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-2xl">{mood.icon}</span>
            <span>
              <strong className="block text-sm font-black text-slate-950">{mood.label}</strong>
              <small className="font-semibold text-slate-500">Energy {energy}/10, stress {stress}/10</small>
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function WorkoutPlanner({ item, onClose, onFinish }) {
  const defaultCategory = item?.title && exercisePlans[item.title] ? item.title : "Walking";
  const [category, setCategory] = useState(defaultCategory);
  const [duration, setDuration] = useState("25");

  return (
    <Modal
      title="Start Workout"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryButtonClass} onClick={onFinish}>Start {duration} min</button>
        </>
      )}
    >
      <div className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-4">
          {Object.keys(exercisePlans).map((name) => (
            <button
              type="button"
              className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${category === name ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              key={name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className={fieldClass}>Duration<select className={inputClass} value={duration} onChange={(event) => setDuration(event.target.value)}><option>15</option><option>25</option><option>30</option><option>45</option></select></label>
        <div className="grid gap-3">
          {exercisePlans[category].map((step, index) => (
            <div className={panelClass} key={step}>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-xs font-black text-emerald-600">{index + 1}</span>
              <strong className="ml-3 text-sm text-slate-900">{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ActivityLogForm({ onClose, onSave }) {
  const [activity, setActivity] = useState("Walking");
  const [minutes, setMinutes] = useState("25");
  const [intensity, setIntensity] = useState("Moderate");

  return (
    <Modal
      title="Log Activity"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryButtonClass} onClick={onSave}>Save activity</button>
        </>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>Activity<input className={inputClass} value={activity} onChange={(event) => setActivity(event.target.value)} /></label>
        <label className={fieldClass}>Minutes<input className={inputClass} type="number" min="1" value={minutes} onChange={(event) => setMinutes(event.target.value)} /></label>
        <label className={fieldClass}>Intensity<select className={inputClass} value={intensity} onChange={(event) => setIntensity(event.target.value)}><option>Light</option><option>Moderate</option><option>Challenging</option></select></label>
        <div className={`${panelClass} grid content-center`}>
          <small className="text-xs font-black uppercase text-slate-400">Summary</small>
          <strong className="mt-1 text-sm text-slate-950">{minutes || 0} min {activity.toLowerCase()}, {intensity.toLowerCase()} intensity</strong>
        </div>
      </div>
    </Modal>
  );
}

function SleepLogForm({ onClose, onSave }) {
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState("Good");
  const duration = sleepDuration(bedtime, wakeTime);

  function save() {
    onSave({
      date: "Just now",
      duration,
      quality,
      bedtime: formatClock(bedtime),
      title: "Sleep entry",
    });
  }

  return (
    <Modal
      title="Log Sleep"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryButtonClass} onClick={save}>Save sleep</button>
        </>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={fieldClass}>Bedtime<input className={inputClass} type="time" value={bedtime} onChange={(event) => setBedtime(event.target.value)} /></label>
        <label className={fieldClass}>Wake time<input className={inputClass} type="time" value={wakeTime} onChange={(event) => setWakeTime(event.target.value)} /></label>
        <label className={fieldClass}>Quality<select className={inputClass} value={quality} onChange={(event) => setQuality(event.target.value)}><option>Excellent</option><option>Good</option><option>Fair</option><option>Restless</option></select></label>
        <div className={`${panelClass} grid content-center`}>
          <small className="text-xs font-black uppercase text-slate-400">Calculated duration</small>
          <strong className="mt-1 text-2xl font-black text-slate-950">{duration}</strong>
        </div>
      </div>
    </Modal>
  );
}

function SleepTips({ onClose, onFinish }) {
  const tips = [
    "Keep your wake time within the same 30 minute window.",
    "Dim bright screens during the last hour before bed.",
    "Use a short breathing exercise if your thoughts speed up.",
    "Keep caffeine earlier than mid-afternoon when possible.",
  ];

  return (
    <Modal
      title="Sleep Tips"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button>
          <button type="button" className={primaryButtonClass} onClick={onFinish}>Use tonight</button>
        </>
      )}
    >
      <div className="grid gap-3">
        {tips.map((tip, index) => (
          <div className={panelClass} key={tip}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs font-black text-[var(--primary)]">{index + 1}</span>
            <strong className="ml-3 text-sm leading-6 text-slate-800">{tip}</strong>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ExerciseDetail({ item, onClose, onStart }) {
  const plan = exercisePlans[item.title] || exercisePlans.Walking;

  return (
    <Modal title={item.title} onClose={onClose} actions={<><button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button><button type="button" className={primaryButtonClass} onClick={onStart}>Start plan</button></>}>
      <div className="grid gap-4">
        <section className={panelClass}>
          <p className="text-sm font-semibold leading-6 text-slate-600">{item.subtitle}</p>
          <span className="mt-3 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">{item.meta}</span>
        </section>
        <div className="grid gap-3">
          {plan.map((step, index) => (
            <div className={panelClass} key={step}>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-xs font-black text-emerald-600">{index + 1}</span>
              <strong className="ml-3 text-sm text-slate-900">{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function JournalDetail({ item, onClose, onFinish }) {
  return (
    <Modal title={item.title} onClose={onClose} actions={<><button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button><button type="button" className={primaryButtonClass} onClick={onFinish}>Mark reviewed</button></>}>
      <div className="grid gap-4">
        <section className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-violet-50 text-2xl">{item.mood}</span>
            <span>
              <small className="block text-xs font-black uppercase text-slate-400">{item.date}</small>
              <strong className="block text-sm text-slate-950">Reflection entry</strong>
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{item.preview}</p>
        </section>
        <section className={panelClass}>
          <small className="text-xs font-black uppercase text-slate-400">Follow-up prompt</small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">What helped most today, and what would make tomorrow 10 percent easier?</p>
        </section>
      </div>
    </Modal>
  );
}

function SleepDetail({ item, onClose, onFinish }) {
  return (
    <Modal title={`Sleep - ${item.date}`} onClose={onClose} actions={<><button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button><button type="button" className={primaryButtonClass} onClick={onFinish}>Save note</button></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoTile label="Duration" value={item.duration} />
        <InfoTile label="Quality" value={item.quality} />
        <InfoTile label="Bedtime" value={item.bedtime} />
        <section className={`${panelClass} sm:col-span-3`}>
          <small className="text-xs font-black uppercase text-slate-400">Pattern note</small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">This entry supports the weekly consistency score and helps connect rest quality with mood and energy trends.</p>
        </section>
      </div>
    </Modal>
  );
}

function GenericDetail({ item, color, onClose, onFinish }) {
  const progressPercent = item.progress !== undefined ? Math.round(item.progress * 100) : null;

  return (
    <Modal title={item.title} onClose={onClose} actions={<><button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button><button type="button" className={primaryButtonClass} onClick={onFinish}>Update</button></>}>
      <div className="grid gap-4">
        <section className={panelClass}>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: `${color}1a` }}>
              <Icon name={item.icon || "target"} size={22} color={color} />
            </span>
            <span className="min-w-0">
              <strong className="block text-base font-black text-slate-950">{item.title}</strong>
              <small className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{item.subtitle || item.description || item.meta || item.time}</small>
            </span>
          </div>
          {progressPercent !== null ? (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs font-black uppercase text-slate-400"><span>Progress</span><span>{progressPercent}%</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: item.color || color }} /></div>
            </div>
          ) : null}
        </section>
        <section className={panelClass}>
          <small className="text-xs font-black uppercase text-slate-400">Next step</small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detailNextStep(item)}</p>
        </section>
      </div>
    </Modal>
  );
}

function RangeField({ label, value, onChange }) {
  return (
    <label className={fieldClass}>
      <span className="flex items-center justify-between"><span>{label}</span><strong className="text-[var(--primary)]">{value}/10</strong></span>
      <input className="accent-[var(--primary)]" type="range" min="1" max="10" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className={panelClass}>
      <small className="text-xs font-black uppercase text-slate-400">{label}</small>
      <strong className="mt-2 block text-lg font-black text-slate-950">{value}</strong>
    </div>
  );
}

function breathingPlan(title) {
  if (title.includes("Box")) {
    return {
      phases: [
        { label: "Inhale", seconds: 4, helper: "Breathe in smoothly through your nose." },
        { label: "Hold", seconds: 4, helper: "Keep your shoulders relaxed." },
        { label: "Exhale", seconds: 4, helper: "Release the breath slowly." },
        { label: "Hold", seconds: 4, helper: "Rest before the next round." },
      ],
      tips: ["Keep the rhythm equal.", "Stop if you feel lightheaded.", "Repeat for five minutes."],
    };
  }

  if (title.includes("Diaphragmatic")) {
    return {
      phases: [
        { label: "Belly inhale", seconds: 4, helper: "Let your abdomen rise gently." },
        { label: "Soft pause", seconds: 2, helper: "Keep the breath comfortable." },
        { label: "Long exhale", seconds: 6, helper: "Let your abdomen soften." },
      ],
      tips: ["Place one hand on your belly.", "Breathe quietly.", "Use this before sleep."],
    };
  }

  return {
    phases: [
      { label: "Inhale", seconds: 4, helper: "Fill your lungs slowly." },
      { label: "Hold", seconds: 7, helper: "Hold without tightening your jaw." },
      { label: "Exhale", seconds: 8, helper: "Exhale longer than you inhaled." },
    ],
    tips: ["Use four rounds to start.", "Keep your neck loose.", "Let the exhale do the calming."],
  };
}

function sleepDuration(bedtime, wakeTime) {
  const [bedHour, bedMinute] = bedtime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const start = bedHour * 60 + bedMinute;
  let end = wakeHour * 60 + wakeMinute;
  if (end <= start) end += 24 * 60;
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatClock(value) {
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function detailNextStep(item) {
  if (item.status === "Done") return "Keep the goal visible tomorrow and choose a similar start time.";
  if (item.status === "In Progress") return "Finish the smallest remaining piece first, then mark the goal complete.";
  if (item.status === "Pending") return "Schedule a specific time and make the first step shorter than five minutes.";
  if (item.subtitle) return "Review what helped, then repeat the useful part once more this week.";
  return "Add one note so your dashboard can keep the context attached to this item.";
}
