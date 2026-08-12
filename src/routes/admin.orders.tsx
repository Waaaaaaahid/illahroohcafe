import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/Loading/Loading";
import { OrderStatusPill } from "@/components/admin/StatusPill";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Ilarooh Admin" },
      { name: "description", content: "Track and update every order placed at Ilarooh." },
      { property: "og:title", content: "Orders — Ilarooh Admin" },
      { property: "og:description", content: "Track and update every order placed at Ilarooh." },
    ],
  }),
  component: AdminOrders,
});

function OrderCard({ order, onStatusChange, updating }: {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  updating: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{order.code}</p>
          <p className="text-xs text-muted-foreground">{order.customerDetails.name}</p>
        </div>
        <OrderStatusPill status={order.orderStatus} />
      </div>
      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between gap-3">
          <dt>Contact</dt>
          <dd className="text-right">
            {order.customerDetails.email} · {order.customerDetails.phone}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Delivery address</dt>
          <dd className="text-right">{order.customerDetails.address}</dd>
        </div>
        {order.customerDetails.notes ? (
          <div className="flex justify-between gap-3">
            <dt>Notes</dt>
            <dd className="text-right">{order.customerDetails.notes}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        {order.items.map((item) => `${item.quantity}× ${item.name} (${formatCurrency(item.price)})`).join(", ")}
      </p>
      <div className="mt-3 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery fee</span>
          <span>{formatCurrency(order.deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment</span>
          <span className="capitalize">
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <Select
          value={order.orderStatus}
          disabled={updating}
          onChange={(event) => onStatusChange(event.target.value as OrderStatus)}
          className="w-40"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: orderService.listAll,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (!ordersQuery.data) return;
    const currentCount = ordersQuery.data.length;
    if (prevOrderCount > 0 && currentCount > prevOrderCount) {
      notify(`New order received (${currentCount - prevOrderCount})`, { variant: "success" });
    }
    if (currentCount !== prevOrderCount) {
      setPrevOrderCount(currentCount);
    }
  }, [ordersQuery.data, prevOrderCount, notify]);

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: OrderStatus }) =>
      orderService.updateStatus(input.id, input.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      notify("Order status updated", { variant: "success" });
    },
    onError: () => notify("Couldn't update order status", { variant: "error" }),
  });

  const orders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    const filtered = statusFilter === "all" ? list : list.filter((order) => order.orderStatus === statusFilter);
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ordersQuery.data, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Orders</h1>
        </div>
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "all")}
          className="w-48"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      {ordersQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : ordersQuery.isError ? (
        <ErrorState onRetry={() => void ordersQuery.refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" description="No orders match this filter yet." />
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                updating={statusMutation.isPending}
                onStatusChange={(status) => statusMutation.mutate({ id: order._id, status })}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-border bg-card shadow-soft md:block">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Breakdown</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Placed</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0 align-top">
                    <td className="px-5 py-3 font-semibold text-foreground">{order.code}</td>
                    <td className="max-w-56 px-5 py-3 text-muted-foreground">
                      <p className="font-semibold text-foreground">{order.customerDetails.name}</p>
                      <p className="text-xs">{order.customerDetails.email}</p>
                      <p className="text-xs">{order.customerDetails.phone}</p>
                      <p className="text-xs">{order.customerDetails.address}</p>
                      {order.customerDetails.notes ? (
                        <p className="mt-1 text-xs italic">“{order.customerDetails.notes}”</p>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-5 py-3 text-muted-foreground">
                      <ul className="space-y-1">
                        {order.items.map((item) => (
                          <li key={`${order._id}-${item.item}`} className="flex justify-between gap-2 text-xs">
                            <span>
                              {item.quantity}× {item.name}
                            </span>
                            <span className="shrink-0 font-medium text-foreground">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      <dl className="space-y-1">
                        <div className="flex justify-between gap-3">
                          <dt>Subtotal</dt>
                          <dd>{formatCurrency(order.subtotal)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt>Tax</dt>
                          <dd>{formatCurrency(order.tax)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt>Delivery</dt>
                          <dd>{formatCurrency(order.deliveryFee)}</dd>
                        </div>
                      </dl>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
                        {order.paymentMethod}
                      </span>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          order.paymentStatus === "paid"
                            ? "bg-accent/15 text-accent"
                            : order.paymentStatus === "failed"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <Select
                        value={order.orderStatus}
                        disabled={statusMutation.isPending}
                        onChange={(event) =>
                          statusMutation.mutate({ id: order._id, status: event.target.value as OrderStatus })
                        }
                        className="w-44"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
