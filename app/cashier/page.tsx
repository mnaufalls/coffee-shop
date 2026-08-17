"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ClipboardText,
  CurrencyDollar,
  ShoppingCart,
} from "@phosphor-icons/react";

import SummaryCard from "@/components/cashier/summary-card";
import OrderCard, {
  type Order,
} from "@/components/cashier/order-card";

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/orders", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ?? "Failed to fetch orders",
          );
        }

        setOrders(result.data.orders);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const today = new Date();

    const todayOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt);

      return (
        createdAt.getFullYear() === today.getFullYear() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getDate() === today.getDate()
      );
    });

    const todaySales = todayOrders.reduce(
      (total, order) => {
        if (
          order.status === "cancelled" ||
          order.status === "refunded"
        ) {
          return total;
        }

        return total + Number(order.totalAmount);
      },
      0,
    );

    return {
      pending: orders.filter(
        (order) => order.status === "pending",
      ).length,

      processing: orders.filter(
        (order) => order.status === "processing",
      ).length,

      completed: orders.filter(
        (order) => order.status === "completed",
      ).length,

      cancelled: orders.filter(
        (order) => order.status === "cancelled",
      ).length,

      todayOrders: todayOrders.length,
      todaySales,
    };
  }, [orders]);

  const recentOrders = useMemo(
    () => orders.slice(0, 5),
    [orders],
  );

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <p className="font-bold">Loading dashboard...</p>
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
          Cashier Dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Monitor today&apos;s orders and sales.
        </p>
      </header>

      {error && (
        <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">
          {error}
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Pending"
          value={summary.pending}
        />

        <SummaryCard
          label="Processing"
          value={summary.processing}
        />

        <SummaryCard
          label="Completed"
          value={summary.completed}
        />

        <SummaryCard
          label="Cancelled"
          value={summary.cancelled}
        />
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="border-2 border-black bg-yellow-300 p-6 shadow-[5px_5px_0_0_#000]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase">
                Today&apos;s Sales
              </p>

              <p className="mt-3 text-3xl font-black">
                {formatRupiah(summary.todaySales)}
              </p>
            </div>

            <CurrencyDollar
              size={42}
              weight="bold"
            />
          </div>
        </div>

        <div className="border-2 border-black bg-pink-300 p-6 shadow-[5px_5px_0_0_#000]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase">
                Today&apos;s Orders
              </p>

              <p className="mt-3 text-3xl font-black">
                {summary.todayOrders}
              </p>
            </div>

            <ShoppingCart
              size={42}
              weight="bold"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Latest customer orders.
            </p>
          </div>

          <Link
            href="/cashier/orders"
            className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <ClipboardText
              size={18}
              weight="bold"
            />
            <span className="hidden sm:inline">
              View All
            </span>
            <ArrowRight
              size={18}
              weight="bold"
            />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
            <p className="font-bold">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {recentOrders.map((order) => (
              <OrderCard
  key={order.id}
  order={order}
  updating={false}
  onUpdateStatus={() => {}}
  showActions={false}
/>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}