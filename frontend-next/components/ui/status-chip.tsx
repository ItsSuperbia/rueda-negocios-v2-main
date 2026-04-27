import { cn } from "@/lib/cn";

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const classes: Record<string, string> = {
    pendiente: "bg-warning/10 text-warning ring-warning/30",
    aprobado: "bg-success/10 text-success ring-success/30",
    rechazado: "bg-danger/10 text-danger ring-danger/30",
    pending: "bg-warning/10 text-warning ring-warning/30",
    accepted: "bg-success/10 text-success ring-success/30",
    rejected: "bg-danger/10 text-danger ring-danger/30",
    scheduled: "bg-accent/10 text-accent ring-accent/30",
    completed: "bg-success/10 text-success ring-success/30"
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1", classes[status] ?? "bg-slate-100 text-slate-700 ring-slate-200")}>
      {status}
    </span>
  );
}
