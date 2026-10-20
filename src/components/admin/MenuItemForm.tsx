import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/AppButton";
import { menuService } from "@/services/menuService";
import { adminService } from "@/services/adminService";
import { useToast } from "@/context/ToastContext";
import type { MenuItem } from "@/lib/types";

export interface MenuItemFormValues {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  brand: string;
  stock: string;
  badge: string;
  category: string;
  image: string;
  available: boolean;
  popular: boolean;
  vegetarian: boolean;
}

export const emptyMenuItemForm: MenuItemFormValues = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  brand: "",
  stock: "0",
  badge: "",
  category: "",
  image: "",
  available: true,
  popular: false,
  vegetarian: false,
};

export function menuItemToForm(item: MenuItem): MenuItemFormValues {
  return {
    name: item.name,
    description: item.description,
    price: String(item.price),
    compareAtPrice: item.compareAtPrice == null ? "" : String(item.compareAtPrice),
    sku: item.sku ?? "",
    brand: item.brand ?? "",
    stock: String(item.stock ?? 0),
    badge: item.badge ?? "",
    category: item.category,
    image: item.image,
    available: item.available,
    popular: item.popular,
    vegetarian: item.vegetarian,
  };
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {label}
      <span
        className={`relative block h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute left-0.5 top-0.5 block size-5 rounded-full bg-card shadow-soft transition-[left] duration-200 ease-out ${checked ? "left-5" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

export function MenuItemForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
}: {
  values: MenuItemFormValues;
  onChange: (values: MenuItemFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: menuService.categories });

  const set = <K extends keyof MenuItemFormValues>(key: K, value: MenuItemFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminService.uploadImage(file);
      set("image", result.url);
    } catch (error) {
      notify("Image upload failed", {
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Item name">
          <TextInput id="name" required value={values.name} onChange={(event) => set("name", event.target.value)} placeholder="Minimal Desk Lamp" />
        </Field>
        <Field id="price" label="Price (INR)">
          <TextInput id="price" required type="number" min={0} step="0.01" value={values.price} onChange={(event) => set("price", event.target.value)} placeholder="699" />
        </Field>
      </div>

      <Field id="description" label="Description">
        <TextArea id="description" required value={values.description} onChange={(event) => set("description", event.target.value)} placeholder="Product details and key features." />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="compareAtPrice" label="Original price (optional)">
          <TextInput id="compareAtPrice" type="number" min={0} step="0.01" value={values.compareAtPrice} onChange={(event) => set("compareAtPrice", event.target.value)} placeholder="999" />
        </Field>
        <Field id="stock" label="Stock quantity">
          <TextInput id="stock" type="number" min={0} step="1" value={values.stock} onChange={(event) => set("stock", event.target.value)} placeholder="25" />
        </Field>
        <Field id="sku" label="SKU / product code">
          <TextInput id="sku" value={values.sku} onChange={(event) => set("sku", event.target.value)} placeholder="ZRC-LAMP-001" />
        </Field>
        <Field id="brand" label="Brand (optional)">
          <TextInput id="brand" value={values.brand} onChange={(event) => set("brand", event.target.value)} placeholder="Zrcart" />
        </Field>
        <Field id="badge" label="Product badge (optional)">
          <TextInput id="badge" value={values.badge} onChange={(event) => set("badge", event.target.value)} placeholder="Bestseller / New" />
        </Field>
      </div>

      <Field id="category" label="Category">
        <Select id="category" required value={values.category} onChange={(event) => set("category", event.target.value)}>
          <option value="" disabled>Select a category</option>
          {(categoriesQuery.data ?? []).map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}
        </Select>
      </Field>

      <Field id="image" label="Image URL" hint="Paste a URL or upload a file below">
        <div className="flex flex-col gap-3 sm:flex-row">
          <TextInput id="image" value={values.image} onChange={(event) => set("image", event.target.value)} placeholder="https://example.com/product-image.jpg" />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
            <ImagePlus className="size-4" aria-hidden />
            {uploading ? "Uploading…" : "Upload"}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </label>
        </div>
        {values.image ? <img src={values.image} alt="Preview" className="mt-3 h-32 w-full rounded-xl object-cover" /> : null}
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <SwitchRow label="Available" checked={values.available} onChange={(value) => set("available", value)} />
        <SwitchRow label="Feature on homepage" checked={values.popular} onChange={(value) => set("popular", value)} />
        
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="accent" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
