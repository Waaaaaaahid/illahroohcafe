import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronRight, ShieldCheck, Sparkles, Truck, Star, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { menuService } from "@/services/menuService";
import type { Category, MenuItem } from "@/lib/types";
import { reviewService, type Review } from "@/services/reviewService";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Everyday finds. Better prices." },
    { name: "description", content: "Discover useful everyday essentials, home finds, accessories and more." },
    { property: "og:title", content: "Zrcart — Everyday finds. Better prices." },
    { property: "og:description", content: "Shop useful finds for your everyday life." },
  ] }),
  loader: async () => {
    const [categories, products] = await Promise.all([
      menuService.categories(),
      menuService.list(),
    ]);
    return { categories, products };
  },
  // The announcement bar is rendered globally by Navbar; keep the homepage banner-free.
  component: HomePage,
});

const categoryFallbackImages = [
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=85",
];
const productFallbackImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85";

function ProductCard({ product, categoryName }: { product: MenuItem; categoryName: string }) {
  const { addItem, openCart } = useCart();
  return <article className="group min-w-0">
    <Link to="/menu" className="block">
      <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-[#f4f3ef]">
        <img src={product.image || productFallbackImage} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        {product.badge || product.popular ? <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold tracking-[.14em] text-[#242424]">{product.badge || "FEATURED"}</span> : null}
        {!product.available ? <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-[9px] font-bold text-white">SOLD OUT</span> : null}
      </div>
      <div className="pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#85857d]">{categoryName}</p>
        <div className="mt-1.5 flex items-start justify-between gap-2"><h3 className="text-sm font-semibold leading-5 text-[#242521] sm:text-base">{product.name}</h3><span className="shrink-0 text-[10px] text-[#a0782c]">★ ★ ★ ★ ★ <span className="text-[#62645c]">{Number(product.rating ?? 0) > 0 ? Number(product.rating).toFixed(1) : "New"}</span></span></div>
        <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-[#242521]">₹{product.price.toLocaleString("en-IN")}</span>{product.compareAtPrice && product.compareAtPrice > product.price ? <><span className="text-xs text-[#96968e] line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</span><span className="text-[9px] font-bold text-[#58755a]">{Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF</span></> : null}</div>
      </div>
    </Link>
    <button type="button" onClick={() => { addItem(product); openCart(); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e4031] px-3 py-3 text-xs font-semibold text-white transition hover:bg-[#3c5540]"><Plus className="h-4 w-4" /> Add to cart</button>
  </article>;
}

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90",
    eyebrow: "The everyday edit",
    title: <>Make your space<br /><span className="italic">feel like you.</span></>,
    description: "Discover beautiful finds for your home, everyday living and more.",
    position: "center",
  },
  {
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=2000&q=90",
    eyebrow: "Thoughtful finds",
    title: <>Little things.<br /><span className="italic">Better living.</span></>,
    description: "Useful essentials and lovely details for your everyday routine.",
    position: "center",
  },
  {
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=90",
    eyebrow: "Make it yours",
    title: <>Find your<br /><span className="italic">everyday favourite.</span></>,
    description: "Explore the collection and find something you'll love.",
    position: "center",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90",
    eyebrow: "A better everyday",
    title: <>Good design.<br /><span className="italic">Everyday comfort.</span></>,
    description: "Fresh finds for the spaces and moments that matter.",
    position: "center",
  },
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const goTo = (index: number) => setActive((index + heroSlides.length) % heroSlides.length);
  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 45) goTo(active + (distance < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return <section
    aria-roledescription="carousel"
    aria-label="Featured collections"
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
    className="relative h-[min(66vh,600px)] min-h-[340px] w-full overflow-hidden bg-[#e8e2d6] sm:h-[min(74vh,680px)] sm:min-h-[460px] lg:h-[min(78vh,760px)]"
  >
    {heroSlides.map((slide, index) => <div
      key={slide.image}
      aria-hidden={index !== active}
      className={`absolute inset-0 transition-transform duration-700 ease-in-out ${index === active ? "translate-x-0" : index === (active + heroSlides.length - 1) % heroSlides.length ? "-translate-x-full" : "translate-x-full"}`}
    >
      <img src={slide.image} alt="" fetchPriority={index === 0 ? "high" : "auto"} loading={index === 0 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: slide.position }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
      <div className="absolute bottom-16 left-5 right-5 sm:bottom-20 sm:left-10 sm:right-10 lg:bottom-24 lg:left-16">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[.22em] text-white/85 sm:mb-3 sm:text-[10px]">{slide.eyebrow}</p>
        <h1 className="max-w-2xl font-serif text-3xl leading-[1.06] tracking-[-.035em] text-white sm:text-6xl lg:text-7xl">{slide.title}</h1>
        <p className="mt-3 max-w-md text-xs leading-5 text-white/90 sm:mt-4 sm:text-base sm:leading-6">{slide.description}</p>
        <Link to="/menu" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#263b2b] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#344d39] sm:mt-6 sm:gap-3 sm:rounded-xl sm:px-7 sm:py-4 sm:text-sm">Shop now <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>)}
    <div className="absolute bottom-4 right-5 z-10 flex items-center gap-2.5 sm:bottom-6 sm:right-10" role="group" aria-label="Choose featured slide">
      {heroSlides.map((slide, index) => <button key={slide.image} type="button" onClick={() => goTo(index)} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? "true" : undefined}
        className={`h-2 rounded-full transition-all duration-300 ${index === active ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/80"}`} />)}
    </div>
  </section>;
}

function HomePage() {
  const initialData = Route.useLoaderData();
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: menuService.categories,
    initialData: initialData.categories,
    staleTime: 30_000,
  });
  const productsQuery = useQuery({
    queryKey: ["menu"],
    queryFn: () => menuService.list(),
    initialData: initialData.products,
    staleTime: 30_000,
  });
  const categories = (categoriesQuery.data ?? []).filter((category) => category.active);
  const products = (productsQuery.data ?? []).filter((product) => product.available);
  const testimonialsQuery = useQuery({ queryKey: ["featured-reviews"], queryFn: reviewService.listFeatured, staleTime: 30_000 });
  const testimonials = testimonialsQuery.data ?? [];
  const featuredProducts = products.filter((product) => product.popular).slice(0, 4);
  const displayProducts = featuredProducts.length ? featuredProducts : products.slice(0, 4);

  return <div className="bg-[#fbfaf7] text-[#242521]">
    <HeroCarousel />
    <section id="categories" className="border-y border-[#e9e8e1] bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-8 flex items-center justify-between gap-4 sm:mb-10"><div className="w-full text-center"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">Explore the collection</p><h2 className="mt-2 font-serif text-3xl font-normal tracking-[-.025em] text-[#171815] sm:text-4xl">Shop by categories</h2></div><Link to="/menu" className="hidden shrink-0 items-center gap-1 text-xs font-semibold sm:flex">All products <ChevronRight className="h-4 w-4" /></Link></div>
        {categoriesQuery.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[1,2,3,4].map((n) => <div key={n} className="aspect-[.92] animate-pulse rounded-2xl bg-[#eeede7]" />)}</div> : categories.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{categories.map((category: Category, i) => <a href={`/menu?category=${encodeURIComponent(category.slug)}`} key={category._id} className="group"><div className="relative aspect-[.92] overflow-hidden rounded-xl bg-[#eeede7] sm:rounded-2xl"><img src={category.image || categoryFallbackImages[i % categoryFallbackImages.length]} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" /><div className="absolute inset-x-3 bottom-3 text-white sm:inset-x-4 sm:bottom-4"><h3 className="text-sm font-semibold sm:text-lg">{category.name}</h3><p className="mt-1 text-[10px] text-white/80 sm:text-xs">{category.description || "Explore the collection"}</p></div></div></a>)}</div> : <p className="rounded-2xl border border-dashed border-[#d9d9d0] p-8 text-center text-sm text-[#73746c]">Categories will appear here when available.</p>}
      </div>
    </section>
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
      <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">A good place to start</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] sm:text-3xl">The things everyone's loving.</h2><p className="mt-2 text-xs text-[#85867e] sm:text-sm">Products selected for your everyday life.</p></div><Link to="/menu" className="flex shrink-0 items-center gap-1 text-xs font-semibold">Shop all <ArrowRight className="h-4 w-4" /></Link></div>
      {productsQuery.isLoading ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map((n) => <div key={n} className="aspect-[4/5] animate-pulse rounded-2xl bg-[#f0efe9]" />)}</div> : productsQuery.isError ? <p className="rounded-2xl border border-dashed border-[#d9d9d0] p-8 text-center text-sm text-[#73746c]">Products couldn't load right now. Please try again shortly.</p> : displayProducts.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">{displayProducts.map((product) => <ProductCard key={product._id} product={product} categoryName={categories.find((item) => item.slug === product.category)?.name ?? product.category.replaceAll("-", " ")} />)}</div> : <p className="rounded-2xl border border-dashed border-[#d9d9d0] p-8 text-center text-sm text-[#73746c]">Products will appear here when available.</p>}
    </section>

    {testimonials.length > 0 ? <section className="border-y border-[#e9e8e1] bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mx-auto mb-9 max-w-xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#78856c]">Kind words</p>
          <h2 className="mt-2 font-serif text-3xl font-normal tracking-[-.025em] text-[#171815] sm:text-4xl">Loved by our customers</h2>
          <p className="mt-3 text-sm text-[#77786f]">A few words from people who shop with us.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((review: Review) => <article key={review._id} className="rounded-2xl border border-[#e9e8e1] bg-[#fbfaf7] p-5 sm:p-6">
            <div className="flex items-center gap-1 text-[#a0782c]" aria-label={`${review.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-current" : "opacity-30"}`} />)}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#55574f]">“{review.comment}”</p>
            <div className="mt-5 border-t border-[#e9e8e1] pt-4">
              <p className="text-sm font-semibold text-[#242521]">{review.authorName || review.user?.name || "Verified customer"}</p>
              {review.authorRole ? <p className="mt-1 text-xs text-[#85867e]">{review.authorRole}</p> : null}
            </div>
          </article>)}
        </div>
      </div>
    </section> : null}
    <section className="mx-5 mb-14 overflow-hidden rounded-2xl bg-[#e9ede3] sm:mx-8 sm:mb-20 lg:mx-auto lg:max-w-[1352px]"><div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:px-16"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6b7d5d]">Our promise</p><h2 className="mt-3 max-w-2xl text-3xl font-medium leading-tight tracking-[-.05em] sm:text-4xl">Less scrolling. Better finds. <span className="font-serif italic font-normal text-[#718265]">More living.</span></h2><p className="mt-4 max-w-lg text-sm leading-6 text-[#6c7065]">We're building a collection of practical, good-looking things that make everyday life feel a little easier.</p></div><Link to="/menu" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#242521] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#4c5845]">Discover the collection <ArrowRight className="h-4 w-4" /></Link></div></section>
  </div>;
}
