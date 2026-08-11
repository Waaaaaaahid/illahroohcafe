import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { menuService } from "@/services/menuService";
import { adminService } from "@/services/adminService";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/context/ToastContext";
import { Button, buttonVariants } from "@/components/ui/AppButton";
import { TextInput } from "@/components/ui/Field";
import { EmptyState, ErrorState, MenuGridSkeleton } from "@/components/Loading/Loading";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { MenuItem } from "@/lib/types";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Menu Management — Maison Noir Admin" },
      { name: "description", content: "Add, edit and manage every item on the Maison Noir menu." },
      { property: "og:title", content: "Menu Management — Maison Noir Admin" },
      { property: "og:description", content: "Add, edit and manage every item on the Maison Noir menu." },
    ],
  }),
  component: AdminMenu,
});

function AdminMenu() {
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const menuQuery = useQuery({ queryKey: ["admin-menu"], queryFn: menuService.list });

  const toggleMutation = useMutation({
    mutationFn: (input: { id: string; available: boolean }) =>
      adminService.toggleAvailability(input.id, input.available),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
      notify("Availability updated", { variant: "success" });
    },
    onError: () => notify("Couldn't update availability", { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteMenuItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
      notify("Item deleted", { variant: "success" });
      setPendingDelete(null);
    },
    onError: () => notify("Couldn't delete item", { variant: "error" }),
  });

  const items = useMemo(() => {
    const list = menuQuery.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query),
    );
  }, [menuQuery.data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Menu</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Menu Management</h1>
        </div>
        <Link to="/admin/menu/new" className={buttonVariants({ variant: "accent" })}>
          <Plus className="size-4" /> Add item
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <TextInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search menu items…"
          className="pl-11"
        />
      </div>

      {menuQuery.isLoading ? (
        <MenuGridSkeleton />
      ) : menuQuery.isError ? (
        <ErrorState onRetry={() => void menuQuery.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No items found" description="Try a different search or add a new menu item." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div className="relative aspect-4/3 w-full overflow-hidden">
                <img src={item.image} alt={item.name} className="size-full object-cover" />
                {!item.available ? (
                  <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold text-card">
                    Unavailable
                  </span>
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-xs capitalize text-muted-foreground">{item.category}</p>
                </div>
                <p className="text-sm font-semibold text-accent">{formatCurrency(item.price)}</p>

                <button
                  type="button"
                  onClick={() => toggleMutation.mutate({ id: item._id, available: !item.available })}
                  className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Available
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${item.available ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow-soft transition-transform ${item.available ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                  </span>
                </button>

                <div className="flex gap-2 pt-1">
                  <Link
                    to="/admin/menu/$id"
                    params={{ id: item._id }}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(item)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete._id)}
        title="Delete menu item"
        description={pendingDelete ? `Remove "${pendingDelete.name}" from the menu permanently?` : ""}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
