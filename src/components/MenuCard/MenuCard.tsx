import { motion } from "framer-motion";
import { Leaf, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useCafe } from "@/context/CafeContext";
import { formatCurrency } from "@/utils/format";
import type { MenuItem } from "@/lib/types";

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const { addItem, openCart } = useCart();
  const { notify } = useToast();
  const { settings } = useCafe();

  const handleAdd = () => {
    addItem(item);
    notify(`${item.name} added to your cart`, {
      description: "Open the cart to review your order.",
      variant: "success",
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span
            className={`flex size-6 items-center justify-center rounded-md border-2 bg-card/90 ${
              item.vegetarian ? "border-success" : "border-destructive"
            }`}
            title={item.vegetarian ? "Vegetarian" : "Non-vegetarian"}
          >
            <span
              className={`size-2.5 rounded-full ${item.vegetarian ? "bg-success" : "bg-destructive"}`}
            />
          </span>
          {item.popular ? (
            <span className="glass-dark rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">
              Popular
            </span>
          ) : null}
        </div>
        {!item.available ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <span className="rounded-full bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
              Sold out
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-tight font-semibold">{item.name}</h3>
          {item.rating ? (
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Star className="size-3.5 fill-accent text-accent" /> {item.rating}
            </span>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-display text-xl font-semibold">
            {formatCurrency(item.price, settings.currency)}
          </span>
          <Button
            size="sm"
            variant={item.available ? "primary" : "subtle"}
            disabled={!item.available}
            onClick={handleAdd}
            onDoubleClick={openCart}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>

        {item.vegetarian ? (
          <span className="mt-3 inline-flex items-center gap-1 text-[0.7rem] font-medium text-success">
            <Leaf className="size-3" /> Vegetarian
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}
