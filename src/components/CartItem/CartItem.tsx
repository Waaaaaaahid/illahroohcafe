import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCafe } from "@/context/CafeContext";
import { formatCurrency } from "@/utils/format";
import type { CartLine } from "@/lib/types";

export function CartItem({ line }: { line: CartLine }) {
  const { increment, decrement, removeItem } = useCart();
  const { settings } = useCafe();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className="flex gap-4 rounded-2xl border border-border bg-card p-3"
    >
      <img
        src={line.image}
        alt={line.name}
        loading="lazy"
        className="size-20 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{line.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(line.price, settings.currency)} each
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.itemId)}
            aria-label={`Remove ${line.name}`}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <button
              type="button"
              onClick={() => decrement(line.itemId)}
              aria-label={`Decrease ${line.name} quantity`}
              className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold">{line.quantity}</span>
            <button
              type="button"
              onClick={() => increment(line.itemId)}
              aria-label={`Increase ${line.name} quantity`}
              className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold">
            {formatCurrency(line.price * line.quantity, settings.currency)}
          </span>
        </div>
      </div>
    </motion.li>
  );
}
