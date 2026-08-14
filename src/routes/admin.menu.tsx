import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { menuService } from "@/services/menuService";
import { adminService } from "@/services/adminService";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/AppButton";
import { TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/Modal/Modal";
import { EmptyState, ErrorState, MenuGridSkeleton } from "@/components/Loading/Loading";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { MenuItemForm, emptyMenuItemForm, menuItemToForm, type MenuItemFormValues } from "@/components/admin/MenuItemForm";
import type { MenuItem } from "@/lib/types";

export const Route = createFileRoute("/admin/menu")({ head: () => ({ meta: [{ title: "Menu Management — Ilarooh Admin" }] }), component: AdminMenu });

function AdminMenu() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const [itemModal, setItemModal] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemFormValues>(emptyMenuItemForm);
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const menuQuery = useQuery({ queryKey: ["admin-menu"], queryFn: menuService.list });
  const refreshMenu = () => { void queryClient.invalidateQueries({ queryKey: ["admin-menu"] }); void queryClient.invalidateQueries({ queryKey: ["menu"] }); void queryClient.invalidateQueries({ queryKey: ["categories"] }); void queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); };
  const toggleMutation = useMutation({ mutationFn: (input: { id: string; available: boolean }) => adminService.toggleAvailability(input.id, input.available), onSuccess: () => { refreshMenu(); notify("Availability updated", { variant: "success" }); }, onError: () => notify("Couldn't update availability", { variant: "error" }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => adminService.deleteMenuItem(id), onSuccess: () => { refreshMenu(); notify("Item deleted", { variant: "success" }); setPendingDelete(null); }, onError: () => notify("Couldn't delete item", { variant: "error" }) });
  const createMutation = useMutation({ mutationFn: () => adminService.createMenuItem({ name: form.name, description: form.description, price: Number(form.price) || 0, category: form.category, image: form.image, available: form.available, popular: form.popular, vegetarian: form.vegetarian }), onSuccess: () => { refreshMenu(); notify("Menu item created", { variant: "success" }); closeItemModal(); }, onError: () => notify("Couldn't create menu item", { variant: "error" }) });
  const updateMutation = useMutation({ mutationFn: () => editingItem ? adminService.updateMenuItem(editingItem._id, { name: form.name, description: form.description, price: Number(form.price) || 0, category: form.category, image: form.image, available: form.available, popular: form.popular, vegetarian: form.vegetarian }) : Promise.reject(new Error("No item selected")), onSuccess: () => { refreshMenu(); notify("Menu item updated", { variant: "success" }); closeItemModal(); }, onError: () => notify("Couldn't update menu item", { variant: "error" }) });
  const categories = useMemo(() => [...new Set((menuQuery.data ?? []).map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [menuQuery.data]);
  const items = useMemo(() => { const list = menuQuery.data ?? []; const query = search.trim().toLowerCase(); return list.filter((item) => { const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query); const matchesCategory = categoryFilter === "all" || item.category === categoryFilter; return matchesSearch && matchesCategory; }); }, [menuQuery.data, search, categoryFilter]);
  const openCreate = () => { setEditingItem(null); setForm({ ...emptyMenuItemForm }); setItemModal("create"); };
  const openEdit = (item: MenuItem) => { setEditingItem(item); setForm(menuItemToForm(item)); setItemModal("edit"); };
  function closeItemModal() { setItemModal(null); setEditingItem(null); setForm({ ...emptyMenuItemForm }); }
  const saving = createMutation.isPending || updateMutation.isPending;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow text-accent">Menu</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Menu Management</h1></div><Button variant="accent" onClick={openCreate}><Plus className="size-4" /> Add item</Button></div>
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu items..." className="pl-11" /></div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"><option value="all">All Categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
    {menuQuery.isLoading ? <MenuGridSkeleton /> : menuQuery.isError ? <ErrorState onRetry={() => void menuQuery.refetch()} /> : items.length === 0 ? <EmptyState title="No items found" description="Try a different search or category filter, or add a new menu item." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => <div key={item._id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"><div className="relative aspect-4/3 w-full overflow-hidden"><img src={item.image} alt={item.name} className="size-full object-cover" />{!item.available ? <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold text-card">Unavailable</span> : null}</div><div className="space-y-3 p-4"><div><h3 className="font-semibold text-foreground">{item.name}</h3><p className="text-xs capitalize text-muted-foreground">{item.category}</p></div><p className="text-sm font-semibold text-accent">{formatCurrency(item.price)}</p><button type="button" onClick={() => toggleMutation.mutate({ id: item._id, available: !item.available })} className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary">Available<span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${item.available ? "bg-primary" : "bg-muted"}`}><span className={`block size-4 rounded-full bg-card shadow-soft transition-transform ${item.available ? "translate-x-[18px]" : "translate-x-[2px]"}`} /></span></button><div className="flex gap-2 pt-1"><Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(item)}><Pencil className="size-3.5" /> Edit</Button><Button variant="destructive" size="sm" onClick={() => setPendingDelete(item)}><Trash2 className="size-3.5" /></Button></div></div></div>)}</div>}
    <Modal open={itemModal !== null} onClose={closeItemModal} title={itemModal === "edit" ? `Edit ${editingItem?.name ?? "menu item"}` : "Add menu item"}><MenuItemForm values={form} onChange={setForm} onSubmit={() => itemModal === "edit" ? updateMutation.mutate() : createMutation.mutate()} submitting={saving} submitLabel={itemModal === "edit" ? "Save changes" : "Add item"} /></Modal>
    <ConfirmModal open={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete._id)} title="Delete menu item" description={pendingDelete ? `Remove "${pendingDelete.name}" from the menu permanently?` : ""} loading={deleteMutation.isPending} />
  </div>;
}
