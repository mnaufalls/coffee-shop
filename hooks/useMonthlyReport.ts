"use client";

import { useState } from "react";

export interface DailyBreakdownItem {
  day: number;
  orders: number;
  revenue: string;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  revenue: string;
}

export interface OrderStatusItem {
  status: string;
  count: number;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  quantity: number;
  revenue: string;
}

export interface MonthlyReport {
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

export function useMonthlyReport() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport(year: number, month: number) {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/reports/monthly?year=${year}&month=${month}`,
        { credentials: "include", cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Failed to fetch report");
      }
      setReport(json.data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report");
    } finally {
      setIsLoading(false);
    }
  }

  function exportCSV(report: MonthlyReport, year: number, month: number) {
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

  return {
    report,
    isLoading,
    error,
    loadReport,
    exportCSV,
  };
}