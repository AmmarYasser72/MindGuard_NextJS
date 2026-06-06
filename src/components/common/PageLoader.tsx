import Icon from "./Icon";

export default function PageLoader({
  message = "Loading MindGuard...",
}: {
  message?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center text-slate-700">
      <div className="grid justify-items-center gap-4">
        <span className="grid h-14 w-14 animate-spin place-items-center rounded-full border border-violet-100 bg-white text-[var(--primary)] shadow-sm shadow-violet-950/5">
          <Icon name="loader-circle" size={26} />
        </span>
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </main>
  );
}
