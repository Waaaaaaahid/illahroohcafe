import { api, USE_MOCK_API, API_BASE_URL, getStoredSession } from "@/services/api";
import { mockApi } from "@/lib/mock/mockApi";
import type { CafeSettings, Category, MenuItem, User } from "@/lib/types";

/** Admin-only mutations. Backend guards these with auth + admin middleware. */
export const adminService = {
  createMenuItem: (input: Omit<MenuItem, "_id" | "createdAt" | "updatedAt">) =>
    USE_MOCK_API ? mockApi.createMenuItem(input) : api.post<MenuItem>("/menu", input),
  updateMenuItem: (id: string, input: Partial<MenuItem>) =>
    USE_MOCK_API ? mockApi.updateMenuItem(id, input) : api.put<MenuItem>(`/menu/${id}`, input),
  deleteMenuItem: (id: string) =>
    USE_MOCK_API ? mockApi.deleteMenuItem(id) : api.delete<{ _id: string }>(`/menu/${id}`),
  toggleAvailability: (id: string, available: boolean) =>
    USE_MOCK_API
      ? mockApi.updateMenuItem(id, { available })
      : api.patch<MenuItem>(`/menu/${id}/availability`, { available }),

  createCategory: (input: Omit<Category, "_id">) =>
    USE_MOCK_API ? mockApi.createCategory(input) : api.post<Category>("/categories", input),
  updateCategory: (id: string, input: Partial<Category>) =>
    USE_MOCK_API ? mockApi.updateCategory(id, input) : api.put<Category>(`/categories/${id}`, input),
  deleteCategory: (id: string) =>
    USE_MOCK_API ? mockApi.deleteCategory(id) : api.delete<{ _id: string }>(`/categories/${id}`),

  listUsers: () => (USE_MOCK_API ? mockApi.listUsers() : api.get<User[]>("/users")),
  updateUserRole: (id: string, role: User["role"]) =>
    USE_MOCK_API ? mockApi.updateUserRole(id, role) : api.put<User>(`/users/${id}/role`, { role }),
  deleteUser: (id: string) =>
    USE_MOCK_API ? mockApi.deleteUser(id) : api.delete<{ _id: string }>(`/users/${id}`),

  updateSettings: (input: Partial<CafeSettings>) =>
    USE_MOCK_API ? mockApi.updateSettings(input) : api.put<CafeSettings>("/cafe/settings", input),

  /** Upload menu image through the same API base used everywhere else. */
  uploadImage: async (file: File) => {
    if (USE_MOCK_API) return { url: URL.createObjectURL(file), publicId: "mock_public_id" };

    if (!API_BASE_URL) throw new Error("Backend API URL is not configured");

    const form = new FormData();
    form.append("image", file);
    const token = getStoredSession()?.token;

    const response = await fetch(`${API_BASE_URL}/menu/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || "Upload failed");
    }

    return (payload?.data ?? payload) as { url: string; publicId: string };
  },
};
