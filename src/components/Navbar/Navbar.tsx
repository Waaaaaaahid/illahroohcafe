import { AnimatePresence, motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu as MenuIcon, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/AppButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className={`site-navbar sticky top-0 z-50 transition-all duration-300 ${scrolled ? "site-navbar-scrolled" : ""}`}>
      <nav className="container-page flex h-[74px] items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3">
          <span className="brand-script text-4xl leading-none text-[#c81019] transition-transform duration-300 group-hover:scale-[1.02] sm:text-[2.65rem]">IlaahRooh</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="site-nav-link rounded-full px-4 py-2 text-sm font-bold transition-all"
                activeProps={{ className: "site-nav-link site-nav-link-active rounded-full px-4 py-2 text-sm font-bold" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {isAdmin ? <li><Link to="/admin" className="site-admin-link flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold"><LayoutDashboard className="size-4" /> Admin</Link></li> : null}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={openCart} aria-label={`Open cart, ${count} items`} className="site-icon-btn relative rounded-full p-2.5 transition-all">
            <ShoppingBag className="size-5" />
            <AnimatePresence>{count > 0 ? <motion.span key={count} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[#c81019] px-1.5 py-0.5 text-[0.65rem] font-bold text-white">{count}</motion.span> : null}</AnimatePresence>
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/profile"><Button variant="outline" size="sm" className="rounded-full border-[#e8cfd0] text-[#a20c14] hover:bg-[#fff3f3]"><User className="size-4" /> {user.name.split(" ")[0]}</Button></Link>
              <button type="button" onClick={logout} aria-label="Log out" className="site-icon-btn rounded-full p-2.5"><LogOut className="size-4" /></button>
            </div>
          ) : <Link to="/login" className="hidden sm:block"><Button size="sm" className="rounded-full bg-[#c81019] px-5 font-bold text-white shadow-sm hover:bg-[#a90d15]">Sign in</Button></Link>}

          <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation menu" aria-expanded={mobileOpen} className="site-icon-btn rounded-full p-2.5 lg:hidden">
            <AnimatePresence mode="wait" initial={false}><motion.span key={mobileOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="block">{mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}</motion.span></AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-[#f0dddd] bg-white lg:hidden">
            <ul className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => <li key={link.to}><Link to={link.to} className="mobile-nav-link block rounded-xl px-4 py-3 text-base font-bold">{link.label}</Link></li>)}
              {isAdmin ? <li><Link to="/admin" className="mobile-nav-link block rounded-xl px-4 py-3 text-base font-bold text-[#c81019]">Admin dashboard</Link></li> : null}
              <li className="mt-2 flex gap-3 px-1">
                {user ? <><Link to="/profile" className="flex-1"><Button variant="outline" className="w-full rounded-xl">Profile</Button></Link><Button variant="subtle" onClick={logout}>Log out</Button></> : <><Link to="/login" className="flex-1"><Button className="w-full rounded-xl bg-[#c81019]">Sign in</Button></Link><Link to="/register" className="flex-1"><Button variant="outline" className="w-full rounded-xl">Register</Button></Link></>}
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
