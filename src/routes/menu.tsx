import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, SlidersHorizontal, Star } from "lucide-react";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Shop all products — Zrcart" },
      { name: "description", content: "Explore everyday essentials, home and kitchen finds, accessories and more at Zrcart." },
    ],
  }),
  component: ShopPage,
});

const shopProducts = [
  { id: "desk-lamp", name: "Minimal Desk Lamp", category: "Home & Living", price: 699, oldPrice: 999, rating: "4.8", reviews: 124, badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85" },
  { id: "earbuds", name: "Everyday Wireless Earbuds", category: "Tech Accessories", price: 1299, oldPrice: 1799, rating: "4.6", reviews: 86, badge: "TRENDING", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85" },
  { id: "care-set", name: "Daily Care Essentials Set", category: "Beauty & Care", price: 449, oldPrice: 599, rating: "4.7", reviews: 203, badge: "POPULAR", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85" },
  { id: "organizer", name: "Compact Travel Organizer", category: "Everyday Utility", price: 349, oldPrice: 499, rating: "4.5", reviews: 61, badge: "GREAT VALUE", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85" },
  { id: "home", name: "Calm Home Accent", category: "Home & Kitchen", price: 549, oldPrice: 799, rating: "4.7", reviews: 92, badge: "NEW", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" },
  { id: "headphones", name: "Wireless On-Ear Headphones", category: "Tech Accessories", price: 1599, oldPrice: 2199, rating: "4.6", reviews: 74, badge: "TOP RATED", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85" },
  { id: "skincare", name: "Daily Hydration Cream", category: "Beauty & Care", price: 399, oldPrice: 549, rating: "4.5", reviews: 118, badge: "POPULAR", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85" },
  { id: "bag", name: "Everyday Carry Tote", category: "Everyday Utility", price: 499, oldPrice: 699, rating: "4.8", reviews: 57, badge: "JUST IN", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85" },
];

function ShopPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#242521]">
      <section className="border-b border-[#e9e8e1] bg-[#f0f1e9]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-14">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#718064]">The Zrcart collection</p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-medium tracking-[-.065em] sm:text-6xl">Shop all.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#73746c] sm:text-base">Useful things, considered details and everyday upgrades — find your next good thing.</p></div><div className="flex items-center gap-2 text-xs text-[#6d6f66]"><span className="h-2 w-2 rounded-full bg-[#7c8c70]" /> A little better, every day</div></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-14">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e6df] pb-5">
          <div><p className="text-sm font-semibold">Everyday favourites</p><p className="mt-1 text-xs text-[#85867e]">A preview collection · {shopProducts.length} sample products</p></div>
          <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-[#d9d9d0] px-4 py-2.5 text-xs font-semibold text-[#77796f] opacity-80"><SlidersHorizontal className="h-4 w-4" /> Filters <span className="text-[9px] uppercase tracking-wider">Next step</span></button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-11 lg:grid-cols-4">
          {shopProducts.map((product) => (
            <article key={product.id} className="group min-w-0">
              <div className="relative aspect-[4/4.7] overflow-hidden rounded-2xl bg-[#f0efe9]">
                <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[8px] font-bold tracking-[.12em] sm:left-3 sm:top-3 sm:text-[9px]">{product.badge}</span>
                <button type="button" aria-label={`Save ${product.name} to wishlist`} className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 transition hover:bg-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"><Heart className="h-4 w-4" /></button>
              </div>
              <div className="pt-4">
                <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#85867e] sm:text-[10px]">{product.category}</p>
                <h2 className="mt-1.5 text-sm font-semibold leading-5 sm:text-base">{product.name}</h2>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#73746c]"><Star className="h-3 w-3 fill-[#879779] text-[#879779]" /> {product.rating} <span>({product.reviews})</span></div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</span><span className="text-xs text-[#96968e] line-through">₹{product.oldPrice.toLocaleString("en-IN")}</span><span className="text-[9px] font-bold text-[#58755a]">{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF</span></div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-[#e4e4db] bg-white px-5 py-8 text-center sm:mt-20 sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">Coming together, one step at a time</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-.04em]">This is the visual foundation.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#73746c]">Next we’ll connect real product data, working category filters, search, sorting, product details and cart actions. These prices and products are demo content for the redesign only.</p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold">Back to home <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
