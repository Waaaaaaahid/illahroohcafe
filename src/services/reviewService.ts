import { api } from "@/services/api";

export interface Review {
  _id: string;
  user: { _id: string; name: string; email?: string };
  item: { _id: string; name: string } | string;
  order: { _id: string; code: string } | string;
  rating: number;
  comment?: string;
  visible: boolean;
  createdAt: string;
}

export interface ItemReviews { reviews: Review[]; count: number; average: number; }

export const reviewService = {
  listForItem: (itemId: string) => api.get<ItemReviews>(`/reviews/item/${itemId}`, { auth: false }),
  create: (input: { orderId: string; itemId: string; rating: number; comment?: string }) => api.post<Review>("/reviews", input),
  listAdmin: () => api.get<Review[]>("/reviews/admin"),
  setVisibility: (id: string, visible: boolean) => api.patch<Review>(`/reviews/${id}/visibility`, { visible }),
  remove: (id: string) => api.delete<{ _id: string }>(`/reviews/${id}`),
};
