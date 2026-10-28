import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, ShoppingBag, Headset, ArrowUpRight } from "lucide-react";
import { useCafe } from "@/context/CafeContext";

import appCss from "../styles.css?url";
import { CafeProvider } from "@/context/CafeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastViewport } from "@/components/Toast/ToastViewport";
import { AdminLiveUpdates } from "@/components/AdminLiveUpdates/AdminLiveUpdates";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { CartDrawer } from "@/components/CartDrawer/CartDrawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">Go home</Link></div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { void error; }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent/10">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Online Store" },
      { name: "description", content: "Discover thoughtfully selected products for everyday living." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Karla:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/cafe-favicon.svg?v=3", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/cafe-favicon.svg?v=3" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function WhatsAppEnquiry() {
  const { settings } = useCafe();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const contacts = [
    { title: "Sales & Enquiries", description: "Product questions, pricing and new orders.", number: settings.whatsappSalesNumber || settings.whatsappNumber || settings.phone, message: `Hi ${settings.name || "Zrcart"}, I have a sales enquiry.`, Icon: ShoppingBag },
    { title: "Customer Support", description: "Help with existing orders and other issues.", number: settings.whatsappSupportNumber, message: `Hi ${settings.name || "Zrcart"}, I need customer support.`, Icon: Headset },
  ];
  const openChat = (number: string, message: string) => {
    const digits = number.replace(/\D/g, "");
    if (!digits) return;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Choose WhatsApp enquiry contact" aria-haspopup="dialog" aria-expanded={open}
      className="fixed bottom-24 left-3 z-[60] inline-flex items-center gap-2 rounded-xl bg-[#00c853] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.03] hover:bg-[#00b84a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] focus-visible:ring-offset-2 sm:bottom-8 sm:left-5">
      <MessageCircle className="h-5 w-5" /><span>WhatsApp Enquiry</span>
    </button>
    <AnimatePresence>
      {open && <>
        <motion.button type="button" aria-label="Close WhatsApp contact chooser" onClick={() => setOpen(false)} className="fixed inset-0 z-[70] cursor-default bg-black/40 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <div className="fixed inset-0 z-[71] flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="whatsapp-enquiry-title">
          <motion.div initial={{ opacity: 0, y: 22, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: .98 }} transition={{ duration: .22, ease: "easeOut" }} className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-[#fbfaf7] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#65745b]">We’re here to help</p><h2 id="whatsapp-enquiry-title" className="mt-1 font-display text-2xl font-semibold text-[#242521]">How can we help you?</h2><p className="mt-2 text-sm text-[#72736b]">Choose the right team to start your WhatsApp chat.</p></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#55574f] ring-1 ring-black/5 transition hover:bg-[#eeeee7]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 space-y-3">
              {contacts.map(({ title, description, number, message, Icon }, index) => {
                const available = Boolean(number?.replace(/\D/g, ""));
                return <motion.button key={title} type="button" disabled={!available} onClick={() => openChat(number || "", message)} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .07 + index * .1, duration: .28 }}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-[#e7e6de] bg-white p-4 text-left shadow-[0_4px_16px_rgba(30,32,26,.03)] transition hover:-translate-y-0.5 hover:border-[#b6c5a9] hover:shadow-[0_10px_28px_rgba(30,32,26,.08)] disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e8] text-[#4c6544]"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#282a24]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#77786f]">{description}</span>{!available && <span className="mt-1 block text-[10px] font-medium text-[#a05c48]">Contact not configured yet</span>}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8a8c82] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#4c6544]" />
                </motion.button>;
              })}
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#888980]"><MessageCircle className="h-3.5 w-3.5 text-[#25a75a]" /> Opens a private chat in WhatsApp</p>
          </motion.div>
        </div>
      </>}
    </AnimatePresence>
  </>;
}
function SiteChrome() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  return (
    <div className="flex min-h-screen flex-col">
      {isAdmin ? null : <Navbar />}
      <main className="flex-1"><Outlet /></main>
      {isAdmin ? null : <Footer />}
      {isAdmin ? null : <WhatsAppEnquiry />}
      <CartDrawer />
      <ToastViewport />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CafeProvider>
          <AuthProvider>
            <CartProvider>
              <AdminLiveUpdates />
              <SiteChrome />
            </CartProvider>
          </AuthProvider>
        </CafeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
