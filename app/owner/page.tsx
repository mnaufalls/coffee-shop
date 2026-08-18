"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendUp,
  CurrencyDollar,
  ShoppingCart,
  Trophy,
  Download,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

interface DailyBreakdownItem {
  day: number;
  orders: number;
  revenue: string;
}

interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  revenue: string;
}

interface OrderStatusItem {
  status: string;
  count: number;
}

interface TopProductItem {
  productId: string;
  productName: string;
  quantity: number;
  revenue: string;
}

interface MonthlyReport {
  year: number;
  month: number;
  totalOrders: number;
  totalRevenue: string;
  averagePerOrder: string;
  orderStatusBreakdown: OrderStatusItem[];
  dailyBreakdown: DailyBreakdownItem[];
  topProducts: TopProductItem[];
  categoryBreakdown: CategoryBreakdownItem[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
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

export default function OwnerDashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/reports/monthly?year=${year}&month=${month}`,
          { credentials: "include", cache: "no-store" }
        );
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          throw new Error(json.message ?? "Failed to fetch report");
        }
        setReport(json.data.report);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch report");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadReport();
    return () => { cancelled = true; };
  }, [year, month]);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const maxDailyRevenue = useMemo(() => {
    if (!report) return 1;
    const max = report.dailyBreakdown.reduce(
      (m, d) => Math.max(m, Number(d.revenue)),
      0
    );
    return max || 1;
  }, [report]);

  const maxCategoryRevenue = useMemo(() => {
    if (!report) return 1;
    const max = report.categoryBreakdown.reduce(
      (m, c) => Math.max(m, Number(c.revenue)),
      0
    );
    return max || 1;
  }, [report]);

  const maxStatusCount = useMemo(() => {
    if (!report) return 1;
    const max = report.orderStatusBreakdown.reduce(
      (m, s) => Math.max(m, s.count),
      0
    );
    return max || 1;
  }, [report]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const dailyMap = useMemo(() => {
    if (!report) return {};
    const map: Record<number, DailyBreakdownItem> = {};
    for (const d of report.dailyBreakdown) {
      map[d.day] = d;
    }
    return map;
  }, [report]);

  function exportCSV() {
    if (!report) return;

    const lines: string[] = [];
    lines.push("Metric,Value");
    lines.push(`Year,${report.year}`);
    lines.push(`Month,${report.month}`);
    lines.push(`Total Orders,${report.totalOrders}`);
    lines.push(`Total Revenue,${report.totalRevenue}`);
    lines.push(`Average Per Order,${report.averagePerOrder}`);
    lines.push("");
    lines.push("Daily Breakdown");
    lines.push("Day,Orders,Revenue");
    for (const d of report.dailyBreakdown) {
      lines.push(`${d.day},${d.orders},${d.revenue}`);
    }
    lines.push("");
    lines.push("Category Breakdown");
    lines.push("Category,Quantity,Revenue");
    for (const c of report.categoryBreakdown) {
      lines.push(`${c.categoryName},${c.quantity},${c.revenue}`);
    }
    lines.push("");
    lines.push("Top Products");
    lines.push("Product,Quantity,Revenue");
    for (const p of report.topProducts) {
      lines.push(`${p.productName},${p.quantity},${p.revenue}`);
    }
    lines.push("");
    lines.push("Order Status");
    lines.push("Status,Count");
    for (const s of report.orderStatusBreakdown) {
      lines.push(`${s.status},${s.count}`);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Coffee Shop</p>
          <h1 className="mt-2 text-3xl font-black font-[family-name:var(--font-bricolage)]">
            Owner Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="border-2 border-black bg-white p-2 shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <span className="min-w-[160px] text-center font-[family-name:var(--font-dm-sans)] font-bold">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="border-2 border-black bg-white p-2 shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <CaretRight size={18} weight="bold" />
          </button>

          <button
            onClick={exportCSV}
            disabled={!report}
            className="ml-4 flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} weight="bold" />
            Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">
          {error}
        </div>
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">Total Orders</p>
                  <p className="mt-2 text-4xl font-black">{report.totalOrders}</p>
                </div>
                <ShoppingCart size={36} weight="bold" />
              </div>
            </div>

            <div className="border-2 border-black bg-yellow-300 p-5 shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">Total Revenue</p>
                  <p className="mt-2 text-3xl font-black">{formatRupiah(Number(report.totalRevenue))}</p>
                </div>
                <CurrencyDollar size={36} weight="bold" />
              </div>
            </div>

            <div className="border-2 border-black bg-pink-300 p-5 shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">Avg per Order</p>
                  <p className="mt-2 text-3xl font-black">{formatRupiah(Number(report.averagePerOrder))}</p>
                </div>
                <TrendUp size={36} weight="bold" />
              </div>
            </div>

            <div className="border-2 border-black bg-green-200 p-5 shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">Top Product</p>
                  <p className="mt-2 text-xl font-black truncate">
                    {report.topProducts.length > 0 ? report.topProducts[0].productName : "-"}
                  </p>
                </div>
                <Trophy size={36} weight="bold" />
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="grid gap-5 lg:grid-cols-2">
            {/* Daily Revenue Bar Chart */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
              <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
                Daily Revenue
              </h2>
              <div className="flex items-end gap-1 h-48">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const item = dailyMap[day];
                  const revenue = item ? Number(item.revenue) : 0;
                  const heightPct = (revenue / maxDailyRevenue) * 100;
                  return (
                    <div key={day} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full border-2 border-black bg-orange-400 transition-all"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={`Day ${day}: ${formatRupiah(revenue)}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <div key={day} className="flex flex-1 text-center">
                    <span className="w-full text-[9px] font-bold">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
              <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
                Category Breakdown
              </h2>
              {report.categoryBreakdown.length === 0 ? (
                <p className="text-sm font-bold text-zinc-500">No data</p>
              ) : (
                <div className="space-y-3">
                  {report.categoryBreakdown.map((cat) => {
                    const pct = (Number(cat.revenue) / maxCategoryRevenue) * 100;
                    return (
                      <div key={cat.categoryId}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-bold">{cat.categoryName}</span>
                          <span className="text-xs font-bold">{formatRupiah(Number(cat.revenue))}</span>
                        </div>
                        <div className="h-6 w-full border-2 border-black bg-yellow-300" style={{ width: `${Math.max(pct, 5)}%` }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            {/* Order Status Distribution */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
              <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
                Order Status
              </h2>
              {report.orderStatusBreakdown.length === 0 ? (
                <p className="text-sm font-bold text-zinc-500">No data</p>
              ) : (
                <div className="space-y-3">
                  {report.orderStatusBreakdown.map((s) => {
                    const pct = (s.count / maxStatusCount) * 100;
                    return (
                      <div key={s.status}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-bold capitalize">{s.status}</span>
                          <span className="text-xs font-bold">{s.count}</span>
                        </div>
                        <div
                          className={`h-6 border-2 border-black ${STATUS_COLORS[s.status] ?? "bg-gray-300"}`}
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
              <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
                Top Products
              </h2>
              {report.topProducts.length === 0 ? (
                <p className="text-sm font-bold text-zinc-500">No data</p>
              ) : (
                <div className="space-y-2">
                  {report.topProducts.map((p, idx) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between border-b border-zinc-200 py-2 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-yellow-300 text-xs font-black">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold">{p.productName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black">{p.quantity} sold</p>
                        <p className="text-xs font-bold text-zinc-600">{formatRupiah(Number(p.revenue))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
