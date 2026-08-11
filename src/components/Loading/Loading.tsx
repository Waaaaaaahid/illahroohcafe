import { AlertCircle, Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function MenuCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card p-3">
      <Skeleton className="aspect-4/3 w-full rounded-2xl" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-4 h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

export function MenuGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <MenuCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-14 text-center">
      <AlertCircle className="size-8 text-destructive" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RotateCcw className="size-4" /> Try again
        </Button>
      ) : null}
    </div>
  );
}
