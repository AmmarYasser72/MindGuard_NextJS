type AppointmentNoticeProps = {
  message: string;
};

export default function AppointmentNotice({ message }: AppointmentNoticeProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-500">
      {message}
    </div>
  );
}
