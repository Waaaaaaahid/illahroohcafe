import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, PackageCheck, PackageSearch, Truck } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState, ErrorState, Skeleton } from "@/components/Loading/Loading";
import { orderService } from "@/services/orderService";
import { ORDER_STATUS_FLOW } from "@/constants";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useCafe } from "@/context/CafeContext";

export const Route = createFileRoute("/order-tracking")({
  validateSearch: (search: Record<string, unknown>): { orderId?: string } => ({
    ...(typeof search["orderId"] === "string" ? { orderId: search["orderId"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Track your order — Ilarooh" },
      { name: "description", content: "Follow your Ilarooh order live from the kitchen pass to your doorstep." },
      { property: "og:title", content: "Track your Ilarooh order" },
      { property: "og:description", content: "Live status from confirmed to delivered." },
    ],
  }),
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const { orderId } = Route.useSearch();
  const { settings } = useCafe();
  const queryClient = useQueryClient();
  const [reference, setReference] = useState(orderId ?? "");
  const [active, setActive] = useState(orderId ?? "");

  const query = useQuery({
    queryKey: ["order", active],
    queryFn: () => orderService.get(active),
    enabled: Boolean(active),
  });
  useEffect(() => {
  if (!active) return;

  const unsubscribe = orderService.subscribeOrder(
    active,
    (updatedOrder) => {
      queryClient.setQueryData(
        ["order", active],
        updatedOrder
      );
    }
  );

  return unsubscribe;
}, [active, queryClient]);

const order = query.data;
const orderStatus = order?.orderStatus;
const finished = !order || orderStatus === "Cancelled" || orderStatus === "Completed";
const currentIndex = order && orderStatus ? ORDER_STATUS_FLOW.indexOf(orderStatus) : -1;

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl font-semibold">Track your order</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your order reference (for example MN-10241).
      </p>

      <form
        className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          setActive(reference.trim());
        }}
      >
        <div className="flex-1">
          <Field id="tracking-ref" label="Order reference">
            <TextInput
              id="tracking-ref"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="MN-10241"
            />
          </Field>
        </div>
        <Button type="submit" size="md">
          <PackageSearch className="size-4" /> Track
        </Button>
      </form>

      <div className="mt-10 max-w-3xl">
        {!active ? (
          <EmptyState
            title="Nothing to track yet"
            description="Paste an order reference above to see live kitchen and delivery status."
          />
        ) : query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
        ) : query.isError || !order ? (
          <ErrorState
            title="Order not found"
            description="Double-check the reference, or contact us and we'll find it."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Reference</p>
                <p className="font-display text-2xl font-semibold">{order.code}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Placed {formatDateTime(order.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                  order.orderStatus === "Cancelled"
                    ? "bg-destructive/10 text-destructive"
                    : statusBadgeColor[order.orderStatus]
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            {order.orderStatus === "Cancelled" ? (
              <p className="mt-8 rounded-2xl bg-destructive/8 p-5 text-sm text-muted-foreground">
                This order was cancelled. If that's unexpected, call {settings.phone}.
              </p>
            ) : order.orderStatus === "Completed" ? (
              <DeliveredCelebration />
            ) : (
              <ol className="mt-9 space-y-0">
                {ORDER_STATUS_FLOW.map((status, index) => {
                  const done = index <= currentIndex;
                  const isLast = index === ORDER_STATUS_FLOW.length - 1;
                  return (
                    <li key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
                            done
                              ? "border-transparent bg-amber-gradient text-accent-foreground"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
                        </span>
                        {!isLast ? (
                          <span
                            className={`w-0.5 flex-1 ${index < currentIndex ? "bg-accent" : "bg-border"}`}
                          />
                        ) : null}
                      </div>
                      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                        <p className={`text-sm font-semibold ${done ? "" : "text-muted-foreground"}`}>
                          {status}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {statusCopy[status]}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Delivering to</p>
                <p className="mt-1 text-sm">{order.customerDetails.address}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {formatCurrency(order.totalAmount, settings.currency)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
                  <Truck className="size-3.5" />
                  {order.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const statusBadgeColor: Record<string, string> = {
  Pending: "bg-orange-500/10 text-orange-600",
  Confirmed: "bg-blue-500/10 text-blue-600",
  Preparing: "bg-amber-500/10 text-amber-600",
  Ready: "bg-green-500/10 text-green-600",
  "Out for Delivery": "bg-purple-500/10 text-purple-600",
  Completed: "bg-emerald-700/10 text-emerald-700",
};

const CONFETTI_COLORS = [
  "bg-amber-400/90",
  "bg-emerald-500/90",
  "bg-orange-400/90",
  "bg-purple-400/90",
  "bg-rose-300/90",
  "bg-success",
];

// Deterministic particle field (module-level, so the burst is stable across re-renders).
const CONFETTI_PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 2 ? 0.35 : -0.25);
  const radius = 76 + ((i * 37) % 44);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    rotation: (i * 53) % 160 - 80,
    delay: 0.12 + ((i * 13) % 11) * 0.05,
    size: 4 + ((i * 7) % 5),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 !== 0,
  };
});

function DeliveredCelebration() {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <div className="relative flex size-24 items-center justify-center">
        {[0, 1].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border-2 border-success/30"
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 2.4,
              delay: ring * 0.9,
              repeat: Infinity,
              repeatDelay: 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
          className="relative flex size-20 items-center justify-center rounded-full bg-success/12 text-success shadow-glow"
        >
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
          >
            <PackageCheck className="size-10" strokeWidth={1.75} />
          </motion.span>
        </motion.span>

        {CONFETTI_PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className={`absolute left-1/2 top-1/2 ${
              particle.round ? "rounded-full" : "rounded-[2px]"
            } ${particle.color}`}
            style={{
              width: particle.size,
              height: particle.round ? particle.size : particle.size * 1.6,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: [0, 1, 1, 0],
              scale: 1,
              rotate: particle.rotation,
            }}
            transition={{
              duration: 1.4,
              delay: 0.25 + particle.delay,
              repeat: 3,
              repeatDelay: 2.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.h2
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
        className="mt-8 font-display text-3xl font-semibold"
      >
        Order Delivered!
      </motion.h2>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        className="mt-3 max-w-md text-muted-foreground"
      >
        Your order has been delivered successfully.
      </motion.p>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
        className="mt-2 font-display text-lg italic text-amber-700/80"
      >
        Thank you for ordering from Ilaah Rooh Café.
      </motion.p>
    </div>
  );
}
const statusCopy: Record<string, string> = {
  Pending: "We've received your order.",
  Confirmed: "The kitchen has accepted your ticket.",
  Preparing: "Your food is being made to order.",
  Ready: "Packed and waiting for the rider.",
  "Out for Delivery": "On the way to your address.",
  Completed: "Delivered. We hope it was good.",
};
