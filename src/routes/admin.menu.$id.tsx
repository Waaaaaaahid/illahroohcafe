import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menuService";
import { adminService } from "@/services/adminService";
import { useToast } from "@/context/ToastContext";
import { ErrorState, Skeleton } from "@/components/Loading/Loading";
import {
  MenuItemForm,
  emptyMenuItemForm,
  menuItemToForm,
  type MenuItemFormValues,
} from "@/components/admin/MenuItemForm";

export const Route = createFileRoute("/admin/menu/$id")({
  head: () => ({
    meta: [
      { title: "Edit Menu Item — Ilarooh Admin" },
      { name: "description", content: "Update details for an existing Ilarooh menu item." },
      { property: "og:title", content: "Edit Menu Item — Ilarooh Admin" },
      { property: "og:description", content: "Update details for an existing Ilarooh menu item." },
    ],
  }),
  component: AdminMenuEdit,
});

function AdminMenuEdit() {
  const { id } = useParams({ from: "/admin/menu/$id" });
  const navigate = useNavigate();
  const { notify } = useToast();
  const [values, setValues] = useState<MenuItemFormValues>(emptyMenuItemForm);

  const itemQuery = useQuery({ queryKey: ["admin-menu-item", id], queryFn: () => menuService.get(id) });

  useEffect(() => {
    if (itemQuery.data) setValues(menuItemToForm(itemQuery.data));
  }, [itemQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminService.updateMenuItem(id, {
        name: values.name,
        description: values.description,
        price: Number(values.price) || 0,
        category: values.category,
        image: values.image,
        available: values.available,
        popular: values.popular,
        vegetarian: values.vegetarian,
      }),
    onSuccess: () => {
      notify("Menu item updated", { variant: "success" });
      void navigate({ to: "/admin/menu" });
    },
    onError: () => notify("Couldn't update menu item", { variant: "error" }),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="eyebrow text-accent">Menu</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Edit Menu Item</h1>
      </div>

      {itemQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : itemQuery.isError || !itemQuery.data ? (
        <ErrorState
          title="Item not found"
          description="This menu item may have been removed."
          onRetry={() => void itemQuery.refetch()}
        />
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <MenuItemForm
            values={values}
            onChange={setValues}
            onSubmit={() => updateMutation.mutate()}
            submitting={updateMutation.isPending}
            submitLabel="Save changes"
          />
        </div>
      )}
    </div>
  );
}
