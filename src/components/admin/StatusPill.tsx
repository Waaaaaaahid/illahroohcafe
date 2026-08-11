import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const ORDER_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-muted text-muted-foreground",
  Confirmed: "bg-accent/15 text-accent",
  Preparing: "bg-accent/15 text-accent",
  Ready: "bg-primary/10 text-primary",
  "Out for Delivery": "bg-primary/10 text-primary",
  Completed: "bg-emerald-500/15 text-emerald-600",
  Cancelled: "bg-destructive/10 text-destructive",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  paid: "bg-emerald-500/15 text-emerald-600",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-primary/10 text-primary",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", ORDER_STYLES[status])}>
      {status}
    </span>
  );
}

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize", PAYMENT_STYLES[status])}>
      {status}
    </span>
  );
}
