import { api } from "@/services/api";

export interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startsAt: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
  createdAt: string;
}

export interface CouponValidation {
  code: string;
  discount: number;
  subtotal: number;
  totalAfterDiscount: number;
}

export const couponService = {
  validate: (code: string, subtotal: number) =>
    api.post<CouponValidation>("/coupons/validate", { code, subtotal }),
  list: () => api.get<Coupon[]>("/coupons"),
  create: (input: Partial<Coupon>) => api.post<Coupon>("/coupons", input),
  update: (id: string, input: Partial<Coupon>) => api.put<Coupon>(`/coupons/${id}`, input),
  remove: (id: string) => api.delete<{ _id: string }>(`/coupons/${id}`),
};
