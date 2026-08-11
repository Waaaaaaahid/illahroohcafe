import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Receipt } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { ErrorState, Skeleton } from "@/components/Loading/Loading";
import { orderService } from "@/services/orderService";
import { useCafe } from "@/context/CafeContext";
import { formatCurrency, formatDateTime } from "@/utils/format";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>): { orderId?: string } => ({
    ...(typeof search["orderId"] === "string" ? { orderId: search["orderId"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Order confirmed — Maison Noir" },
      { name: "description", content: "Your Maison Noir order is confirmed. Track its progress from kitchen to doorstep." },
      { property: "og:title", content: "Order confirmed — Maison Noir" },
      { property: "og:description", content: "Thanks for ordering. Your kitchen ticket is live." },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderId } = Route.useSearch();
  const { settings } = useCafe();
  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.get(orderId as string),
    enabled: Boolean(orderId),
  });

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex size-20 items-center justify-center rounded-full bg-success/12 text-success"
      >
        <CheckCircle2 className="size-10" />
      </motion.span>
      <h1 className="mt-8 font-display text-4xl font-semibold">Order confirmed</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The kitchen has your ticket. We'll have it with you shortly.
      </p>

      <div className="mt-10 w-full max-w-lg rounded-3xl border border-border bg-card p-7 text-left shadow-soft">
        {!orderId ? (
          <p className="text-sm text-muted-foreground">No order reference found.</p>
        ) : query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : query.isError || !query.data ? (
          <ErrorState description="We couldn't load your order." onRetry={() => void query.refetch()} />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Reference</p>
                <p className="font-display text-2xl font-semibold">{query.data.code}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                {query.data.orderStatus}
              </span>
            </div>
            <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              {query.data.items.map((item) => (
                <li key={item.item} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity, settings.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(query.data.totalAmount, settings.currency)}</span>
            </div>
            <p className="mt-5 flex gap-2 text-xs text-muted-foreground">
              <MapPin className="size-4 shrink-0" /> {query.data.customerDetails.address}
            </p>
            <p className="mt-2 flex gap-2 text-xs text-muted-foreground">
              <Receipt className="size-4 shrink-0" />
              {query.data.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"} ·{" "}
              {formatDateTime(query.data.createdAt)}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/order-tracking" search={orderId ? { orderId } : {}}>
          <Button variant="accent">Track this order</Button>
        </Link>
        <Link to="/menu">
          <Button variant="outline">Order something else</Button>
        </Link>
      </div>
    </div>
  );
}
