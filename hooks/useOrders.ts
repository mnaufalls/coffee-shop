import { useState, useCallback } from "react";
import type { Order, OrderStatus } from "@/components/cashier/order-card";

type UseOrdersOptions = {
  pageSize?: number;
};

export function useOrders(options: UseOrdersOptions = {}) {
  const { pageSize = 10 } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page: number) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await fetch(
        `/api/admin/orders?page=${page}&limit=${pageSize}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Failed to fetch orders");
      }

      setOrders(result.data.orders);
      setTotalPages(result.data.meta.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      try {
        setUpdatingId(orderId);
        setError("");

        const response = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status, note }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? "Failed to update order");
        }

        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? result.data.order : order
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update order");
        throw err;
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  return {
    orders,
    isLoading,
    error,
    totalPages,
    updatingId,
    fetchOrders,
    updateOrderStatus,
  };
}