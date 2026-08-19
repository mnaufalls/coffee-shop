import { useMemo } from "react";
import { formatRupiah } from "./SummaryCards";
import type { CategoryBreakdownItem } from "@/hooks/useMonthlyReport";

export function CategoryBreakdown({
  categoryBreakdown,
}: {
  categoryBreakdown: CategoryBreakdownItem[];
}) {
  const maxCategoryRevenue = useMemo(() => {
    const max = categoryBreakdown.reduce((m, c) => Math.max(m, Number(c.revenue)), 0);
    return max || 1;
  }, [categoryBreakdown]);

  return (
    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
      <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
        Category Breakdown
      </h2>
      {categoryBreakdown.length === 0 ? (
        <p className="text-sm font-bold text-zinc-500">No data</p>
      ) : (
        <div className="space-y-3">
          {categoryBreakdown.map((cat) => {
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
  );
}