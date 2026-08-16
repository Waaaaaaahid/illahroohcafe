import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { ADMIN_LINKS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orderService } from "@/services/orderService";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {ADMIN_LINKS.map((link) => {
        const active = link.to === "/admin" ? pathname === "/admin" : pathname.startsWith(link.to);
        return (
          <Link key={link.to} to={link.to} onClick={onNavigate} className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
            active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          )}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-7">
        <p className="eyebrow text-sidebar-primary">Ilarooh</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">Admin Console</p>
      </div>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto border-t border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/40 px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">{user ? initials(user.name) : "AD"}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email ?? ""}</p>
          </div>
        </div>
        <button type="button" onClick={() => { logout(); void navigate({ to: "/login" }); }} className="mt-3 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // ONE persistent realtime subscription for the entire Admin Console.
  // Do not include pathname in this effect: navigation must never disconnect SSE.
  useEffect(() => {
    const unsubscribe = orderService.subscribeAdminOrders((event) => {
      if (event.type === "initial-order") return;

      const changedOrder = event.order;

      if (event.type === "new-order") {
        queryClient.setQueryData<Order[]>(["admin-orders"], (oldOrders) => {
          const orders = oldOrders ?? [];
          const index = orders.findIndex((order) => order._id === changedOrder._id);
          if (index >= 0) {
            const next = [...orders];
            next[index] = changedOrder;
            return next;
          }
          return [changedOrder, ...orders];
        });

        // Refetch every currently mounted admin query (Dashboard charts, Orders,
        // Payments, counters, etc.) without navigating or refreshing the page.
        void queryClient.invalidateQueries({ refetchType: "active" });

        const isPaidOnline = changedOrder.paymentMethod === "online" && changedOrder.paymentStatus === "paid";
        const customer = changedOrder.customerDetails?.name || "Customer";
        const code = changedOrder.code ? `#${changedOrder.code}` : "";
        notify(isPaidOnline ? "Online payment received" : "New order received", {
          description: `${customer} ${code}${isPaidOnline ? " • Payment verified" : ""}`.trim(),
          variant: "success",
        });
        return;
      }

      if (event.type === "order-updated") {
        queryClient.setQueryData<Order[]>(["admin-orders"], (oldOrders) => {
          if (!oldOrders) return oldOrders;
          return oldOrders.map((order) => order._id === changedOrder._id ? changedOrder : order);
        });
        void queryClient.invalidateQueries({ refetchType: "active" });
      }
    });

    return unsubscribe;
  }, [queryClient, notify]);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-sidebar-border lg:block"><SidebarContent /></aside>
      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.div initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="relative h-full w-72 max-w-[85vw]">
              <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="absolute right-3 top-4 z-10 rounded-full bg-sidebar-accent/60 p-2 text-sidebar-foreground"><X className="size-4" /></button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3.5 backdrop-blur lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)} className="rounded-full p-2 text-foreground hover:bg-secondary"><Menu className="size-5" /></button>
          <p className="text-sm font-semibold">Ilarooh Admin</p>
          <span className="size-9" aria-hidden />
        </header>
        <main className="container-page py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
