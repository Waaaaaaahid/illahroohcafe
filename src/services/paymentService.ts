import { api } from "@/services/api";
import type { Payment } from "@/lib/types";

/**
 * Razorpay payment service.
 *
 * SECURITY: only the publishable key id may ever reach the browser
 * (VITE_RAZORPAY_KEY_ID). RAZORPAY_KEY_SECRET lives exclusively on the
 * Express server — see backend/services/paymentService.js.
 */
export const RAZORPAY_KEY_ID: string =
  (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string | undefined) ?? "";

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  paymentId: string;
}

export const paymentService = {
  /** POST /api/payment/create-order — server creates the Razorpay order. */
  createRazorpayOrder: (input: { orderId: string; amount: number }) =>
    api.post<RazorpayOrderResponse>("/payment/create-order", input),

  /** POST /api/payment/verify — server verifies the HMAC signature. */
  verify: (input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post<{ verified: boolean }>("/payment/verify", input),

  /** GET /api/payment — admin ledger. */
  list: () => api.get<Payment[]>("/payment"),
};