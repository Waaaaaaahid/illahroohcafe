import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 bg-[#242521] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_.8fr_.8fr_1fr] lg:px-14">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#242521]"><ShoppingBag className="h-4 w-4" /></span><span className="text-2xl font-bold tracking-[-.075em]">zr<span className="text-[#b7c5a8]">cart</span></span></Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">Everyday essentials, little discoveries and useful finds — picked to make life feel a bit easier.</p>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10"><Instagram className="h-4 w-4" /></a>
        </div>
        <div><h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b7c5a8]">Shop</h3><ul className="mt-4 space-y-3 text-sm text-white/65"><li><Link to="/menu" className="hover:text-white">Shop all</Link></li><li><Link to="/menu" className="hover:text-white">Home & Kitchen</Link></li><li><Link to="/menu" className="hover:text-white">Tech accessories</Link></li><li><Link to="/menu" className="hover:text-white">Beauty & Care</Link></li></ul></div>
        <div><h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b7c5a8]">Help</h3><ul className="mt-4 space-y-3 text-sm text-white/65"><li><Link to="/profile" className="hover:text-white">My account</Link></li><li><Link to="/order-tracking" className="hover:text-white">Track an order</Link></li><li><Link to="/contact" className="hover:text-white">Contact us</Link></li><li><Link to="/about" className="hover:text-white">About Zrcart</Link></li></ul></div>
        <div><h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b7c5a8]">Need a hand?</h3><p className="mt-4 text-sm leading-6 text-white/60">Questions about an order or a product? We're here to help.</p><a href="mailto:hello@zrcart.in" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#c8d4bd]">hello@zrcart.in <ArrowUpRight className="h-4 w-4" /></a><p className="mt-4 flex items-center gap-2 text-xs text-white/45"><MapPin className="h-3.5 w-3.5" /> India</p></div>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-5 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-14"><p>© {new Date().getFullYear()} Zrcart. All rights reserved.</p><p>Good finds for everyday living.</p></div></div>
    </footer>
  );
}
