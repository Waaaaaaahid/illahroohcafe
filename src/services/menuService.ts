import { api } from "@/services/api";
import type { CafeSettings, Category, MenuItem } from "@/lib/types";

/** GET /api/menu, /api/categories, GET /api/cafe/settings */
export const menuService = {
  list: (category?: string) => api.get<MenuItem[]>(`/menu${category ? `?category=${encodeURIComponent(category)}` : ""}`, { auth: false }),
  get: (id: string) => api.get<MenuItem>(`/menu/${id}`, { auth: false }),
  categories: () => api.get<Category[]>("/categories", { auth: false }),
  settings: () => api.get<CafeSettings>("/cafe/settings", { auth: false }),
};