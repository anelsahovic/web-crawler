type Props = {
  label: string;
  value: string | number;
};

export default function InfoCard({ label, value }: Props) {
  return (
    <div className="rounded-lg bg-white dark:bg-zinc-900 border p-3 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
