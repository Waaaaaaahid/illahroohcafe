import { AnimatePresence, motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu as MenuIcon, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCafe } from "@/context/CafeContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/AppButton";
import { AnnouncementBar } from "@/components/AnnouncementBar/AnnouncementBar";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, openCart } = useCart();
  const { settings } = useCafe();
  const { user, isAdmin, logout } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const links = [{ label: "Home", to: "/" }, { label: "Shop all", to: "/menu" }, { label: "New arrivals", to: "/menu" }, { label: "Our story", to: "/about" }];

  return (
    <header className={`sticky top-0 z-50 border-b border-[#e9e8e1] bg-[#fbfaf7]/95 backdrop-blur-xl transition-all duration-300 ${scrolled ? "shadow-[0_8px_28px_rgba(30,32,26,.06)]" : ""}`}>
      <AnnouncementBar />
      <nav className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-14">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${settings.name || "Store"} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#252720] text-white"><ShoppingBag className="h-4 w-4" /></span>
          <span className="text-[1.35rem] font-bold tracking-[-.055em] text-[#252720]">{settings.name || "Zrcart"}</span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <Link key={link.label} to={link.to} activeOptions={{ exact: link.to === "/" }} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${pathname === link.to ? "bg-[#e9ede3] text-[#343e2f]" : "text-[#65665e] hover:bg-white hover:text-[#252720]"}`}>{link.label}</Link>)}
          {isAdmin ? <Link to="/admin" className="flex items-center gap-1.5 rounded-full bg-[#e9ede3] px-4 py-2 text-xs font-semibold text-[#343e2f]"><LayoutDashboard className="h-4 w-4" /> Admin</Link> : null}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/menu" aria-label="Search products" className="hidden h-10 w-10 items-center justify-center rounded-full text-[#55574f] transition hover:bg-white sm:flex"><Search className="h-[18px] w-[18px]" /></Link>
          <button type="button" onClick={openCart} aria-label={`Open cart, ${count} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#34352e] transition hover:bg-white"><ShoppingBag className="h-[18px] w-[18px]" />{count > 0 ? <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#78866b] px-1 text-[9px] font-bold text-white">{count}</span> : null}</button>
          {user ? <div className="hidden items-center gap-2 sm:flex"><Link to="/profile"><Button variant="outline" size="sm" className="rounded-full border-[#d9dcd2] text-[#34352e]"><User className="h-4 w-4" /> {user.name.split(" ")[0]}</Button></Link><button type="button" onClick={logout} aria-label="Log out" className="flex h-10 w-10 items-center justify-center rounded-full text-[#55574f] hover:bg-white"><LogOut className="h-4 w-4" /></button></div> : <Link to="/login" className="hidden sm:block"><Button size="sm" className="rounded-full bg-[#252720] px-5 text-xs font-semibold text-white hover:bg-[#4c5845]">Sign in</Button></Link>}
          <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation menu" aria-expanded={mobileOpen} className="flex h-10 w-10 items-center justify-center rounded-full text-[#34352e] hover:bg-white lg:hidden">{mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}</button>
        </div>
      </nav>
      <AnimatePresence>{mobileOpen ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }} className="overflow-hidden border-t border-[#e9e8e1] bg-[#fbfaf7] lg:hidden"><ul className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 py-4 sm:px-8">{links.map((link) => <li key={link.label}><Link to={link.to} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#45473f] hover:bg-[#e9ede3]">{link.label}</Link></li>)}{isAdmin ? <li><Link to="/admin" className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#45473f] hover:bg-[#e9ede3]">Admin dashboard</Link></li> : null}<li className="mt-2 flex gap-2">{user ? <><Link to="/profile" className="flex-1"><Button variant="outline" className="w-full rounded-xl">Profile</Button></Link><Button variant="subtle" onClick={logout}>Log out</Button></> : <><Link to="/login" className="flex-1"><Button className="w-full rounded-xl bg-[#252720]">Sign in</Button></Link><Link to="/register" className="flex-1"><Button variant="outline" className="w-full rounded-xl">Create account</Button></Link></>}</li></ul></motion.div> : null}</AnimatePresence>
    </header>
  );
}
