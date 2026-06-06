import { useEffect, useState } from "react";
import { Modal } from "../../../components/common/Modal";
import Icon from "../../../components/common/Icon";
import {
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./constants";
import { breathingPlan } from "./helpers";
import type { ToolItem } from "./types";

type BreathingPlayerProps = {
  color: string;
  item: ToolItem;
  onClose: () => void;
  onFinish: () => void;
};

export default function BreathingPlayer({
  item,
  color,
  onClose,
  onFinish,
}: BreathingPlayerProps) {
  const title = item.title || "Breathing Exercise";
  const plan = breathingPlan(title);
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
      title={title}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setIsRunning((current) => !current)}
          >
            <Icon name={isRunning ? "pause" : "play"} size={18} />
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={onFinish}
          >
            Complete exercise
          </button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <section className={panelClass}>
          <span
            className="inline-flex min-h-7 items-center rounded-lg px-3 text-xs font-black uppercase"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            {item.meta}
          </span>
          <h3 className="mt-4 text-2xl font-black text-slate-950">
            {phase.label}
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {phase.helper}
          </p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full transition-all duration-500"
              style={{
                width: `${((phaseIndex + 1) / plan.phases.length) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() =>
                setPhaseIndex(
                  (current) =>
                    (current + plan.phases.length - 1) % plan.phases.length,
                )
              }
            >
              <Icon name="arrow-left" size={18} />
              Previous
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() =>
                setPhaseIndex((current) => (current + 1) % plan.phases.length)
              }
            >
              Next
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </section>

        <aside className="grid aspect-square place-items-center rounded-full border border-slate-200 bg-slate-50 p-5">
          <div
            className="grid h-full w-full place-items-center rounded-full text-center text-white shadow-lg shadow-slate-950/10"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${color} 0%, #6366f1 55%, #4c1d95 100%)`,
            }}
          >
            <span>
              <strong className="block text-5xl font-black">
                {phase.seconds}
              </strong>
              <small className="mt-1 block text-xs font-black uppercase tracking-[0.16em] text-white/80">
                seconds
              </small>
            </span>
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {plan.tips.map((tip) => (
          <div
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-semibold leading-5 text-slate-600"
            key={tip}
          >
            {tip}
          </div>
        ))}
      </div>
    </Modal>
  );
}
