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
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-whatsapp-enquiry]")) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClickOutside);
    };
  }, [open]);

  const contacts = [
    { title: "Sales & Enquiries", description: "Products, pricing & new orders", number: settings.whatsappSalesNumber || settings.whatsappNumber || settings.phone, message: `Hi ${settings.name || "Zrcart"}, I have a sales enquiry.`, Icon: ShoppingBag },
    { title: "Customer Support", description: "Existing orders & assistance", number: settings.whatsappSupportNumber, message: `Hi ${settings.name || "Zrcart"}, I need customer support.`, Icon: Headset },
  ];
  const openChat = (number: string, message: string) => {
    const digits = number.replace(/\D/g, "");
    if (!digits) return;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return <div data-whatsapp-enquiry className="fixed bottom-24 left-3 z-[60] sm:bottom-8 sm:left-5">
    <AnimatePresence>
      {open && <motion.div
        initial={{ opacity: 0, x: -18, scale: .98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -12, scale: .98 }}
        transition={{ duration: .24, ease: "easeOut" }}
        className="absolute bottom-0 left-[calc(100%+14px)] flex w-[min( calc(100vw-100px), 350px)] min-w-[260px] flex-col gap-3"
        style={{ width: "min(350px, calc(100vw - 92px))" }}
      >
        {contacts.map(({ title, description, number, message, Icon }, index) => {
          const available = Boolean(number?.replace(/\D/g, ""));
          return <motion.button key={title} type="button" disabled={!available}
            onClick={() => openChat(number || "", message)}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .05 + index * .08, duration: .25 }}
            className="group flex w-full items-center gap-3 rounded-full border border-white/80 bg-white px-4 py-3.5 text-left shadow-[0_8px_30px_rgba(0,0,0,.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(0,0,0,.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf7ef] text-[#078447]"><Icon className="h-5 w-5" strokeWidth={2.2} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#22251f]">{title}</span>
              <span className="mt-0.5 block text-[11px] leading-4 text-[#777b73]">{available ? description : "Set this number in Admin Settings"}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#078447] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.button>;
        })}
      </motion.div>}
    </AnimatePresence>
    <button type="button" onClick={() => setOpen((value) => !value)}
      aria-label={open ? "Close WhatsApp contacts" : "Open WhatsApp contacts"}
      aria-expanded={open}
      className="flex h-[58px] items-center gap-2.5 rounded-full bg-[#00c853] px-4 text-white shadow-[0_8px_28px_rgba(0,200,83,.35)] transition duration-200 hover:scale-[1.04] hover:bg-[#00b84a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] focus-visible:ring-offset-2"
    >
      {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      <span className="text-sm font-semibold">WhatsApp Enquiry</span>
    </button>
  </div>;
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
