import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/AppButton";
import { CartItem } from "@/components/CartItem/CartItem";
import { useCart } from "@/context/CartContext";
import { useCafe } from "@/context/CafeContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/utils/format";

export function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, discount, couponCode, couponError, tax, deliveryFee, total, applyCoupon, removeCoupon, clearCart } = useCart();
  const { settings } = useCafe();
  const { user } = useAuth();
  const { notify } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const handleCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    if (!user) { notify("Sign in to apply coupons", { variant: "info" }); return; }
    setApplying(true);
    const ok = await applyCoupon(code);
    setApplying(false);
    if (ok) notify("Coupon applied", { variant: "success" });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[95]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="absolute inset-0 bg-foreground/45 backdrop-blur-sm" />
          <motion.aside role="dialog" aria-label="Shopping cart" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-lift">
            <header className="flex items-center justify-between border-b border-border px-6 py-5">
              <div><h2 className="font-display text-2xl">Your order</h2><p className="text-xs text-muted-foreground">{lines.length === 0 ? "Nothing here yet" : `${lines.length} item(s)`}</p></div>
              <button type="button" onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><X className="size-5" /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {lines.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBag className="size-10 text-muted-foreground" aria-hidden /><p className="mt-4 font-semibold">Your cart is empty</p><p className="mt-1 text-sm text-muted-foreground">Add something warm from the menu.</p><Link to="/menu" onClick={closeCart} className="mt-6"><Button>Browse the menu</Button></Link></div> : <ul className="space-y-3"><AnimatePresence initial={false}>{lines.map((line) => <CartItem key={line.itemId} line={line} />)}</AnimatePresence></ul>}
            </div>
            {lines.length > 0 ? <footer className="space-y-4 border-t border-border px-6 py-5">
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="flex gap-2">
                  <div className="relative flex-1"><Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") void handleCoupon(); }} placeholder="Coupon code" className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent" /></div>
                  <Button variant="outline" size="sm" loading={applying} onClick={() => void handleCoupon()}>Apply</Button>
                </div>
                {couponCode ? <div className="mt-2 flex items-center justify-between text-xs text-success"><span><strong>{couponCode}</strong> applied · save {formatCurrency(discount, settings.currency)}</span><button type="button" onClick={removeCoupon} className="font-semibold underline">Remove</button></div> : null}
                {couponError ? <p className="mt-2 text-xs text-destructive">{couponError}</p> : null}
              </div>
              <dl className="space-y-1.5 text-sm"><Row label="Subtotal" value={formatCurrency(subtotal, settings.currency)} />{discount > 0 ? <Row label="Discount" value={`−${formatCurrency(discount, settings.currency)}`} /> : null}<Row label={`Tax (${settings.taxPercentage}%)`} value={formatCurrency(tax, settings.currency)} /><Row label="Delivery" value={deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee, settings.currency)} /><div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatCurrency(total, settings.currency)}</dd></div></dl>
              <div className="flex gap-3"><Button variant="outline" size="md" onClick={clearCart} className="flex-1">Clear</Button><Link to="/checkout" onClick={closeCart} className="flex-[2]"><Button variant="accent" size="md" className="w-full">Checkout</Button></Link></div>
            </footer> : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between text-muted-foreground"><dt>{label}</dt><dd className="font-medium text-foreground">{value}</dd></div>; }
