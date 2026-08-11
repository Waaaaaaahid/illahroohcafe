import { api, USE_MOCK_API } from "@/services/api";
import { mockApi } from "@/lib/mock/mockApi";
import type { CustomerDetails, Order, OrderItem, OrderStatus, PaymentMethod } from "@/lib/types";

export interface CreateOrderInput {
  customerDetails: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
}

/** POST /api/orders, GET /api/orders, GET /api/orders/:id, PUT /api/orders/:id/status */
export const orderService = {
  create: (input: CreateOrderInput) =>
    USE_MOCK_API ? mockApi.createOrder(input) : api.post<Order>("/orders", input),
  listMine: (userId: string) =>
    USE_MOCK_API ? mockApi.listMyOrders(userId) : api.get<Order[]>("/orders/my"),
  listAll: () => (USE_MOCK_API ? mockApi.listOrders() : api.get<Order[]>("/orders")),
  get: (orderId: string) =>
    USE_MOCK_API ? mockApi.getOrder(orderId) : api.get<Order>(`/orders/${orderId}`),
  updateStatus: (orderId: string, orderStatus: OrderStatus) =>
    USE_MOCK_API
      ? mockApi.updateOrderStatus(orderId, orderStatus)
      : api.put<Order>(`/orders/${orderId}/status`, { orderStatus }),
};
