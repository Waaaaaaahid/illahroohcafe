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
import { useEffect, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
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
      { title: "Ilarooh — Slow-craft coffee house & kitchen" },
      { name: "description", content: "Order single-origin coffee, stone-baked plates and patisserie from Ilarooh, Bandra West." },
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
  const digits = (settings.whatsappNumber || settings.phone || "").replace(/\D/g, "");
  const message = encodeURIComponent(`Hi ${settings.name || "there"}, I have an enquiry.`);
  const href = digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
  return <a href={href} target="_blank" rel="noreferrer" aria-label="WhatsApp enquiry" className="fixed bottom-24 left-3 z-[60] inline-flex items-center gap-2 rounded-xl bg-[#00c853] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.03] hover:bg-[#00b84a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] focus-visible:ring-offset-2 sm:bottom-8 sm:left-5">
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M20.52 3.48A11.78 11.78 0 0 0 12.13 0C5.55 0 .2 5.35.2 11.93c0 2.1.55 4.15 1.6 5.96L.1 24l6.27-1.64a11.9 11.9 0 0 0 5.75 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.54-8.42ZM12.13 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.84 9.84 0 0 1-1.51-5.26c0-5.46 4.45-9.91 9.9-9.91a9.83 9.83 0 0 1 7.01 2.91 9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.9-9.92 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.69-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.28.3-1.04 1.02-1.04 2.49s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
    <span>WhatsApp Enquiry</span>
  </a>;
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
