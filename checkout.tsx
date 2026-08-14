import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Banknote, CreditCard, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { EmptyState } from "@/components/Loading/Loading";
import { useCart } from "@/context/CartContext";
import { useCafe } from "@/context/CafeContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orderService } from "@/services/orderService";
import { paymentService, RAZORPAY_KEY_ID } from "@/services/paymentService";
import { formatCurrency } from "@/utils/format";
import { validateCheckout, type CheckoutForm, type FieldErrors } from "@/utils/validators";
import { STORAGE_KEYS } from "@/constants";
import type { Order, PaymentMethod } from "@/lib/types";

const SAVED_ADDRESS_KEY = "ilarooh_saved_delivery_address";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ilarooh" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, tax, deliveryFee, total, clearCart } = useCart();
  const { settings } = useCafe();
  const { user, isReady } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [savedAddress, setSavedAddress] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(SAVED_ADDRESS_KEY) ?? "";
  });
  const [form, setForm] = useState<CheckoutForm & { notes: string }>(() => ({ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "", address: savedAddressValue(), notes: "" }));
  const [errors, setErrors] = useState<FieldErrors<CheckoutForm>>({});
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  useEffect(() => {
    if (isReady && !user && lines.length > 0) { notify("Please sign in to place your order", { variant: "info" }); void navigate({ to: "/login" }); }
  }, [isReady, user, lines.length, notify, navigate]);

  useEffect(() => {
    if (user) {
      setForm((current) => ({ ...current, name: current.name || user.name, phone: current.phone || user.phone, email: current.email || user.email }));
    }
  }, [user]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCheckout(form); setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) { notify("Please complete your delivery details", { variant: "error" }); return; }
    if (method === "online" && !RAZORPAY_KEY_ID) { notify("Online payment is not configured", { description: "Add the Razorpay test key to the frontend environment.", variant: "error" }); return; }
    setPlacing(true);
    try {
      const order = await orderService.create({ customerDetails: { name: form.name, phone: form.phone, email: form.email, address: form.address, notes: form.notes }, items: lines.map((line) => ({ item: line.itemId, name: line.name, price: line.price, quantity: line.quantity })), subtotal, tax, deliveryFee, totalAmount: total, paymentMethod: method });
      if (method === "online") {
        const paid = await runRazorpayCheckout(order);
        if (!paid) { notify("Online payment was not completed", { description: "Please complete the Razorpay test payment or choose Cash on Delivery.", variant: "error" }); setPlacing(false); return; }
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.lastOrder, order._id);
        if (form.address.trim()) window.localStorage.setItem(SAVED_ADDRESS_KEY, form.address.trim());
      }
      if (form.address.trim()) setSavedAddress(form.address.trim());
      clearCart(); notify("Order placed successfully", { description: `Reference ${order.code}`, variant: "success" });
      await navigate({ to: "/order-success", search: { orderId: order._id } });
    } catch (error) { notify("We couldn't place your order", { description: error instanceof Error ? error.message : "Please try again.", variant: "error" }); }
    finally { setPlacing(false); }
  };

  const useSavedAddress = () => {
    if (!savedAddress) return;
    setForm((current) => ({ ...current, address: savedAddress }));
    setEditingAddress(false);
    setErrors((current) => ({ ...current, address: undefined }));
  };

  if (lines.length === 0) return <div className="container-page py-20"><EmptyState title="Nothing to check out" description="Add a few things to your cart first." action={<Link to="/menu"><Button><ShoppingBag className="size-4" /> Browse the menu</Button></Link>} /></div>;
  if (!isReady || !user) return <div className="container-page py-20"><EmptyState title="Sign in to place your order" description="Please sign in or register before continuing to checkout." action={<Link to="/login"><Button>Sign in</Button></Link>} /></div>;

  return <div className="container-page py-14">
    <h1 className="font-display text-4xl font-semibold">Checkout</h1>
    <p className="mt-2 text-sm text-muted-foreground"><Lock className="mr-1 inline size-3.5" /> Your details are only used for this delivery.</p>
    <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"><h2 className="font-display text-xl font-semibold">Delivery details</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id="co-name" label="Full name" error={errors.name}><TextInput id="co-name" value={form.name} invalid={Boolean(errors.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field id="co-phone" label="Phone" error={errors.phone}><TextInput id="co-phone" type="tel" value={form.phone} invalid={Boolean(errors.phone)} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field id="co-email" label="Email" error={errors.email}><TextInput id="co-email" type="email" value={form.email} invalid={Boolean(errors.email)} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div>
          <div className="sm:col-span-2">
            {savedAddress && !editingAddress ? <div className="space-y-3"><div className="rounded-2xl border border-accent/40 bg-accent/5 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Home</p><p className="mt-2 text-sm leading-6">{savedAddress}</p></div><button type="button" className="text-xs font-semibold text-accent hover:underline" onClick={() => setEditingAddress(true)}>Change</button></div></div><button type="button" className="text-sm font-semibold text-accent hover:underline" onClick={useSavedAddress}>Use saved address</button></div> : <Field id="co-address" label="Delivery address" error={errors.address}><TextArea id="co-address" value={form.address} invalid={Boolean(errors.address)} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Flat, building, street, landmark, pin code" /></Field>}
          </div>
          <div className="sm:col-span-2"><Field id="co-notes" label="Notes for the kitchen" hint="Optional"><TextInput id="co-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Less spice, extra napkins…" /></Field></div>
        </div></section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"><h2 className="font-display text-xl font-semibold">Payment method</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PaymentOption active={method === "cod"} onSelect={() => setMethod("cod")} icon={Banknote} title="Cash on delivery" description="Pay the rider when your order arrives." />
          <PaymentOption active={method === "online"} onSelect={() => setMethod("online")} icon={CreditCard} title="Online payment" description="Card, UPI or wallet via Razorpay Test Mode." />
        </div></section>
      </div>
      <aside className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24"><h2 className="font-display text-xl font-semibold">Order summary</h2><ul className="mt-5 space-y-3">{lines.map((line) => <li key={line.itemId} className="flex justify-between gap-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium">{line.name}</span><span className="text-xs text-muted-foreground">× {line.quantity}</span></span><span className="font-medium">{formatCurrency(line.price * line.quantity, settings.currency)}</span></li>)}</ul><dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm"><Row label="Subtotal" value={formatCurrency(subtotal, settings.currency)} /><Row label={`Tax (${settings.taxPercentage}%)`} value={formatCurrency(tax, settings.currency)} /><Row label="Delivery" value={deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee, settings.currency)} /><div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatCurrency(total, settings.currency)}</dd></div></dl><Button type="submit" variant="accent" size="lg" loading={placing} className="mt-6 w-full">{method === "online" ? "Pay & place order" : "Place order"}</Button></aside>
    </form>
  </div>;
}

