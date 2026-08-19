import { formatRupiah } from "./SummaryCards";
import type { TopProductItem } from "@/hooks/useMonthlyReport";

export function TopProducts({ topProducts }: { topProducts: TopProductItem[] }) {
  return (
    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
      <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
        Top Products
      </h2>
      {topProducts.length === 0 ? (
        <p className="text-sm font-bold text-zinc-500">No data</p>
      ) : (
        <div className="space-y-2">
          {topProducts.map((p, idx) => (
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
  );
}