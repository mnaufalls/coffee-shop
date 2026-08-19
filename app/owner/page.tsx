"use client";

import { useEffect, useState } from "react";
import { Download, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useMonthlyReport } from "@/hooks/useMonthlyReport";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { DailyRevenueChart } from "@/components/dashboard/DailyRevenueChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { OrderStatusChart } from "@/components/dashboard/OrderStatusChart";
import { TopProducts } from "@/components/dashboard/TopProducts";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function OwnerDashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { report, isLoading, error, loadReport, exportCSV } = useMonthlyReport();

  useEffect(() => {
    loadReport(year, month);
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
          <h1 className="mt-2 text-3xl font-black font-[family-name:var(--font-bricolage)]">Owner Dashboard</h1>
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
            onClick={() => report && exportCSV(report, year, month)}
            disabled={!report}
            className="ml-4 flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} weight="bold" />
            Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="border-2 border-black bg-red-300 p-4 text-sm font-bold">{error}</div>
      )}

      {report && (
        <>
          <SummaryCards report={report} />
          <section className="grid gap-5 lg:grid-cols-2">
            <DailyRevenueChart dailyBreakdown={report.dailyBreakdown} year={year} month={month} />
            <CategoryBreakdown categoryBreakdown={report.categoryBreakdown} />
          </section>
          <section className="grid gap-5 lg:grid-cols-2">
            <OrderStatusChart orderStatusBreakdown={report.orderStatusBreakdown} />
            <TopProducts topProducts={report.topProducts} />
          </section>
        </>
      )}
    </main>
  );
}