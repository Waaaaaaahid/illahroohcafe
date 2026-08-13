import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/AppButton";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/Modal/Modal";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/Loading/Loading";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({ head: () => ({ meta: [{ title: "Categories — Ilarooh Admin" }] }), component: AdminCategories });
interface CategoryFormValues { name: string; slug: string; description: string; image: string; active: boolean; }
const emptyForm: CategoryFormValues = { name: "", slug: "", description: "", image: "", active: true };

function AdminCategories() {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CategoryFormValues>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: adminService.listCategories });
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); void queryClient.invalidateQueries({ queryKey: ["categories"] }); };
  const createMutation = useMutation({ mutationFn: () => adminService.createCategory(form), onSuccess: () => { refresh(); notify("Category created", { variant: "success" }); setCreating(false); }, onError: () => notify("Couldn't create category", { variant: "error" }) });
  const updateMutation = useMutation({ mutationFn: (id: string) => adminService.updateCategory(id, form), onSuccess: () => { refresh(); notify("Category updated", { variant: "success" }); setEditing(null); }, onError: () => notify("Couldn't update category", { variant: "error" }) });
  const toggleMutation = useMutation({ mutationFn: (category: Category) => adminService.updateCategory(category._id, { active: !category.active }), onSuccess: () => { refresh(); notify("Category visibility updated", { variant: "success" }); }, onError: () => notify("Couldn't update category", { variant: "error" }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => adminService.deleteCategory(id), onSuccess: () => { refresh(); notify("Category deleted", { variant: "success" }); setPendingDelete(null); }, onError: () => notify("Couldn't delete category", { variant: "error" }) });
  const openEdit = (category: Category) => { setEditing(category); setForm({ name: category.name, slug: category.slug, description: category.description, image: category.image, active: category.active }); };
  const isSaving = createMutation.isPending || updateMutation.isPending;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow text-accent">Menu</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Categories</h1></div><Button variant="accent" onClick={() => { setForm(emptyForm); setCreating(true); }}><Plus className="size-4" /> New category</Button></div>
    {categoriesQuery.isLoading ? <TableSkeleton /> : categoriesQuery.isError ? <ErrorState onRetry={() => void categoriesQuery.refetch()} /> : (categoriesQuery.data ?? []).length === 0 ? <EmptyState title="No categories yet" description="Create your first category to organise the menu." /> : <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><th className="px-5 py-3 font-semibold">Name</th><th className="hidden px-5 py-3 font-semibold sm:table-cell">Description</th><th className="px-5 py-3 font-semibold">Active</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody>{(categoriesQuery.data ?? []).map((category) => <tr key={category._id} className="border-b border-border last:border-0"><td className="px-5 py-3 font-medium text-foreground">{category.name}</td><td className="hidden max-w-xs truncate px-5 py-3 text-muted-foreground sm:table-cell">{category.description}</td><td className="px-5 py-3"><button type="button" aria-label={`Toggle ${category.name}`} disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate(category)} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${category.active ? "bg-primary" : "bg-muted"}`}><span className={`block size-4 rounded-full bg-card shadow-soft transition-transform ${category.active ? "translate-x-[18px]" : "translate-x-[2px]"}`} /></button></td><td className="px-5 py-3"><div className="flex justify-end gap-2"><Button variant="outline" size="icon" onClick={() => openEdit(category)}><Pencil className="size-4" /></Button><Button variant="destructive" size="icon" onClick={() => setPendingDelete(category)}><Trash2 className="size-4" /></Button></div></td></tr>)}</tbody></table></div>}
    <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? "Edit category" : "New category"} footer={<><Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button><Button variant="accent" loading={isSaving} onClick={() => editing ? updateMutation.mutate(editing._id) : createMutation.mutate()}>{editing ? "Save changes" : "Create category"}</Button></>}><div className="space-y-4"><Field id="cat-name" label="Name"><TextInput id="cat-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field id="cat-slug" label="Slug"><TextInput id="cat-slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="coffee" /></Field><Field id="cat-description" label="Description"><TextArea id="cat-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><Field id="cat-image" label="Image URL"><TextInput id="cat-image" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></Field></div></Modal>
    <ConfirmModal open={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete._id)} title="Delete category" description={pendingDelete ? `Remove "${pendingDelete.name}" permanently?` : ""} loading={deleteMutation.isPending} />
  </div>;
}
