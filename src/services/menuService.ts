import { api, USE_MOCK_API } from "@/services/api";
import { mockApi } from "@/lib/mock/mockApi";
import type { CafeSettings, Category, MenuItem } from "@/lib/types";

/** GET/POST/PUT/DELETE /api/menu, /api/categories, GET /api/cafe/settings */
export const menuService = {
  list: () => (USE_MOCK_API ? mockApi.listMenu() : api.get<MenuItem[]>("/menu", { auth: false })),
  get: (id: string) =>
    USE_MOCK_API ? mockApi.getMenuItem(id) : api.get<MenuItem>(`/menu/${id}`, { auth: false }),
  categories: () =>
    USE_MOCK_API ? mockApi.listCategories() : api.get<Category[]>("/categories", { auth: false }),
  settings: () =>
    USE_MOCK_API ? mockApi.getSettings() : api.get<CafeSettings>("/cafe/settings", { auth: false }),
};
