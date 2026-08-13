import { api, getStoredSession, API_BASE_URL } from "@/services/api";
import type { CafeSettings, Category, MenuItem, Order, User } from "@/lib/types";

/** Server-computed dashboard statistics (backend /api/admin/stats). */
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  totalUsers: number;
  menuItems: number;
  statusBreakdown: { _id: string; count: number }[];
  topSellingItems: { _id: string; name: string; quantity: number; revenue: number }[];
  recentOrders: Order[];
  revenueSeries: { label: string; revenue: number }[];
}

/** Admin-only mutations. Backend guards these with auth + admin middleware. */
export const adminService = {
  getStats: () => api.get<AdminStats>("/admin/stats"),
  createMenuItem: (input: Omit<MenuItem, "_id" | "createdAt" | "updatedAt">) => api.post<MenuItem>("/menu", input),
  updateMenuItem: (id: string, input: Partial<MenuItem>) => api.put<MenuItem>(`/menu/${id}`, input),
  deleteMenuItem: (id: string) => api.delete<{ _id: string }>(`/menu/${id}`),
  toggleAvailability: (id: string, available: boolean) => api.patch<MenuItem>(`/menu/${id}/availability`, { available }),

  createCategory: (input: Omit<Category, "_id">) => api.post<Category>("/categories", input),
  listCategories: () => api.get<Category[]>("/categories/admin"),
  updateCategory: (id: string, input: Partial<Category>) => api.put<Category>(`/categories/${id}`, input),
  deleteCategory: (id: string) => api.delete<{ _id: string }>(`/categories/${id}`),

  listUsers: () => api.get<User[]>("/users"),
  updateUserRole: (id: string, role: User["role"]) => api.put<User>(`/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete<{ _id: string }>(`/users/${id}`),
  updateSettings: (input: Partial<CafeSettings>) => api.put<CafeSettings>("/cafe/settings", input),

  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append("image", file);
    const token = getStoredSession()?.token;
    const response = await fetch(`${API_BASE_URL}/menu/upload`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error((payload as { message?: string } | null)?.message ?? "Upload failed");
    return (payload?.data ?? payload) as { url: string; publicId: string };
  },
};
