import { TrendUp, CurrencyDollar, ShoppingCart, Trophy } from "@phosphor-icons/react";
import type { MonthlyReport } from "@/hooks/useMonthlyReport";

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SummaryCards({ report }: { report: MonthlyReport }) {
  return (
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
  );
}