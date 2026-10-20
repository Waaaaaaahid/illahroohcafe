import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronRight, Heart, Search, ShieldCheck, ShoppingBag, Sparkles, Truck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zrcart — Everyday finds. Better prices." },
      { name: "description", content: "Discover thoughtful everyday essentials, home finds, accessories and more at Zrcart." },
      { property: "og:title", content: "Zrcart — Everyday finds. Better prices." },
      { property: "og:description", content: "Shop useful finds for your everyday life." },
    ],
  }),
  component: HomePage,
});

const categories = [
  { name: "Home & Kitchen", note: "Small upgrades, big difference", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85" },
  { name: "Tech Accessories", note: "Smart little essentials", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85" },
  { name: "Beauty & Care", note: "Your daily routine", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85" },
  { name: "Everyday Utility", note: "Made for real life", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=85" },
];

const products = [
  { name: "Minimal Desk Lamp", category: "Home & Living", price: 699, oldPrice: 999, rating: "4.8", reviews: 124, badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85" },
  { name: "Everyday Wireless Earbuds", category: "Tech Accessories", price: 1299, oldPrice: 1799, rating: "4.6", reviews: 86, badge: "TRENDING", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85" },
  { name: "Daily Care Essentials Set", category: "Beauty & Care", price: 449, oldPrice: 599, rating: "4.7", reviews: 203, badge: "POPULAR", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85" },
  { name: "Compact Travel Organizer", category: "Everyday Utility", price: 349, oldPrice: 499, rating: "4.5", reviews: 61, badge: "GREAT VALUE", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85" },
];

function ProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-[#f4f3ef]">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold tracking-[.14em] text-[#242424]">{product.badge}</span>
        <button aria-label={`Save ${product.name} to wishlist`} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#282828] transition hover:bg-white"><Heart className="h-4 w-4" /></button>
        <Link to="/menu" aria-label={`View ${product.name}`} className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#20211e] text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      <div className="pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#85857d]">{product.category}</p>
        <div className="mt-1.5 flex items-start justify-between gap-2"><h3 className="text-sm font-semibold leading-5 text-[#242521] sm:text-base">{product.name}</h3><span className="shrink-0 text-xs text-[#62645c]">★ {product.rating}</span></div>
        <div className="mt-2 flex items-center gap-2"><span className="text-sm font-bold text-[#242521]">₹{product.price.toLocaleString("en-IN")}</span><span className="text-xs text-[#96968e] line-through">₹{product.oldPrice.toLocaleString("en-IN")}</span><span className="text-[10px] font-bold text-[#4e7255]">{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF</span></div>
      </div>
    </article>
  );
}

function HomePage() {
  return (
    <div className="bg-[#fbfaf7] text-[#242521]">
      <div className="bg-[#22231f] px-4 py-2.5 text-center text-[10px] font-semibold tracking-[.15em] text-white sm:text-[11px]">A LITTLE SOMETHING BETTER, EVERY DAY <span className="mx-2 text-[#c9d4b8]">✳</span> SHOP SMART WITH ZRCART</div>
      <section className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:grid-cols-[1fr_.92fr] lg:items-center lg:gap-12 lg:px-14 lg:pt-14">
        <div className="order-2 pb-3 lg:order-1 lg:pb-8">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#6e7c62]"><Sparkles className="h-4 w-4" /> Curated for everyday living</div>
          <h1 className="max-w-2xl text-[clamp(3.2rem,7.4vw,6.6rem)] font-medium leading-[.94] tracking-[-.075em]">Good finds.<br /><span className="font-serif italic font-normal text-[#738367]">Better everyday.</span></h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#73746c] sm:text-base">Useful little upgrades for your home, your routine and everything in between. Thoughtfully picked. Easy on your pocket.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link to="/menu" className="inline-flex items-center gap-3 rounded-full bg-[#242521] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#4c5845]">Explore the collection <ArrowRight className="h-4 w-4" /></Link><a href="#categories" className="inline-flex items-center gap-2 rounded-full border border-[#d9d9d0] px-6 py-3.5 text-xs font-semibold text-[#35362f] transition hover:bg-white">Browse categories</a></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#e7e6df] pt-6 text-[10px] font-semibold tracking-wide text-[#686a61] sm:mt-14"><span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#718266]" /> Delivery across India</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#718266]" /> Secure checkout</span><span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#718266]" /> Curated quality</span></div>
        </div>
        <div className="order-1 relative min-h-[340px] overflow-hidden rounded-[1.6rem] bg-[#e8e7dd] sm:min-h-[470px] lg:order-2 lg:min-h-[590px]">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=90" alt="Calm, modern home with carefully chosen everyday objects" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
          <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#30332c] backdrop-blur-sm sm:left-7 sm:top-7">The everyday edit · 01</div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-8 sm:left-8 sm:right-8"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/75">Small things, considered</p><h2 className="mt-2 max-w-sm font-serif text-3xl italic leading-tight sm:text-4xl">Make room for better.</h2></div><Link to="/menu" aria-label="Shop the collection" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#242521] transition hover:scale-105"><ArrowUpRight className="h-5 w-5" /></Link></div>
        </div>
      </section>

      <section id="categories" className="border-y border-[#e9e8e1] bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">Shop by mood</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] sm:text-3xl">Find your kind of useful.</h2></div><Link to="/menu" className="hidden items-center gap-1 text-xs font-semibold sm:flex">All categories <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{categories.map((category, i) => <Link to="/menu" key={category.name} className="group"><div className="relative aspect-[.92] overflow-hidden rounded-xl bg-[#eeede7] sm:rounded-2xl"><img src={category.image} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" /><span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-[#34352e] sm:left-4 sm:top-4">{String(i + 1).padStart(2, "0")}</span><div className="absolute inset-x-3 bottom-3 text-white sm:inset-x-4 sm:bottom-4"><h3 className="text-sm font-semibold sm:text-lg">{category.name}</h3><p className="mt-1 text-[10px] text-white/80 sm:text-xs">{category.note}</p></div></div></Link>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">A good place to start</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] sm:text-3xl">The things everyone's loving.</h2><p className="mt-2 text-xs text-[#85867e] sm:text-sm">A preview of the Zrcart collection.</p></div><Link to="/menu" className="flex shrink-0 items-center gap-1 text-xs font-semibold">Shop all <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.name} product={product} />)}</div>
      </section>

      <section className="mx-5 mb-14 overflow-hidden rounded-2xl bg-[#e9ede3] sm:mx-8 sm:mb-20 lg:mx-auto lg:max-w-[1352px]">
        <div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:px-16"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6b7d5d]">The Zrcart promise</p><h2 className="mt-3 max-w-2xl text-3xl font-medium leading-tight tracking-[-.05em] sm:text-4xl">Less scrolling. Better finds. <span className="font-serif italic font-normal text-[#718265]">More living.</span></h2><p className="mt-4 max-w-lg text-sm leading-6 text-[#6c7065]">We're building a collection of practical, good-looking things that make everyday life feel a little easier.</p></div><Link to="/menu" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#242521] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#4c5845]">Discover Zrcart <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  );
}
