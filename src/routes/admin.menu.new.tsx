import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { useToast } from "@/context/ToastContext";
import { MenuItemForm, emptyMenuItemForm, type MenuItemFormValues } from "@/components/admin/MenuItemForm";

export const Route = createFileRoute("/admin/menu/new")({
  head: () => ({
    meta: [
      { title: "Add Menu Item — Maison Noir Admin" },
      { name: "description", content: "Create a new item for the Maison Noir menu." },
      { property: "og:title", content: "Add Menu Item — Maison Noir Admin" },
      { property: "og:description", content: "Create a new item for the Maison Noir menu." },
    ],
  }),
  component: AdminMenuNew,
});

function AdminMenuNew() {
  const [values, setValues] = useState<MenuItemFormValues>(emptyMenuItemForm);
  const navigate = useNavigate();
  const { notify } = useToast();

  const createMutation = useMutation({
    mutationFn: () =>
      adminService.createMenuItem({
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
      notify("Menu item created", { variant: "success" });
      void navigate({ to: "/admin/menu" });
    },
    onError: () => notify("Couldn't create menu item", { variant: "error" }),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="eyebrow text-accent">Menu</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Add Menu Item</h1>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <MenuItemForm
          values={values}
          onChange={setValues}
          onSubmit={() => createMutation.mutate()}
          submitting={createMutation.isPending}
          submitLabel="Create item"
        />
      </div>
    </div>
  );
}
