import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClipboardList, IndianRupee, ShoppingBag, UsersRound, UtensilsCrossed } from "lucide-react";
import { orderService } from "@/services/orderService";
import { menuService } from "@/services/menuService";
import { adminService } from "@/services/adminService";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusPill } from "@/components/admin/StatusPill";
import { ErrorState, Skeleton, TableSkeleton } from "@/components/Loading/Loading";
import { ORDER_STATUSES, type Order } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ilarooh Admin" },
      { name: "description", content: "Overview of orders, revenue and menu performance." },
      { property: "og:title", content: "Dashboard — Ilarooh Admin" },
      { property: "og:description", content: "Overview of orders, revenue and menu performance." },
    ],
  }),
  component: AdminDashboard,
});

function isToday(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isSameDay(dateString: string, day: Date) {
  const date = new Date(dateString);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

/** A sale counts toward revenue unless cancelled or the payment failed/refunded. */
function isSaleRevenue(order: Order) {
  if (order.orderStatus === "Cancelled") return false;
  if (order.paymentStatus === "paid") return true;
  return (
    order.paymentMethod === "cod" &&
    order.paymentStatus !== "failed" &&
    order.paymentStatus !== "refunded"
  );
}

/** Paid + COD revenue per day for the last 7 days, computed from real orders. */
function buildRevenueSeries(orders: Order[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    return day;
  });

  return days.map((day) => ({
    label: day.toLocaleDateString(undefined, { weekday: "short" }),
    revenue: orders
      .filter((order) => isSaleRevenue(order) && isSameDay(order.createdAt, day))
      .reduce((sum, order) => sum + order.totalAmount, 0),
  }));
}

/** Compact currency for axis ticks, e.g. ₹0, ₹420, ₹2.3k. */
function formatAxisCurrency(value: number) {
  if (value >= 1000) {
    const compact = value % 1000 === 0 ? value / 1000 : (value / 1000).toFixed(1);
    return `₹${compact}k`;
  }
  return formatCurrency(value);
}

function AdminDashboard() {
  const ordersQuery = useQuery({ queryKey: ["admin-orders"], queryFn: orderService.listAll });
  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.getStats });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: adminService.listUsers });
  const menuQuery = useQuery({ queryKey: ["admin-menu"], queryFn: menuService.list });

  const isLoading = ordersQuery.isLoading || usersQuery.isLoading || menuQuery.isLoading;
  const isError = ordersQuery.isError || usersQuery.isError || menuQuery.isError;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load dashboard"
        description="There was a problem fetching the admin data."
        onRetry={() => {
          void ordersQuery.refetch();
          void usersQuery.refetch();
          void menuQuery.refetch();
        }}
      />
    );
  }

  const orders = ordersQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const menuItems = menuQuery.data ?? [];

  const todayOrders = orders.filter((order) => isToday(order.createdAt));
  const totalRevenue = orders.filter(isSaleRevenue).reduce((sum, order) => sum + order.totalAmount, 0);

  const statusBreakdown = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.orderStatus === status).length,
  })).filter((entry) => entry.count > 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Paid revenue per day for the last 7 days, from the backend stats endpoint.
  // Falls back to the orders list (equally real data) if the stats call fails.
  const revenueSeries = statsQuery.data?.revenueSeries ?? buildRevenueSeries(orders);
  const maxRevenue = Math.max(...revenueSeries.map((entry) => entry.revenue), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-accent">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of how Ilarooh is performing right now.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={String(orders.length)} icon={ClipboardList} />
        <StatCard label="Today's Orders" value={String(todayOrders.length)} icon={ShoppingBag} accent />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={IndianRupee} />
        <StatCard label="Total Users" value={String(users.length)} icon={UsersRound} />
        <StatCard label="Menu Items" value={String(menuItems.length)} icon={UtensilsCrossed} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft xl:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Weekly revenue</h2>
          <p className="text-xs text-muted-foreground">Paid revenue over the last 7 days</p>
          <div className="mt-4 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={14}
                  tickMargin={8}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={78}
                  domain={[0, Math.max(maxRevenue, 1)]}
                  allowDecimals={false}
                  tickMargin={6}
                  tickFormatter={(value: number) => formatAxisCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground">Orders by status</h2>
          <div className="mt-4 space-y-3">
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              statusBreakdown.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between gap-3">
                  <OrderStatusPill status={entry.status} />
                  <span className="text-sm font-semibold text-foreground">{entry.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-accent hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Placed</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-t border-border">
                    <td className="py-3 font-semibold text-foreground">{order.code}</td>
                    <td className="py-3 text-muted-foreground">{order.customerDetails.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                    <td className="py-3 font-medium text-foreground">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3">
                      <OrderStatusPill status={order.orderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
