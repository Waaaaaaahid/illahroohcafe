import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CategoryTabs } from "@/components/CategoryTabs/CategoryTabs";
import { MenuCard } from "@/components/MenuCard/MenuCard";
import { EmptyState, ErrorState, MenuGridSkeleton } from "@/components/Loading/Loading";
import { TextInput, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/AppButton";
import { menuService } from "@/services/menuService";
import { SORT_OPTIONS, type SortOption } from "@/constants";

type DietFilter = "all" | "veg" | "nonveg";

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Menu — Coffee, Pizza, Pasta & Desserts | Maison Noir" },
      {
        name: "description",
        content:
          "Browse the full Maison Noir menu: single-origin coffee, smash burgers, stone-baked pizza, fresh pasta, patisserie and cold-pressed drinks.",
      },
      { property: "og:title", content: "The Maison Noir Menu" },
      {
        property: "og:description",
        content: "Search, filter and order from the full Maison Noir kitchen and coffee bar.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category: categoryParam } = Route.useSearch();
  const [category, setCategory] = useState(categoryParam ?? "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  const menuQuery = useQuery({ queryKey: ["menu"], queryFn: menuService.list });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: menuService.categories });

  const items = useMemo(() => {
    let list = [...(menuQuery.data ?? [])];
    if (category !== "all") list = list.filter((item) => item.category === category);
    if (diet !== "all") list = list.filter((item) => (diet === "veg" ? item.vegetarian : !item.vegetarian));
    if (availableOnly) list = list.filter((item) => item.available);
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle),
      );
    }
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => Number(b.popular) - Number(a.popular));
    }
  }, [menuQuery.data, category, diet, availableOnly, query, sort]);

  return (
    <div id="order">
      <header className="bg-hero-gradient text-primary-foreground">
        <div className="container-page py-14 sm:py-20">
          <span className="eyebrow text-accent">The menu</span>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            Everything we make, today
          </h1>
          <p className="mt-4 max-w-xl text-primary-foreground/70">
            Roasted, kneaded and plated in-house. Filter by craving, dietary preference or price.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="sticky top-18 z-30 -mx-4 mb-8 space-y-4 bg-background/90 px-4 py-4 backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <TextInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cappuccino, truffle, tart…"
                aria-label="Search the menu"
                className="pl-11"
              />
            </div>
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              aria-label="Sort menu"
              className="sm:w-56"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            {(
              [
                { value: "all", label: "All" },
                { value: "veg", label: "Vegetarian" },
                { value: "nonveg", label: "Non-veg" },
              ] as { value: DietFilter; label: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDiet(option.value)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  diet === option.value
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAvailableOnly((value) => !value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                availableOnly
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Available now
            </button>
          </div>

          {categoriesQuery.data ? (
            <CategoryTabs
              categories={categoriesQuery.data}
              active={category}
              onChange={setCategory}
            />
          ) : (
            <div className="skeleton h-11 w-full max-w-lg rounded-full" />
          )}
        </div>

        {menuQuery.isLoading ? (
          <MenuGridSkeleton />
        ) : menuQuery.isError ? (
          <ErrorState
            description="The menu could not be loaded. Check that your API is running."
            onRetry={() => void menuQuery.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing matches that"
            description="Try a different category, or clear your filters to see the full menu."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setDiet("all");
                  setAvailableOnly(false);
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">{items.length} item(s)</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <MenuCard key={item._id} item={item} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
