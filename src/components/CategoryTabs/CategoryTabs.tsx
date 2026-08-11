import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

interface CategoryTabsProps {
  categories: Category[];
  active: string;
  onChange: (slug: string) => void;
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const tabs = [{ _id: "all", name: "All", slug: "all" }, ...categories.filter((c) => c.active)];

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.slug === active;
          return (
            <button
              key={tab._id}
              type="button"
              onClick={() => onChange(tab.slug)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="category-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-primary"
                />
              ) : null}
              <span className="relative z-10">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
