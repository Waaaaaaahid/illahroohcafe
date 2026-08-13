import { api, getStoredSession, API_BASE_URL } from "@/services/api";
import type { CafeSettings, Category, MenuItem, User } from "@/lib/types";

/** Admin-only mutations. Backend guards these with auth + admin middleware. */
export const adminService = {
  createMenuItem: (input: Omit<MenuItem, "_id" | "createdAt" | "updatedAt">) =>
    api.post<MenuItem>("/menu", input),
  updateMenuItem: (id: string, input: Partial<MenuItem>) =>
    api.put<MenuItem>(`/menu/${id}`, input),
  deleteMenuItem: (id: string) =>
    api.delete<{ _id: string }>(`/menu/${id}`),
  toggleAvailability: (id: string, available: boolean) =>
    api.patch<MenuItem>(`/menu/${id}/availability`, { available }),

  createCategory: (input: Omit<Category, "_id">) =>
    api.post<Category>("/categories", input),
  updateCategory: (id: string, input: Partial<Category>) =>
    api.put<Category>(`/categories/${id}`, input),
  deleteCategory: (id: string) =>
    api.delete<{ _id: string }>(`/categories/${id}`),

  listUsers: () => api.get<User[]>("/users"),
  updateUserRole: (id: string, role: User["role"]) =>
    api.put<User>(`/users/${id}/role`, { role }),
  deleteUser: (id: string) =>
    api.delete<{ _id: string }>(`/users/${id}`),

  updateSettings: (input: Partial<CafeSettings>) =>
    api.put<CafeSettings>("/cafe/settings", input),

  /**
   * Image upload for menu items. Backend: POST /api/menu/upload with multer;
   * stored on Cloudinary and returns { url, publicId }.
   */
  uploadImage: async (file: File) => {
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
      throw new Error((payload as { message?: string } | null)?.message ?? "Upload failed");
    }

    return (payload?.data ?? payload) as { url: string; publicId: string };
  },
};