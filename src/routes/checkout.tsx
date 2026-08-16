import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Banknote, CreditCard, Lock, MapPin, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { EmptyState } from "@/components/Loading/Loading";
import { useCart } from "@/context/CartContext";
import { useCafe } from "@/context/CafeContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orderService } from "@/services/orderService";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/format";
import { validateCheckout, type CheckoutForm, type FieldErrors } from "@/utils/validators";
import { STORAGE_KEYS } from "@/constants";
import type { PaymentMethod } from "@/lib/types";

type SavedAddress = { _id?: string; label: string; address: string };
type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ilarooh" }, { name: "description", content: "Enter your delivery details and choose cash or secure online payment." }] }),
  component: CheckoutPage,
});

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const { lines, subtotal, tax, deliveryFee, total, clearCart } = useCart();
  const { settings } = useCafe();
  const { user, isReady } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("Home");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [form, setForm] = useState<CheckoutForm & { notes: string }>({ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "", address: "", notes: "" });
  const [errors, setErrors] = useState<FieldErrors<CheckoutForm>>({});
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user && lines.length > 0) {
      notify("Please sign in to place your order", { variant: "info" });
      void navigate({ to: "/login" });
    }
  }, [isReady, user, lines.length, notify, navigate]);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({ ...current, name: current.name || user.name, phone: current.phone || user.phone || "", email: current.email || user.email }));
    void api.get<{ savedAddresses?: SavedAddress[] }>("/users/profile").then((profile) => {
      const saved = profile.savedAddresses ?? [];
      setAddresses(saved);
      if (saved.length > 0) {
        setSelectedAddress(String(saved[0]._id));
        setForm((current) => ({ ...current, address: saved[0].address }));
      }
    }).catch(() => undefined);
  }, [user]);

  const selectAddress = (entry: SavedAddress) => {
    setSelectedAddress(String(entry._id));
    setShowNewAddress(false);
    setForm((current) => ({ ...current, address: entry.address }));
    setErrors((current) => ({ ...current, address: undefined }));
  };

  const removeAddress = async (id: string) => {
    const next = addresses.filter((entry) => String(entry._id) !== id);
    try {
      const profile = await api.put<{ savedAddresses?: SavedAddress[] }>("/users/profile", { savedAddresses: next });
      const saved = profile.savedAddresses ?? next;
      setAddresses(saved);
      if (selectedAddress === id) {
        if (saved[0]) selectAddress(saved[0]);
        else { setSelectedAddress(null); setForm((current) => ({ ...current, address: "" })); }
      }
      notify("Address removed", { variant: "success" });
    } catch { notify("Could not remove address", { variant: "error" }); }
  };

  const finishOrder = async (orderId: string, orderCode: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEYS.lastOrder, orderId);
    clearCart();
    notify("Order placed successfully", { description: `Reference ${orderCode}`, variant: "success" });
    await navigate({ to: "/order-success", search: { orderId } });
  };

  const payOnline = async (orderId: string, orderCode: string) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) throw new Error("Razorpay checkout could not be loaded. Please try again.");

    const paymentOrder = await api.post<{
      razorpayKeyId: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
    }>("/payment/create-order", { orderId });

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (fn: () => void) => { if (settled) return; settled = true; fn(); };
      const razorpay = new window.Razorpay!({
        key: paymentOrder.razorpayKeyId,
        amount: Math.round(paymentOrder.amount * 100),
        currency: paymentOrder.currency,
        name: settings.name || "Ilarooh",
        description: `Order ${orderCode}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#b7791f" },
        handler: async (response) => {
          try {
            await api.post("/payment/verify", response);
            finish(resolve);
          } catch (error) {
            finish(() => reject(error));
          }
        },
        modal: { ondismiss: () => finish(() => reject(new Error("Payment was cancelled. Your order is still pending."))) },
      });
      razorpay.open();
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCheckout(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { notify("Please complete your delivery details", { variant: "error" }); return; }
    if (!user) return;
    setPlacing(true);
    try {
      const order = await orderService.create({
        customerDetails: { name: form.name, phone: form.phone, email: form.email, address: form.address, notes: form.notes },
        items: lines.map((line) => ({ item: line.itemId, name: line.name, price: line.price, quantity: line.quantity })),
        subtotal, tax, deliveryFee, totalAmount: total, paymentMethod: method,
      });

      const duplicate = addresses.some((entry) => entry.address.trim().toLowerCase() === form.address.trim().toLowerCase());
      if (!duplicate) {
        try {
          const profile = await api.put<{ savedAddresses?: SavedAddress[] }>("/users/profile", { savedAddresses: [{ label: newLabel.trim() || "Home", address: form.address.trim() }, ...addresses] });
          setAddresses(profile.savedAddresses ?? [{ label: newLabel.trim() || "Home", address: form.address.trim() }, ...addresses]);
        } catch { /* Order is already placed; address saving must not block success. */ }
      }

      if (method === "online") {
        await payOnline(order._id, order.code);
      }
      await finishOrder(order._id, order.code);
    } catch (error) {
      notify(method === "online" ? "Payment could not be completed" : "We couldn't place your order", { description: error instanceof Error ? error.message : "Please try again.", variant: "error" });
    } finally { setPlacing(false); }
  };

  if (lines.length === 0) return <div className="container-page py-20"><EmptyState title="Nothing to check out" description="Add a few things to your cart first." action={<Link to="/menu"><Button><ShoppingBag className="size-4" /> Browse the menu</Button></Link>} /></div>;
  if (!isReady || !user) return <div className="container-page py-20"><EmptyState title="Sign in to place your order" description="Please sign in or register before continuing to checkout." action={<Link to="/login"><Button>Sign in</Button></Link>} /></div>;

  return <div className="container-page py-14">
    <h1 className="font-display text-4xl font-semibold">Checkout</h1>
    <p className="mt-2 text-sm text-muted-foreground"><Lock className="mr-1 inline size-3.5" /> Your details are only used for this delivery.</p>
    <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-xl font-semibold">Delivery address</h2><p className="mt-1 text-xs text-muted-foreground">Your address is saved after your first successful order.</p></div><MapPin className="size-5 text-accent" /></div>
          {addresses.length > 0 && !showNewAddress ? <div className="mt-6 space-y-3">{addresses.map((entry) => <div key={String(entry._id)} className={`flex items-center gap-3 rounded-2xl border p-4 transition ${selectedAddress === String(entry._id) ? "border-accent bg-accent/5" : "border-border"}`}><button type="button" onClick={() => selectAddress(entry)} className="min-w-0 flex-1 text-left"><span className="block text-sm font-semibold">{entry.label}</span><span className="mt-1 block text-sm text-muted-foreground">{entry.address}</span></button><button type="button" onClick={() => void removeAddress(String(entry._id))} aria-label={`Delete ${entry.label} address`} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button></div>)}<Button type="button" variant="outline" size="sm" onClick={() => { setShowNewAddress(true); setSelectedAddress(null); setForm((current) => ({ ...current, address: "" })); }}><Plus className="size-4" /> Add new address</Button></div> : <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id="co-label" label="Address label"><TextInput id="co-label" value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="Home, Work…" /></Field><div className="hidden sm:block" /><div className="sm:col-span-2"><Field id="co-address" label="Delivery address" error={errors.address}><TextArea id="co-address" value={form.address} invalid={Boolean(errors.address)} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Flat, building, street, landmark, pin code" /></Field></div>{addresses.length > 0 && <Button type="button" variant="outline" size="sm" onClick={() => { setShowNewAddress(false); selectAddress(addresses[0]); }}>Use saved address</Button>}</div>}
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"><h2 className="font-display text-xl font-semibold">Contact details</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id="co-name" label="Full name" error={errors.name}><TextInput id="co-name" value={form.name} invalid={Boolean(errors.name)} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field id="co-phone" label="Phone" error={errors.phone}><TextInput id="co-phone" type="tel" value={form.phone} invalid={Boolean(errors.phone)} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field><div className="sm:col-span-2"><Field id="co-email" label="Email" error={errors.email}><TextInput id="co-email" type="email" value={form.email} invalid={Boolean(errors.email)} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field></div><div className="sm:col-span-2"><Field id="co-notes" label="Notes for the kitchen" hint="Optional"><TextInput id="co-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Less spice, extra napkins…" /></Field></div></div></section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"><h2 className="font-display text-xl font-semibold">Payment method</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><PaymentOption active={method === "cod"} onSelect={() => setMethod("cod")} icon={Banknote} title="Cash on delivery" description="Pay the rider when your order arrives." /><PaymentOption active={method === "online"} onSelect={() => setMethod("online")} icon={CreditCard} title="Online payment" description="Pay securely with card, UPI or wallet via Razorpay." /></div></section>
      </div>
      <aside className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24"><h2 className="font-display text-xl font-semibold">Order summary</h2><ul className="mt-5 space-y-3">{lines.map((line) => <li key={line.itemId} className="flex justify-between gap-3 text-sm"><span><span className="block truncate font-medium">{line.name}</span><span className="text-xs text-muted-foreground">× {line.quantity}</span></span><span className="font-medium">{formatCurrency(line.price * line.quantity, settings.currency)}</span></li>)}</ul><dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm"><Row label="Subtotal" value={formatCurrency(subtotal, settings.currency)} /><Row label={`Tax (${settings.taxPercentage}%)`} value={formatCurrency(tax, settings.currency)} /><Row label="Delivery" value={deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee, settings.currency)} /><div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatCurrency(total, settings.currency)}</dd></div></dl><Button type="submit" variant="accent" size="lg" loading={placing} className="mt-6 w-full">{method === "online" ? "Pay securely & place order" : "Place order"}</Button></aside>
    </form>
  </div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between text-muted-foreground"><dt>{label}</dt><dd className="font-medium text-foreground">{value}</dd></div>; }
function PaymentOption({ active, onSelect, icon: Icon, title, description }: { active: boolean; onSelect: () => void; icon: typeof Banknote; title: string; description: string }) { return <button type="button" onClick={onSelect} aria-pressed={active} className={`flex w-full gap-4 rounded-2xl border p-5 text-left transition-all ${active ? "border-accent bg-accent/8 shadow-soft" : "border-border hover:border-accent/50"}`}><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-amber-gradient text-accent-foreground" : "bg-secondary text-muted-foreground"}`}><Icon className="size-4.5" /></span><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span></button>; }
