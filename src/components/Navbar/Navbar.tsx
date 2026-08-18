import { AnimatePresence, motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import { Coffee, LayoutDashboard, LogOut, Menu as MenuIcon, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCafe } from "@/context/CafeContext";
import { Button } from "@/components/ui/AppButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useCafe();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass-panel shadow-soft" : "bg-transparent"}`}>
      <nav className="container-page flex h-18 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-4xl leading-none text-primary">IlaahRooh</span>
          <span className="hidden border-l border-border pl-3 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:block">Taste that reaches your soul</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} activeOptions={{ exact: link.to === "/" }} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary" activeProps={{ className: "bg-secondary text-primary" }}>
                {link.label}
              </Link>
            </li>
          ))}
          {isAdmin ? <li><Link to="/admin" className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"><LayoutDashboard className="size-4" /> Admin</Link></li> : null}
        </ul>

        <div className="flex items-center gap-2">
          <button type="button" onClick={openCart} aria-label={`Open cart, ${count} items`} className="relative rounded-full p-2.5 transition-colors hover:bg-secondary">
            <ShoppingBag className="size-5" />
            <AnimatePresence>{count > 0 ? <motion.span key={count} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[0.65rem] font-bold text-primary-foreground">{count}</motion.span> : null}</AnimatePresence>
          </button>

          {user ? <div className="hidden items-center gap-2 sm:flex"><Link to="/profile"><Button variant="outline" size="sm"><User className="size-4" /> {user.name.split(" ")[0]}</Button></Link><button type="button" onClick={logout} aria-label="Log out" className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><LogOut className="size-4" /></button></div> : <Link to="/login" className="hidden sm:block"><Button size="sm">Sign in</Button></Link>}

          <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation menu" aria-expanded={mobileOpen} className="rounded-full p-2.5 transition-colors hover:bg-secondary lg:hidden">
            <AnimatePresence mode="wait" initial={false}><motion.span key={mobileOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="block">{mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}</motion.span></AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>{mobileOpen ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border-t border-border bg-card lg:hidden">
        <ul className="container-page flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => <li key={link.to}><Link to={link.to} className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-secondary">{link.label}</Link></li>)}
          {isAdmin ? <li><Link to="/admin" className="block rounded-xl px-4 py-3 text-base font-medium text-accent">Admin dashboard</Link></li> : null}
          <li className="mt-2 flex gap-3 px-1">{user ? <><Link to="/profile" className="flex-1"><Button variant="outline" className="w-full">Profile</Button></Link><Button variant="subtle" onClick={logout}>Log out</Button></> : <><Link to="/login" className="flex-1"><Button className="w-full">Sign in</Button></Link><Link to="/register" className="flex-1"><Button variant="outline" className="w-full">Register</Button></Link></>}</li>
        </ul>
      </motion.div> : null}</AnimatePresence>
    </header>
  );
}
