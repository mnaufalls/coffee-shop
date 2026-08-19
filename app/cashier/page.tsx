"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ClipboardText, CurrencyDollar, ShoppingCart } from "@phosphor-icons/react";
import OrderCard, { type Order } from "@/components/cashier/order-card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getWIBDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getWIBHour(dateStr: string) {
  return Number(
    new Date(dateStr).toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    }),
  );
}

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/orders?limit=9999", { credentials: "include", cache: "no-store" });
        const result = await response.json();
        if (cancelled) return;
        if (!response.ok || !result.success) throw new Error(result.message ?? "Failed to fetch orders");
        setOrders(result.data.orders);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const summary = useMemo(() => {
    const todayOrders = orders.filter((o) => getWIBDate(o.createdAt) === todayStr);
    const todaySales = todayOrders.reduce((total, o) => {
      if (o.status === "cancelled") return total;
      return total + Number(o.totalAmount);
    }, 0);
    const pending = todayOrders.filter((o) => o.status === "pending").length;
    const processing = todayOrders.filter((o) => o.status === "processing").length;
    const completed = todayOrders.filter((o) => o.status === "completed").length;
    const cancelled = todayOrders.filter((o) => o.status === "cancelled").length;
    const totalRevenueOrders = todayOrders.filter((o) => o.status !== "cancelled");
    const avgPerOrder = totalRevenueOrders.length > 0 ? todaySales / totalRevenueOrders.length : 0;
    const hourlyData: number[] = Array(24).fill(0);
    todayOrders.forEach((o) => { hourlyData[getWIBHour(o.createdAt)]++; });
    return {
      todayOrders: todayOrders.length,
      todaySales,
      avgPerOrder,
      pending,
      processing,
      completed,
      cancelled,
      hourlyData,
      recentOrders: todayOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }, [orders, todayStr]);

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
        <p className="text-sm font-bold uppercase tracking-wide">Coffee Shop</p>
        <h1 className="mt-2 text-3xl font-black">Cashier Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Monitor today&apos;s orders and sales (WIB).</p>
      </header>

      {error && (
        <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">{error}</div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border-2 border-black bg-yellow-300 p-6 shadow-[5px_5px_0_0_#000]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase">Total Orders (Today)</p>
              <p className="mt-3 text-3xl font-black">{summary.todayOrders}</p>
            </div>
            <ShoppingCart size={42} weight="bold" />
          </div>
        </div>
        <div className="border-2 border-black bg-green-300 p-6 shadow-[5px_5px_0_0_#000]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase">Total Revenue (Today)</p>
              <p className="mt-3 text-3xl font-black">{formatRupiah(summary.todaySales)}</p>
            </div>
            <CurrencyDollar size={42} weight="bold" />
          </div>
        </div>
        <div className="border-2 border-black bg-blue-300 p-6 shadow-[5px_5px_0_0_#000]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase">Average per Order</p>
              <p className="mt-3 text-3xl font-black">{formatRupiah(summary.avgPerOrder)}</p>
            </div>
            <CurrencyDollar size={42} weight="bold" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-2 border-black bg-yellow-200 p-4 shadow-[4px_4px_0_0_#000]">
          <p className="text-xs font-black uppercase">Pending</p>
          <p className="mt-1 text-2xl font-black">{summary.pending}</p>
        </div>
        <div className="border-2 border-black bg-blue-200 p-4 shadow-[4px_4px_0_0_#000]">
          <p className="text-xs font-black uppercase">Processing</p>
          <p className="mt-1 text-2xl font-black">{summary.processing}</p>
        </div>
        <div className="border-2 border-black bg-green-200 p-4 shadow-[4px_4px_0_0_#000]">
          <p className="text-xs font-black uppercase">Completed</p>
          <p className="mt-1 text-2xl font-black">{summary.completed}</p>
        </div>
        <div className="border-2 border-black bg-red-200 p-4 shadow-[4px_4px_0_0_#000]">
          <p className="text-xs font-black uppercase">Cancelled</p>
          <p className="mt-1 text-2xl font-black">{summary.cancelled}</p>
        </div>
      </section>

      <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]">
        <h2 className="mb-4 text-xl font-black">Orders per Hour (Today)</h2>
        <div className="flex items-end gap-1 h-40">
          {summary.hourlyData.map((count, hour) => {
            const maxCount = Math.max(...summary.hourlyData, 1);
            const heightPct = (count / maxCount) * 100;
            return (
              <div key={hour} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold">{count > 0 ? count : ""}</span>
                <div className="w-full bg-orange-400 border border-black min-h-[2px] transition-all" style={{ height: `${Math.max(heightPct, 2)}%` }} />
                <span className="text-[9px] font-bold text-zinc-500">{hour}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Recent Orders (Today)</h2>
            <p className="mt-1 text-sm text-zinc-600">Latest customer orders.</p>
          </div>
          <Link href="/cashier/orders" className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
            <ClipboardText size={18} weight="bold" />
            <span className="hidden sm:inline">View All</span>
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
        {summary.recentOrders.length === 0 ? (
          <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
            <p className="font-bold">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {summary.recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} updating={false} onUpdateStatus={() => {}} showActions={false} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}