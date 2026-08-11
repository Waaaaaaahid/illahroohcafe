import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl",
            accent ? "bg-amber-gradient text-accent-foreground" : "bg-secondary text-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
