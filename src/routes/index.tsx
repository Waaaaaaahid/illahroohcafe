import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Leaf, MapPin, Sparkles, Star, Timer } from "lucide-react";
import { Hero } from "@/components/Hero/Hero";
import { MenuCard } from "@/components/MenuCard/MenuCard";
import { MenuGridSkeleton, ErrorState } from "@/components/Loading/Loading";
import { Button } from "@/components/ui/AppButton";
import { menuService } from "@/services/menuService";
import { mockReviews } from "@/lib/mock/mockData";
import { useCafe } from "@/context/CafeContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ilarooh — Slow-craft coffee house & kitchen in Bandra" },
      {
        name: "description",
        content:
          "Single-origin coffee, stone-baked pizza and patisserie, delivered in 25 minutes. Order online from Ilarooh, Bandra West.",
      },
      { property: "og:title", content: "Ilarooh — Coffee worth slowing down for" },
      {
        property: "og:description",
        content: "Order single-origin coffee and kitchen plates from Ilarooh, Bandra West.",
      },
    ],
  }),
  component: HomePage,
});

const WHY_US = [
  { title: "Fresh Ingredients", description: "Produce sourced each morning from local farms.", icon: Leaf },
  { title: "Fast Service", description: "Average delivery in 25 minutes across the neighbourhood.", icon: Timer },
  { title: "Premium Taste", description: "Recipes developed by chefs with fine-dining pedigree.", icon: Sparkles },
  { title: "Hygienic Kitchen", description: "FSSAI certified, audited every quarter.", icon: ChefHat },
];

function HomePage() {
  const { settings } = useCafe();
  const menuQuery = useQuery({ queryKey: ["menu"], queryFn: menuService.list });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: menuService.categories });

  const featured = (menuQuery.data ?? []).filter((item) => item.popular).slice(0, 4);

  return (
    <>
      <Hero />

      {/* Featured */}
      <section className="container-page section-padding">
        <SectionHeading
          eyebrow="Guest favourites"
          title="The plates people come back for"
          action={
            <Link to="/menu">
              <Button variant="outline" size="sm">
                Full menu <ArrowRight className="size-4" />
              </Button>
            </Link>
          }
        />
        {menuQuery.isLoading ? (
          <MenuGridSkeleton count={4} />
        ) : menuQuery.isError ? (
          <ErrorState onRetry={() => void menuQuery.refetch()} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item, index) => (
              <MenuCard key={item._id} item={item} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-secondary/45">
        <div className="container-page section-padding">
          <SectionHeading eyebrow="Explore" title="Browse by category" />
          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="skeleton aspect-square rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(categoriesQuery.data ?? []).map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                >
                  <Link
                    to="/menu"
                    search={{ category: category.slug }}
                    className="group relative block aspect-square overflow-hidden rounded-3xl shadow-soft"
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-image-overlay" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-lg font-semibold text-primary-foreground">
                        {category.name}
                      </p>
                      <p className="line-clamp-1 text-xs text-primary-foreground/70">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why us */}
      <section className="container-page section-padding">
        <SectionHeading eyebrow="Why Ilarooh" title="Built on four non-negotiables" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-gradient text-accent-foreground">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-secondary/45">
        <div className="container-page section-padding grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80"
              alt="Cafe interior with warm lighting"
              loading="lazy"
              className="aspect-3/4 w-full rounded-3xl object-cover shadow-soft"
            />
            <img
              src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=700&q=80"
              alt="Barista preparing coffee"
              loading="lazy"
              className="mt-10 aspect-3/4 w-full rounded-3xl object-cover shadow-soft"
            />
          </div>
          <div>
            <span className="eyebrow text-accent">Our story</span>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              A room built for lingering
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              We opened in 2016 with one espresso machine and a stone oven. A decade later the oven is
              still here, the roast is still single-origin, and every plate still leaves the pass by hand.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Whether you sit with us on Waterfield Road or order to your door, you get the same
              kitchen, the same beans, the same care.
            </p>
            <Link to="/about" className="mt-8 inline-block">
              <Button variant="outline">
                More about us <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-page section-padding">
        <SectionHeading eyebrow="Guest book" title="What people say" />
        <div className="grid gap-6 md:grid-cols-3">
          {mockReviews.map((review, index) => (
            <motion.figure
              key={review.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star key={starIndex} className="size-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="container-page pb-20">
        <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <span className="eyebrow text-accent">Find us</span>
            <h2 className="mt-4 font-display text-3xl font-semibold">{settings.address}</h2>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {settings.openingHours.map((entry) => (
                <li key={entry.day} className="flex justify-between gap-6 border-b border-border pb-2">
                  <span>{entry.day}</span>
                  <span className="font-medium text-foreground">{entry.hours}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact">
                <Button>Contact us</Button>
              </Link>
              <a href={`tel:${settings.phone}`}>
                <Button variant="outline">Call {settings.phone}</Button>
              </a>
            </div>
          </div>
          <div className="relative min-h-64 bg-secondary">
            {/* Map placeholder — swap for an embedded map when the API key is added. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <MapPin className="size-8 text-accent" />
              <p className="text-sm font-semibold">Map placeholder</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Drop an embedded map here once your maps provider key is configured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-hero-gradient px-8 py-14 text-center text-primary-foreground sm:px-14">
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-accent/25 blur-3xl" />
          <h2 className="relative font-display text-3xl font-semibold sm:text-4xl">
            Hungry already?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-primary-foreground/75">
            Your table is ready — or your doorstep is. Order in under two minutes.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/menu">
              <Button variant="accent" size="lg">
                Order Now <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="glass" size="lg">
                Book a table
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="eyebrow text-accent">{eyebrow}</span>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
