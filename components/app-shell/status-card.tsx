interface StatusCardProps {
  readonly label: string;
  readonly value: string;
}

export function StatusCard({ label, value }: StatusCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-sm text-slate-950">{value}</p>
    </div>
  );
}
