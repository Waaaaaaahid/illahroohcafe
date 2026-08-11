import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CartItem } from "@/components/CartItem/CartItem";
import { EmptyState } from "@/components/Loading/Loading";
import { Button } from "@/components/ui/AppButton";
import { useCart } from "@/context/CartContext";
import { useCafe } from "@/context/CafeContext";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Maison Noir" },
      { name: "description", content: "Review your Maison Noir order, adjust quantities and continue to checkout." },
      { property: "og:title", content: "Your Maison Noir cart" },
      { property: "og:description", content: "Review your order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, tax, deliveryFee, total, clearCart } = useCart();
  const { settings } = useCafe();

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl font-semibold">Your cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved on this device until you check out.
      </p>

      {lines.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            description="Browse the menu and add something worth waiting for."
            action={
              <Link to="/menu">
                <Button>
                  <ShoppingBag className="size-4" /> Browse the menu
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <CartItem key={line.itemId} line={line} />
              ))}
            </AnimatePresence>
          </ul>

          <aside className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal, settings.currency)} />
              <SummaryRow
                label={`Tax (${settings.taxPercentage}%)`}
                value={formatCurrency(tax, settings.currency)}
              />
              <SummaryRow
                label="Delivery fee"
                value={deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee, settings.currency)}
              />
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatCurrency(total, settings.currency)}</dd>
              </div>
            </dl>
            {deliveryFee > 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Free delivery on orders above {formatCurrency(1000, settings.currency)}.
              </p>
            ) : null}
            <Link to="/checkout" className="mt-6 block">
              <Button variant="accent" size="lg" className="w-full">
                Checkout <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Button variant="ghost" className="mt-3 w-full" onClick={clearCart}>
              Clear cart
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
