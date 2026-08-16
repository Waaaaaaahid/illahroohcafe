import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { API_BASE_URL, getStoredSession } from "@/services/api";

type AdminOrderEvent = {
  type?: "new-order" | "order-updated" | "initial-order";
  order?: {
    _id?: string;
    code?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    totalAmount?: number;
    customerDetails?: { name?: string };
  };
};

export function AdminLiveUpdates() {
  const { isAdmin, isReady } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isReady || !isAdmin) return;

    let closed = false;
    let controller: AbortController | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = async () => {
      if (closed) return;
      controller = new AbortController();
      const token = getStoredSession()?.token;

      try {
        const response = await fetch(`${API_BASE_URL}/orders/admin/events`, {
          headers: {
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) throw new Error(`Live updates failed (${response.status})`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!closed) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const chunk = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const dataLine = chunk.split(/\r?\n/).find((line) => line.startsWith("data:"));
            if (!dataLine) continue;

            try {
              const event = JSON.parse(dataLine.slice(5).trim()) as AdminOrderEvent;
              if (!event.order || !event.type || event.type === "initial-order") continue;

              // Refresh every mounted admin query without requiring navigation or a manual refresh.
              await queryClient.invalidateQueries();

              if (event.type === "new-order") {
                const customer = event.order.customerDetails?.name || "Customer";
                const code = event.order.code ? `#${event.order.code}` : "";
                const isPaidOnline = event.order.paymentMethod === "online" && event.order.paymentStatus === "paid";
                notify(
                  isPaidOnline ? "Online payment received" : "New order received",
                  {
                    description: `${customer} ${code}${isPaidOnline ? " • Payment verified" : ""}`.trim(),
                    variant: "success",
                  },
                );
              }
            } catch {
              // Ignore malformed SSE messages and keep the live connection alive.
            }
          }
        }
      } catch {
        if (closed) return;
      }

      if (!closed) reconnectTimer = setTimeout(connect, 3000);
    };

    void connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      controller?.abort();
    };
  }, [isAdmin, isReady, notify, queryClient]);

  return null;
}
