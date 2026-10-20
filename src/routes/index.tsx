import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { menuService } from "@/services/menuService";
import type { Category, MenuItem } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Zrcart — Everyday finds. Better prices." },
    { name: "description", content: "Discover useful everyday essentials, home finds, accessories and more at Zrcart." },
    { property: "og:title", content: "Zrcart — Everyday finds. Better prices." },
    { property: "og:description", content: "Shop useful finds for your everyday life." },
  ] }),
  component: HomePage,
});

const categoryFallbackImages = [
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=85",
];
const productFallbackImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85";

function ProductCard({ product }: { product: MenuItem }) {
  return <article className="group min-w-0">
    <Link to="/menu" className="block">
      <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-[#f4f3ef]">
        <img src={product.image || productFallbackImage} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        {product.popular ? <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold tracking-[.14em] text-[#242424]">FEATURED</span> : null}
        {!product.available ? <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-[9px] font-bold text-white">SOLD OUT</span> : null}
      </div>
      <div className="pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#85857d]">{product.category.replaceAll("-", " ")}</p>
        <div className="mt-1.5 flex items-start justify-between gap-2"><h3 className="text-sm font-semibold leading-5 text-[#242521] sm:text-base">{product.name}</h3>{product.rating ? <span className="shrink-0 text-xs text-[#62645c]">★ {product.rating}</span> : null}</div>
        <div className="mt-2"><span className="text-sm font-bold text-[#242521]">₹{product.price.toLocaleString("en-IN")}</span></div>
      </div>
    </Link>
  </article>;
}

function HomePage() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: menuService.categories });
  const productsQuery = useQuery({ queryKey: ["menu"], queryFn: menuService.list });
  const categories = (categoriesQuery.data ?? []).filter((category) => category.active);
  const products = (productsQuery.data ?? []).filter((product) => product.available);
  const featuredProducts = products.filter((product) => product.popular).slice(0, 4);
  const displayProducts = featuredProducts.length ? featuredProducts : products.slice(0, 4);

  return <div className="bg-[#fbfaf7] text-[#242521]">
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
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=90" alt="Calm modern home and everyday essentials" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
        <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#30332c] backdrop-blur-sm sm:left-7 sm:top-7">The everyday edit · Zrcart</div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-8 sm:left-8 sm:right-8"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/75">Small things, considered</p><h2 className="mt-2 max-w-sm font-serif text-3xl italic leading-tight sm:text-4xl">Make room for better.</h2></div><Link to="/menu" aria-label="Shop the collection" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#242521] transition hover:scale-105"><ArrowUpRight className="h-5 w-5" /></Link></div>
      </div>
    </section>
    <section id="categories" className="border-y border-[#e9e8e1] bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">Shop by category</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] sm:text-3xl">Find your kind of useful.</h2></div><Link to="/menu" className="hidden items-center gap-1 text-xs font-semibold sm:flex">All products <ChevronRight className="h-4 w-4" /></Link></div>
        {categoriesQuery.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[1,2,3,4].map((n) => <div key={n} className="aspect-[.92] animate-pulse rounded-2xl bg-[#eeede7]" />)}</div> : categories.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{categories.map((category: Category, i) => <Link to="/menu" key={category._id} className="group"><div className="relative aspect-[.92] overflow-hidden rounded-xl bg-[#eeede7] sm:rounded-2xl"><img src={category.image || categoryFallbackImages[i % categoryFallbackImages.length]} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" /><span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-[#34352e] sm:left-4 sm:top-4">{String(i + 1).padStart(2, "0")}</span><div className="absolute inset-x-3 bottom-3 text-white sm:inset-x-4 sm:bottom-4"><h3 className="text-sm font-semibold sm:text-lg">{category.name}</h3><p className="mt-1 text-[10px] text-white/80 sm:text-xs">{category.description || "Explore the collection"}</p></div></div></Link>)}</div> : <p className="rounded-2xl border border-dashed border-[#d9d9d0] p-8 text-center text-sm text-[#73746c]">Categories added in Zrcart Studio will appear here.</p>}
      </div>
    </section>
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
      <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">A good place to start</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] sm:text-3xl">The things everyone's loving.</h2><p className="mt-2 text-xs text-[#85867e] sm:text-sm">Products published from the Zrcart admin panel.</p></div><Link to="/menu" className="flex shrink-0 items-center gap-1 text-xs font-semibold">Shop all <ArrowRight className="h-4 w-4" /></Link></div>
      {productsQuery.isLoading ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map((n) => <div key={n} className="aspect-[4/5] animate-pulse rounded-2xl bg-[#f0efe9]" />)}</div> : productsQuery.isError ? <p className="rounded-2xl border border-dashed border-[#d9d9d0] p-8 text-center text-sm text-[#73746c]">Products couldn't load right now. Please try again shortly.</p> : displayProducts.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">{displayProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <p className="rounded-2xl border border-dashed border-[#d9d9d0] p-8 text-center text-sm text-[#73746c]">Products added in Zrcart Studio will appear here.</p>}
    </section>
    <section className="mx-5 mb-14 overflow-hidden rounded-2xl bg-[#e9ede3] sm:mx-8 sm:mb-20 lg:mx-auto lg:max-w-[1352px]"><div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:px-16"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6b7d5d]">The Zrcart promise</p><h2 className="mt-3 max-w-2xl text-3xl font-medium leading-tight tracking-[-.05em] sm:text-4xl">Less scrolling. Better finds. <span className="font-serif italic font-normal text-[#718265]">More living.</span></h2><p className="mt-4 max-w-lg text-sm leading-6 text-[#6c7065]">We're building a collection of practical, good-looking things that make everyday life feel a little easier.</p></div><Link to="/menu" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#242521] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#4c5845]">Discover Zrcart <ArrowRight className="h-4 w-4" /></Link></div></section>
  </div>;
}
