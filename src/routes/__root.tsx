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
    return () => { window.removeEventListener("keydown", onKeyDown); document.removeEventListener("click", onClickOutside); };
  }, [open]);

  const contacts = [
    { title: "Sales & Enquiries", number: settings.whatsappSalesNumber || settings.whatsappNumber || settings.phone, message: `Hi ${settings.name || "Zrcart"}, I have a sales enquiry.`, Icon: ShoppingBag },
    { title: "Customer Support", number: settings.whatsappSupportNumber, message: `Hi ${settings.name || "Zrcart"}, I need customer support.`, Icon: Headset },
  ];
  const openChat = (number: string, message: string) => {
    const digits = number.replace(/\D/g, "");
    if (!digits) return;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return <div data-whatsapp-enquiry className="fixed bottom-20 left-3 z-[60] sm:bottom-7 sm:left-5">
    <AnimatePresence>
      {open && <motion.div
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
        transition={{ duration: .2, ease: "easeOut" }}
        className="absolute bottom-0 left-[calc(100%+9px)] flex flex-col gap-2 sm:left-[calc(100%+14px)] sm:gap-3"
        style={{ width: "max-content", maxWidth: "calc(100vw - 82px)" }}
      >
        {contacts.map(({ title, number, message, Icon }, index) => {
          const available = Boolean(number?.replace(/\D/g, ""));
          return <motion.button key={title} type="button" disabled={!available}
            onClick={() => openChat(number || "", message)}
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .04 + index * .06, duration: .2 }}
            className="group flex min-h-11 w-full items-center gap-2 rounded-full border border-white/90 bg-white px-3 py-2 text-left shadow-[0_4px_16px_rgba(0,0,0,.15)] transition hover:shadow-[0_7px_20px_rgba(0,0,0,.18)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:gap-3 sm:px-4 sm:py-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf7ef] text-[#078447] sm:h-8 sm:w-8">
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.1} />
            </span>
            <span className="whitespace-nowrap text-[11px] font-semibold text-[#22251f] sm:text-sm">{title}</span>
            <ArrowUpRight className="ml-0.5 h-3 w-3 shrink-0 text-[#078447] sm:ml-1 sm:h-4 sm:w-4" />
          </motion.button>;
        })}
      </motion.div>}
    </AnimatePresence>
    <button type="button" onClick={() => setOpen((value) => !value)}
      aria-label={open ? "Close WhatsApp contacts" : "Open WhatsApp contacts"} aria-expanded={open}
      className="flex h-11 items-center gap-2 rounded-full bg-[#00c853] px-3 text-white shadow-[0_5px_18px_rgba(0,200,83,.3)] transition hover:bg-[#00b84a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] focus-visible:ring-offset-2 sm:h-12 sm:gap-2.5 sm:px-4"
    >
      {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      <span className="text-xs font-semibold sm:text-sm">WhatsApp Enquiry</span>
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
