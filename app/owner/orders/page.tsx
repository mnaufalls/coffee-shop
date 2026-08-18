"use client";

import { useEffect, useState } from "react";
import { ClipboardText, MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Order {
  id: string;
  orderType: string;
  subtotal: string;
  discountAmount: string;
  taxPercentage: string;
  taxAmount: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string; phoneNumber: string } | null;
  cashier: { id: string; name: string; email: string } | null;
  orderDetails: { id: string; productId: string; productName: string; price: string; quantity: number; subtotal: string }[];
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-300",
  processing: "bg-blue-300",
  completed: "bg-green-300",
  cancelled: "bg-red-300",
  refunded: "bg-gray-300",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page: String(page), limit: "10" });
        const res = await fetch(`/api/admin/orders?${params}`, { credentials: "include", cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) throw new Error(json.message ?? "Failed to fetch orders");
        setOrders(json.data.orders);
        setMeta(json.data.meta);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [page]);

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !(o.customer?.name ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <div className="flex items-center gap-3">
          <ClipboardText size={28} weight="bold" />
          <h1 className="text-3xl font-black font-[family-name:var(--font-bricolage)] uppercase">Orders</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">View all orders across the system.</p>
      </header>

      {error && (
        <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-black bg-white py-2 pl-9 pr-4 text-sm font-bold outline-none focus:bg-orange-50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-2 border-black bg-white px-4 py-2 text-sm font-bold outline-none focus:bg-orange-50"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {isLoading ? (
        <p className="font-bold">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
          <p className="font-bold">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-black bg-yellow-300">
              <tr>
                <th className="px-4 py-3 font-black uppercase">Order ID</th>
                <th className="px-4 py-3 font-black uppercase">Customer</th>
                <th className="px-4 py-3 font-black uppercase">Date</th>
                <th className="px-4 py-3 font-black uppercase">Status</th>
                <th className="px-4 py-3 font-black uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-zinc-200 last:border-b-0 hover:bg-orange-50">
                  <td className="px-4 py-3 font-bold">{order.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-bold">{order.customer?.name ?? "Walk-in"}</td>
                  <td className="px-4 py-3 font-bold">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block border-2 border-black px-2 py-0.5 text-xs font-black capitalize ${STATUS_STYLES[order.status] ?? "bg-gray-200"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black">{formatRupiah(Number(order.totalAmount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CaretLeft size={14} weight="bold" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
