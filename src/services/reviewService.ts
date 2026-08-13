import { api } from "@/services/api";

export interface Review {
  _id: string;
  user?: { _id: string; name: string; email?: string } | null;
  item?: { _id: string; name: string } | string | null;
  order?: { _id: string; code: string } | string | null;
  rating: number;
  comment?: string;
  authorName?: string;
  authorRole?: string;
  source: "customer" | "admin";
  visible: boolean;
  createdAt: string;
}

export interface ItemReviews { reviews: Review[]; count: number; average: number; }

export const reviewService = {
  listForItem: (itemId: string) => api.get<ItemReviews>(`/reviews/item/${itemId}`, { auth: false }),
  listFeatured: () => api.get<Review[]>("/reviews/featured", { auth: false }),
  create: (input: { orderId: string; itemId: string; rating: number; comment?: string }) => api.post<Review>("/reviews", input),
  listAdmin: () => api.get<Review[]>("/reviews/admin"),
  createAdmin: (input: { name: string; role?: string; rating: number; comment: string }) => api.post<Review>("/reviews/admin", input),
  setVisibility: (id: string, visible: boolean) => api.patch<Review>(`/reviews/${id}/visibility`, { visible }),
  remove: (id: string) => api.delete<{ _id: string }>(`/reviews/${id}`),
};
