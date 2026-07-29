interface StatCardProps {
  label: string;
  value: number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-heading text-2xl font-semibold">{value}</div>
    </div>
  );
}
