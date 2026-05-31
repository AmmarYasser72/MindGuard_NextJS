import Card from "../../components/common/Card";
import ActivityRows from "../../components/patient/ActivityRows";
import BreakdownGrid from "../../components/patient/BreakdownGrid";
import DaysRow from "../../components/patient/DaysRow";
import GoalList from "../../components/patient/GoalList";
import ItemList from "../../components/patient/ItemList";
import JournalEntries from "../../components/patient/JournalEntries";
import PatientListButton from "../../components/patient/PatientListButton";
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
            <PatientListButton
              key={item.date}
              eyebrow={item.date}
              icon="moon"
              iconBg="#fdf2f8"
              iconColor="#ec4899"
              title={<>{item.duration} <em className="text-xs not-italic text-pink-500">{item.quality}</em></>}
              subtitle={`Bedtime: ${item.bedtime}`}
              onClick={() => onAction(item)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
