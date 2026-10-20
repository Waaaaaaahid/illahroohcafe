import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, SlidersHorizontal, Star } from "lucide-react";
import { menuService } from "@/services/menuService";
import { SORT_OPTIONS, type SortOption } from "@/constants";
import type { MenuItem } from "@/lib/types";

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [
    { title: "Shop all products — Zrcart" },
    { name: "description", content: "Explore everyday essentials, home and kitchen finds, accessories and more at Zrcart." },
  ] }),
  component: ShopPage,
});

const fallbackImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85";

function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("popular");
  const productsQuery = useQuery({ queryKey: ["menu"], queryFn: menuService.list });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: menuService.categories });
  const categories = (categoriesQuery.data ?? []).filter((item) => item.active);
  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (productsQuery.data ?? []).filter((product) =>
      product.available && (!query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)) &&
      (category === "all" || product.category === category)
    );
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name);
    });
  }, [productsQuery.data, search, category, sort]);

  return <div className="min-h-screen bg-[#fbfaf7] text-[#242521]">
    <section className="border-b border-[#e9e8e1] bg-[#f0f1e9]"><div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-14"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#718064]">The Zrcart collection</p><div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-medium tracking-[-.065em] sm:text-6xl">Shop all.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#73746c] sm:text-base">Useful things, considered details and everyday upgrades — find your next good thing.</p></div><div className="flex items-center gap-2 text-xs text-[#6d6f66]"><span className="h-2 w-2 rounded-full bg-[#7c8c70]" /> A little better, every day</div></div></div></section>
    <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-14">
      <div className="mb-7 flex flex-col gap-4 border-b border-[#e7e6df] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold">Everyday favourites</p><p className="mt-1 text-xs text-[#85867e]">{products.length} products from the live Zrcart catalogue</p></div><div className="flex items-center gap-2 text-xs text-[#77796f]"><SlidersHorizontal className="h-4 w-4" /> Filter & sort</div></div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_200px]">
          <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#85867e]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="h-11 w-full rounded-full border border-[#d9d9d0] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#78866b]" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-full border border-[#d9d9d0] bg-white px-4 text-sm outline-none focus:border-[#78866b]"><option value="all">All categories</option>{categories.map((item) => <option key={item._id} value={item.slug}>{item.name}</option>)}</select>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="h-11 rounded-full border border-[#d9d9d0] bg-white px-4 text-sm outline-none focus:border-[#78866b]">{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </div>
      </div>
      {productsQuery.isLoading ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4,5,6,7,8].map((n) => <div key={n} className="aspect-[4/5] animate-pulse rounded-2xl bg-[#f0efe9]" />)}</div> :
       productsQuery.isError ? <div className="rounded-2xl border border-dashed border-[#d9d9d0] bg-white p-10 text-center"><h2 className="text-lg font-semibold">Products couldn't load</h2><p className="mt-2 text-sm text-[#73746c]">Check the API connection and try again.</p><button onClick={() => void productsQuery.refetch()} className="mt-4 rounded-full bg-[#242521] px-5 py-2.5 text-xs font-semibold text-white">Try again</button></div> :
       products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-11 lg:grid-cols-4">{products.map((product: MenuItem) => <article key={product._id} className="group min-w-0"><Link to="/menu" className="block"><div className="relative aspect-[4/4.7] overflow-hidden rounded-2xl bg-[#f0efe9]"><img src={product.image || fallbackImage} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />{product.badge || product.popular ? <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[8px] font-bold tracking-[.12em] sm:left-3 sm:top-3 sm:text-[9px]">{product.badge || "FEATURED"}</span> : null}</div><div className="pt-4"><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#85867e] sm:text-[10px]">{categories.find((item) => item.slug === product.category)?.name ?? product.category.replaceAll("-", " ")}</p><h2 className="mt-1.5 text-sm font-semibold leading-5 sm:text-base">{product.name}</h2><div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#73746c]"><Star className="h-3 w-3 fill-[#879779] text-[#879779]" /> {Number(product.rating ?? 0).toFixed(1)}</div><div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</span>{product.compareAtPrice && product.compareAtPrice > product.price ? <><span className="text-xs text-[#96968e] line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</span><span className="text-[9px] font-bold text-[#58755a]">{Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF</span></> : null}</div></div></Link></article>)}</div> :
       <div className="rounded-2xl border border-dashed border-[#d9d9d0] bg-white px-5 py-12 text-center"><h2 className="text-lg font-semibold">No products found</h2><p className="mt-2 text-sm text-[#73746c]">Try another search or choose a different category. Products you add in Zrcart Studio appear here automatically.</p><button onClick={() => { setSearch(""); setCategory("all"); }} className="mt-4 rounded-full border border-[#d9d9d0] px-5 py-2.5 text-xs font-semibold">Clear filters</button></div>}
      <div className="mt-14 rounded-2xl border border-[#e4e4db] bg-white px-5 py-8 text-center sm:mt-20 sm:px-10"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">Your Zrcart collection</p><h2 className="mt-3 text-2xl font-medium tracking-[-.04em]">Updated from the admin panel.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#73746c]">Product names, prices, images, categories and availability are loaded from your store database.</p><Link to="/" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold">Back to home <ArrowRight className="h-4 w-4" /></Link></div>
    </section>
  </div>;
}
