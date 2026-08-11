import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Coffee, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { useCafe } from "@/context/CafeContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Maison Noir — Our roastery, kitchen and people" },
      {
        name: "description",
        content:
          "Since 2016 Maison Noir has roasted single-origin coffee and baked stone-oven plates in Bandra West. Meet the room, the roast and the team.",
      },
      { property: "og:title", content: "About Maison Noir" },
      {
        property: "og:description",
        content: "A decade of slow-craft coffee and kitchen work in Bandra West, Mumbai.",
      },
    ],
  }),
  component: AboutPage,
});

const MILESTONES = [
  { year: "2016", title: "One machine, one oven", text: "We opened on Waterfield Road with eight seats." },
  { year: "2019", title: "Our own roastery", text: "Green beans sourced direct from Chikmagalur and Yirgacheffe." },
  { year: "2022", title: "The kitchen grew", text: "Stone-baked pizza and fresh pasta joined the counter." },
  { year: "2026", title: "Delivered to you", text: "Same kitchen, now 25 minutes from your door." },
];

const VALUES = [
  { icon: Coffee, title: "Single-origin only", text: "We never blend to hide a flaw." },
  { icon: Heart, title: "Made by hand", text: "Every plate leaves the pass touched by a chef." },
  { icon: Users, title: "Fair to growers", text: "Direct trade contracts, renewed each harvest." },
  { icon: Award, title: "Consistent", text: "Recipe cards, calibration, daily cupping." },
];

function AboutPage() {
  const { settings } = useCafe();

  return (
    <>
      <header className="bg-hero-gradient text-primary-foreground">
        <div className="container-page py-16 sm:py-24">
          <span className="eyebrow text-accent">Our story</span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
            Ten years of doing one thing slowly, properly.
          </h1>
          <p className="mt-6 max-w-xl text-primary-foreground/70">{settings.description}</p>
        </div>
      </header>

      <section className="container-page section-padding grid gap-12 lg:grid-cols-2 lg:items-center">
        <img
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=80"
          alt="Guests seated inside the Maison Noir cafe"
          loading="lazy"
          className="aspect-4/3 w-full rounded-[2rem] object-cover shadow-lift"
        />
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">The room</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Worn oak, low light, and a counter you can sit at alone without feeling alone. We built a
            room for the ninety minutes between things — the coffee just happens to be exceptional.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Everything we serve in the room, we send out. Same beans, same oven, same pass.
          </p>
          <Link to="/menu" className="mt-8 inline-block">
            <Button>See what's on today</Button>
          </Link>
        </div>
      </section>

      <section className="bg-secondary/45">
        <div className="container-page section-padding">
          <span className="eyebrow text-accent">Milestones</span>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">How we got here</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {MILESTONES.map((milestone, index) => (
              <motion.li
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <p className="font-display text-2xl font-semibold text-accent">{milestone.year}</p>
                <h3 className="mt-3 font-semibold">{milestone.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{milestone.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page section-padding">
        <span className="eyebrow text-accent">What we hold to</span>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Our values</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <value.icon className="size-6 text-accent" />
              <h3 className="mt-4 font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
