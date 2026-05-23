import Card from "../../components/common/Card";
import Icon from "../../components/common/Icon";
import ActivityRows from "../../components/patient/ActivityRows";
import BreakdownGrid from "../../components/patient/BreakdownGrid";
import DaysRow from "../../components/patient/DaysRow";
import GoalList from "../../components/patient/GoalList";
import ItemList from "../../components/patient/ItemList";
import JournalEntries from "../../components/patient/JournalEntries";
import StatGrid from "../../components/patient/StatGrid";

export default function ToolSection({ section, color, onAction }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
      {section.type === "list" ? <ItemList items={section.items} color={color} onItem={onAction} /> : null}
      {section.type === "stats" ? <Card><StatGrid items={section.items} /></Card> : null}
      {section.type === "journal" ? <JournalEntries items={section.items} onItem={onAction} /> : null}
      {section.type === "goals" ? <GoalList items={section.items} onItem={onAction} /> : null}
      {section.type === "activity" ? <ActivityRows items={section.items} onItem={onAction} /> : null}
      {section.type === "breakdown" ? <Card><BreakdownGrid items={section.items} /></Card> : null}
      {section.type === "days" ? <Card><DaysRow days={section.days} active={section.active} /></Card> : null}
      {section.type === "sleep" ? (
        <div className="grid gap-3">
          {section.items.map((item) => (
            <button
              type="button"
              className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              key={item.date}
              onClick={() => onAction(item)}
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-50"><Icon name="moon" size={20} color="#ec4899" /></span>
              <span className="min-w-0">
                <small className="block text-xs font-semibold text-slate-400">{item.date}</small>
                <strong className="mt-1 block text-sm font-bold text-slate-900">
                  {item.duration} <em className="text-xs not-italic text-pink-500">{item.quality}</em>
                </strong>
                <span className="mt-1 block text-xs font-semibold text-slate-500">Bedtime: {item.bedtime}</span>
              </span>
              <Icon name="chevron-right" size={16} color="#9ca3af" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
