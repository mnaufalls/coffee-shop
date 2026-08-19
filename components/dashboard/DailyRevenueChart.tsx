import { useMemo } from "react";
import { formatRupiah } from "./SummaryCards";
import type { DailyBreakdownItem } from "@/hooks/useMonthlyReport";

export function DailyRevenueChart({
  dailyBreakdown,
  year,
  month,
}: {
  dailyBreakdown: DailyBreakdownItem[];
  year: number;
  month: number;
}) {
  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  const dailyMap = useMemo(() => {
    const map: Record<number, DailyBreakdownItem> = {};
    for (const d of dailyBreakdown) {
      map[d.day] = d;
    }
    return map;
  }, [dailyBreakdown]);

  const maxDailyRevenue = useMemo(() => {
    const max = dailyBreakdown.reduce((m, d) => Math.max(m, Number(d.revenue)), 0);
    return max || 1;
  }, [dailyBreakdown]);

  return (
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
  );
}