function savedAddressValue() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SAVED_ADDRESS_KEY) ?? "";
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between text-muted-foreground"><dt>{label}</dt><dd className="font-medium text-foreground">{value}</dd></div>; }
function PaymentOption({ active, onSelect, icon: Icon, title, description }: { active: boolean; onSelect: () => void; icon: typeof Banknote; title: string; description: string }) { return <button type="button" onClick={onSelect} aria-pressed={active} className={`relative flex gap-4 rounded-2xl border p-5 text-left transition-all ${active ? "border-accent bg-accent/8 shadow-soft" : "border-border hover:border-accent/50"}`}><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-amber-gradient text-accent-foreground" : "bg-secondary text-muted-foreground"}`}><Icon className="size-4.5" /></span><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span></button>; }

async function runRazorpayCheckout(order: Order): Promise<boolean> { if (!RAZORPAY_KEY_ID) return false; const result = await openRazorpayCheckout(order); if (!result) return false; const verified = await paymentService.verify({ razorpayOrderId: result.razorpayOrderId, razorpayPaymentId: result.response.razorpay_payment_id, razorpaySignature: result.response.razorpay_signature }); return Boolean(verified?.verified); }
interface RazorpayPaymentResponse { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }
interface RazorpayCheckout { open: () => void; on: (event: string, callback: (response: RazorpayPaymentResponse) => void) => void; }
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout; } }
async function openRazorpayCheckout(order: Order): Promise<{ razorpayOrderId: string; response: RazorpayPaymentResponse } | null> { if (typeof window === "undefined") return null; if (!window.Razorpay) { try { await new Promise<void>((resolve, reject) => { const existing = document.querySelector('script[src*="checkout.razorpay.com"]'); if (existing) { existing.addEventListener("load", () => resolve()); existing.addEventListener("error", () => reject(new Error("Could not load the payment gateway"))); return; } const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load the payment gateway")); document.head.appendChild(script); }); } catch { return null; } } let razorpayOrderId: string; let amount: number; try { const created = await paymentService.createRazorpayOrder({ orderId: order._id, amount: order.totalAmount }); razorpayOrderId = created.razorpayOrderId; amount = created.amount; } catch { return null; } const response = await new Promise<RazorpayPaymentResponse | null>((resolve) => { const checkout = new window.Razorpay!({ key: RAZORPAY_KEY_ID, amount: Math.round(amount * 100), currency: "INR", name: "Ilarooh", description: `Order ${order.code}`, order_id: razorpayOrderId, handler: (value: RazorpayPaymentResponse) => resolve(value), modal: { ondismiss: () => resolve(null) }, theme: { color: "#B4531F" } }); checkout.on("payment.failed", () => resolve(null)); checkout.open(); }); if (!response) return null; return { razorpayOrderId, response }; }
