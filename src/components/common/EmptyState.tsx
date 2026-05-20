export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm font-medium text-slate-500 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
      {message}
    </div>
  );
}
