import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { PaymentStatusPill } from "@/components/admin/StatusPill";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/Loading/Loading";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Ilarooh Admin" },
      { name: "description", content: "Review the payment ledger for Ilarooh orders." },
      { property: "og:title", content: "Payments — Ilarooh Admin" },
      { property: "og:description", content: "Review the payment ledger for Ilarooh orders." },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const paymentsQuery = useQuery({ queryKey: ["admin-payments"], queryFn: paymentService.list });
  const payments = paymentsQuery.data ?? [];
  const total = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-accent">Finance</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Payments</h1>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <p>Razorpay is not yet connected. This ledger currently reflects mock/local payment records only.</p>
      </div>

      {paymentsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : paymentsQuery.isError ? (
        <ErrorState onRetry={() => void paymentsQuery.refetch()} />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Payments will appear here once orders are placed." />
      ) : (
        <>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total collected</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(total)}</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Payment ID</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Method</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {payment.razorpayPaymentId ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{payment.order}</td>
                    <td className="px-5 py-3 uppercase text-muted-foreground">{payment.paymentMethod}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{formatCurrency(payment.amount)}</td>
                    <td className="px-5 py-3">
                      <PaymentStatusPill status={payment.status} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(payment.createdAt)}</td>
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
