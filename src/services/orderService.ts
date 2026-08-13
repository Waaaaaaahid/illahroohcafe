import {
  api,
  API_BASE_URL,
  getStoredSession,
} from "@/services/api";
import type {
  CustomerDetails,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/lib/types";

export interface CreateOrderInput {
  customerDetails: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
}

type OrderEvent = {
  type: "new-order" | "order-updated" | "initial-order";
  order: Order;
};

export const orderService = {
  create: (input: CreateOrderInput) =>
    api.post<Order>("/orders", input),

  listMine: (userId: string) =>
    api.get<Order[]>("/orders/my"),

  listAll: () =>
    api.get<Order[]>("/orders"),

  get: (orderId: string) =>
    api.get<Order>(`/orders/${orderId}`),

  updateStatus: (orderId: string, orderStatus: OrderStatus) =>
    api.put<Order>(`/orders/${orderId}/status`, { orderStatus }),

  // Customer realtime order updates
  subscribeOrder: (
    orderId: string,
    onOrder: (order: Order) => void
  ): (() => void) => {
    let closed = false;
    let controller: AbortController | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = async () => {
      if (closed) return;

      controller = new AbortController();

      const token = getStoredSession()?.token;

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}/events`,
          {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
            signal: controller.signal,
          }
        );

        if (!response.ok || !response.body) {
          throw new Error(`Events failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (!closed) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, {
            stream: true,
          });

          let boundary: number;

          while (
            (boundary = buffer.indexOf("\n\n")) !== -1
          ) {
            const chunk = buffer.slice(0, boundary);

            buffer = buffer.slice(boundary + 2);

            const dataLine = chunk
              .split(/\r?\n/)
              .find((line) => line.startsWith("data:"));

            if (!dataLine) continue;

            try {
              const event = JSON.parse(
                dataLine.slice(5).trim()
              ) as OrderEvent;

              if (event?.order) {
                onOrder(event.order);
              }
            } catch {
              // Ignore malformed SSE data
            }
          }
        }
      } catch {
        if (closed) return;
      }

      if (!closed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    void connect();

    return () => {
      closed = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      controller?.abort();
    };
  },

  // Admin realtime order stream
  subscribeAdminOrders: (
    onEvent: (event: OrderEvent) => void
  ): (() => void) => {
    let closed = false;
    let controller: AbortController | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = async () => {
      if (closed) return;

      controller = new AbortController();

      const token = getStoredSession()?.token;

      try {
        // IMPORTANT:
        // Backend route is /orders/admin/events
        const response = await fetch(
          `${API_BASE_URL}/orders/admin/events`,
          {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
            signal: controller.signal,
          }
        );

        if (!response.ok || !response.body) {
          throw new Error(
            `Admin events failed (${response.status})`
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (!closed) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, {
            stream: true,
          });

          let boundary: number;

          while (
            (boundary = buffer.indexOf("\n\n")) !== -1
          ) {
            const chunk = buffer.slice(0, boundary);

            buffer = buffer.slice(boundary + 2);

            const dataLine = chunk
              .split(/\r?\n/)
              .find((line) => line.startsWith("data:"));

            if (!dataLine) continue;

            try {
              const event = JSON.parse(
                dataLine.slice(5).trim()
              ) as OrderEvent;

              if (
                event?.type === "new-order" ||
                event?.type === "order-updated" ||
                event?.type === "initial-order"
              ) {
                onEvent(event);
              }
            } catch {
              // Ignore malformed SSE data
            }
          }
        }
      } catch {
        if (closed) return;
      }

      if (!closed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    void connect();

    return () => {
      closed = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      controller?.abort();
    };
  },
};