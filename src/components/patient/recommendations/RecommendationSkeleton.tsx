import Card from "../../common/Card";

export default function RecommendationSkeleton() {
  return (
    <div className="grid gap-4" aria-label="Loading doctor recommendations">
      {[0, 1, 2].map((item) => (
        <Card key={item} className="animate-pulse space-y-5">
          <div className="flex gap-4">
            <span className="h-14 w-14 rounded-[1.25rem] bg-slate-100" />
            <span className="flex-1 space-y-3">
              <span className="block h-5 w-1/3 rounded-full bg-slate-100" />
              <span className="block h-4 w-1/2 rounded-full bg-slate-100" />
              <span className="block h-4 w-full rounded-full bg-slate-100" />
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <span className="h-16 rounded-2xl bg-slate-100" />
            <span className="h-16 rounded-2xl bg-slate-100" />
            <span className="h-16 rounded-2xl bg-slate-100" />
          </div>
        </Card>
      ))}
    </div>
  );
}
