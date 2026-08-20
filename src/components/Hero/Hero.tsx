import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, ShoppingBag, Star, Truck } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/AppButton";
import { useCafe } from "@/context/CafeContext";

const FOOD_IMAGES = {
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=90",
  pizza: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=90",
  chicken: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=90",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=90",
};

export function Hero() {
  const { settings } = useCafe();
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = imageRef.current;
    if (!element || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const quickY = gsap.quickTo(element, "y", { duration: 0.8, ease: "power3.out" });
    const onScroll = () => quickY(Math.min(window.scrollY * 0.08, 55));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="hero-shell relative overflow-hidden bg-[#d80d16] text-white">
      <div className="hero-noise pointer-events-none absolute inset-0 opacity-20" />
      <div className="hero-yellow hero-yellow-one pointer-events-none absolute -right-24 top-16 size-80 rounded-full" />
      <div className="hero-yellow hero-yellow-two pointer-events-none absolute -bottom-44 right-[34%] size-96 rounded-full" />

      <div className="hero-tagline border-b border-white/10 bg-[#b90811] py-2.5 text-center text-sm font-display tracking-wide text-white/90 sm:text-base">
        <span className="mx-3">•</span> Taste that reaches your soul. <span className="mx-3">•</span>
      </div>

      <div className="container-page relative grid min-h-[560px] items-center gap-8 py-12 sm:py-16 lg:min-h-[650px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-4 lg:py-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-xl"
        >
          <p className="hero-eyebrow">WELCOME TO</p>
          <h1 className="mt-3 font-sans text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-[6.2rem]">
            ILAHROOH
          </h1>
          <div className="hero-rule mt-5" />
          <p className="mt-6 max-w-sm text-lg font-semibold leading-snug text-white/95 sm:text-xl">
            Burgers. Pizza.<br />Fries. More.
          </p>
          <p className="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl">
            All the cravings. One place!
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
            {settings.description || "Freshly made comfort food, loaded with flavour and delivered hot to your door."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu">
              <Button className="hero-primary-btn h-12 rounded-xl bg-white px-6 font-bold text-[#c90b14] shadow-xl hover:bg-white/90" size="lg">
                Explore Menu <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/menu" hash="order">
              <Button className="hero-outline-btn h-12 rounded-xl border-2 border-white/45 bg-transparent px-6 font-bold text-white hover:bg-white/10" size="lg">
                Order Now
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, scale: 0.94, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto h-[360px] w-full max-w-[700px] sm:h-[470px] lg:h-[560px]"
        >
          <div className="food-pizza absolute right-0 top-0 h-[58%] w-[55%] overflow-hidden rounded-[48%] border-8 border-[#efc000] shadow-2xl sm:border-[12px]">
            <img src={FOOD_IMAGES.pizza} alt="Fresh IlaahRooh pizza" className="size-full object-cover" />
          </div>
          <div className="food-burger absolute bottom-[4%] left-[4%] z-20 h-[58%] w-[66%] overflow-hidden rounded-[44%] border-8 border-transparent shadow-2xl sm:border-[10px]">
            <img src={FOOD_IMAGES.burger} alt="IlaahRooh loaded burger" className="size-full object-cover" />
          </div>
          <div className="food-chicken absolute bottom-0 right-[0%] z-30 h-[31%] w-[38%] overflow-hidden rounded-[45%] border-4 border-[#161616] bg-[#161616] shadow-2xl sm:border-8">
            <img src={FOOD_IMAGES.chicken} alt="Crispy chicken bites" className="size-full object-cover" />
          </div>
          <div className="food-fries absolute left-[55%] top-[35%] z-30 h-[25%] w-[23%] rotate-6 overflow-hidden rounded-b-3xl border-4 border-[#b70b13] bg-[#c91019] shadow-xl sm:border-6">
            <img src={FOOD_IMAGES.fries} alt="Crispy fries" className="size-full object-cover" />
          </div>
          <div className="hero-splash absolute left-[16%] top-[16%] size-[72%] rounded-full border-[18px] border-[#f2c300]/90 sm:border-[26px]" />
        </motion.div>
      </div>

      <div className="hero-stats relative z-20 border-t border-[#d33b42] bg-white text-[#7b1a20]">
        <div className="container-page grid grid-cols-2 divide-x divide-[#ead9d9] sm:grid-cols-4">
          <HeroStat icon={<Star />} value="4.9" label="Guest Rating" />
          <HeroStat icon={<Clock />} value="25 min" label="Avg. Delivery" />
          <HeroStat icon={<ShoppingBag />} value="60+" label="Menu Items" />
          <HeroStat icon={<Truck />} value="Fast & Safe" label="Delivery" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center gap-1 px-3 py-5 text-center sm:min-h-32">
      <span className="mb-1 text-[#c81019] [&>svg]:size-7">{icon}</span>
      <strong className="text-xl font-black tracking-tight sm:text-2xl">{value}</strong>
      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8b5b5f] sm:text-xs">{label}</span>
    </div>
  );
}
