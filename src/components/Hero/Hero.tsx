import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Star } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/AppButton";
import heroImage from "@/assets/hero-coffee.jpg";
import { useCafe } from "@/context/CafeContext";

export function Hero() {
  const { settings } = useCafe();
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = imageRef.current;
    if (!element || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const quickY = gsap.quickTo(element, "y", { duration: 0.8, ease: "power3.out" });
    const onScroll = () => quickY(Math.min(window.scrollY * 0.12, 90));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
      <div className="pointer-events-none absolute -top-40 -right-32 size-[32rem] rounded-full bg-accent/20 blur-3xl" />
      <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <span className="font-display text-5xl leading-none text-primary-foreground sm:text-6xl">IlaahRooh</span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
            Taste that reaches
            <span className="block text-primary-foreground/90">your soul.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-primary-foreground/80">{settings.description || "Taste that reaches your soul"}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/menu"><Button variant="accent" size="lg">Explore Menu <ArrowRight className="size-4" /></Button></Link>
            <Link to="/menu" hash="order"><Button variant="glass" size="lg">Order Now</Button></Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-7">
            {[{ value: "4.9", label: "Guest rating", icon: Star }, { value: "25 min", label: "Avg. delivery", icon: Clock }, { value: "60+", label: "Menu items", icon: null }].map((stat) => (
              <div key={stat.label}><dt className="flex items-center gap-1 text-2xl font-bold">{stat.value}{stat.icon ? <stat.icon className="size-4 fill-accent text-accent" /> : null}</dt><dd className="mt-1 text-xs text-primary-foreground/60">{stat.label}</dd></div>
            ))}
          </dl>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="relative">
          <div ref={imageRef} className="relative overflow-hidden rounded-[2rem] shadow-lift">
            <img src={heroImage} alt="Freshly prepared food and drinks at IlaahRooh" width={1408} height={1200} className="aspect-4/5 w-full object-cover sm:aspect-4/3 lg:aspect-4/5" />
            <div className="absolute inset-0 bg-image-overlay" />
            <div className="glass-dark absolute bottom-5 left-5 right-5 rounded-2xl px-5 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/70">IlaahRooh</p>
              <p className="mt-1.5 font-display text-2xl">Taste that reaches your soul</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
