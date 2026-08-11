import { useMemo, useState } from "react";
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
      { title: "Orders — Maison Noir Admin" },
      { name: "description", content: "Track and update every order placed at Maison Noir." },
      { property: "og:title", content: "Orders — Maison Noir Admin" },
      { property: "og:description", content: "Track and update every order placed at Maison Noir." },
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
      <p className="mt-2 text-xs text-muted-foreground">
        {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
      </p>
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
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const ordersQuery = useQuery({ queryKey: ["admin-orders"], queryFn: orderService.listAll });

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
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Placed</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0 align-top">
                    <td className="px-5 py-3 font-semibold text-foreground">{order.code}</td>
                    <td className="px-5 py-3 text-muted-foreground">{order.customerDetails.name}</td>
                    <td className="max-w-xs px-5 py-3 text-muted-foreground">
                      {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
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
