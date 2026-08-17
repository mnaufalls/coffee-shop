"use client";

import { useEffect, useMemo, useState } from "react";

import OrdersList from "@/components/cashier/orders-list";
import type {
  Order,
  OrderStatus,
} from "@/components/cashier/order-card";

type FilterStatus =
  | "all"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

const filters: {
  value: FilterStatus;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CashierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] =
    useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to fetch orders",
        );
      }

      setOrders(result.data.orders);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch orders",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        const response = await fetch(
          "/api/admin/orders",
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (cancelled) return;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ?? "Failed to fetch orders",
          );
        }

        setOrders(result.data.orders);
      } catch (error) {
        if (cancelled) return;

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch orders",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ) {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to update order",
        );
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? result.data.order
            : order,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        filter === "all" ||
        order.status === filter;

      if (!normalizedSearch) {
        return matchesStatus;
      }

      const orderId = order.id.toLowerCase();
      const customerName =
        order.customer?.name.toLowerCase() ?? "";

      return (
        matchesStatus &&
        (orderId.includes(normalizedSearch) ||
          customerName.includes(normalizedSearch))
      );
    });
  }, [orders, filter, search]);

  async function handleRefresh() {
    setIsLoading(true);
    await loadOrders();
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <p className="font-bold">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide">
          Coffee Shop
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Orders
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Manage and process customer orders.
        </p>
      </header>

      {error && (
        <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">
          {error}
        </div>
      )}

      <section className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => {
              const active =
                filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setFilter(item.value)
                  }
                  className={`border-2 border-black px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all ${
                    active
                      ? "bg-yellow-300"
                      : "bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search order ID or customer..."
            className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium outline-none focus:bg-orange-50"
          />
        </div>
      </section>

      <section className="flex items-center justify-between">
        <h2 className="text-2xl font-black">
          {filter === "all"
            ? "All Orders"
            : `${filters.find(
                (item) => item.value === filter,
              )?.label} Orders`}
        </h2>

        <span className="border-2 border-black bg-pink-300 px-3 py-1 text-sm font-black">
          {filteredOrders.length}
        </span>
      </section>

      <OrdersList
        orders={filteredOrders}
        updatingId={updatingId}
        onUpdateStatus={updateOrderStatus}
      />
    </main>
  );
}