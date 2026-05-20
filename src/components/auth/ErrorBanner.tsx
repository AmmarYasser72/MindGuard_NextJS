import Icon from "../common/Icon";

export default function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      <Icon name="circle-alert" size={20} color="#dc2626" />
      <span>{error}</span>
    </div>
  );
}
