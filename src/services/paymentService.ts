import { api, USE_MOCK_API } from "@/services/api";
import { mockApi } from "@/lib/mock/mockApi";
import type { Payment } from "@/lib/types";

/**
 * Razorpay-ready payment service.
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
}

export const paymentService = {
  /** POST /api/payment/create-order — server creates the Razorpay order. */
  createRazorpayOrder: (input: { orderId: string; amount: number }) =>
    USE_MOCK_API
      ? Promise.resolve<RazorpayOrderResponse>({
          razorpayOrderId: `order_MOCK_${input.orderId}`,
          amount: input.amount,
          currency: "INR",
        })
      : api.post<RazorpayOrderResponse>("/payment/create-order", input),

  /** POST /api/payment/verify — server verifies the HMAC signature. */
  verify: (input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    USE_MOCK_API
      ? Promise.resolve({ verified: true })
      : api.post<{ verified: boolean }>("/payment/verify", input),

  /** GET /api/payment — admin ledger. */
  list: () => (USE_MOCK_API ? mockApi.listPayments() : api.get<Payment[]>("/payment")),
};
