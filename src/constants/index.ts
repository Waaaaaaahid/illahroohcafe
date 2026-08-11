import type { OrderStatus } from "@/lib/types";

export const APP_NAME = "Maison Noir";

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export const ADMIN_LINKS = [
  { label: "Dashboard", to: "/admin" },
  { label: "Menu", to: "/admin/menu" },
  { label: "Categories", to: "/admin/categories" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Users", to: "/admin/users" },
  { label: "Payments", to: "/admin/payments" },
  { label: "Cafe Settings", to: "/admin/settings" },
] as const;

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Completed",
];

export const STORAGE_KEYS = {
  cart: "cafe.cart.v1",
  session: "cafe.session.v1",
  lastOrder: "cafe.lastOrder.v1",
} as const;
